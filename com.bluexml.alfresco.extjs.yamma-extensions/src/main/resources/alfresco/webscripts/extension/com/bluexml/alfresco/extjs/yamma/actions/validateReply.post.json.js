///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/actions/common.lib.js">
///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/actions/parseargs.lib.js">
///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">

(function() {
	
	const 
		VALIDATE_REPLY_EVENT_TYPE = 'validate-reply',
		MSG_KEY_SUFFIX = 'Reply.comment'
	;
	
	// PRIVATE
	var 
		fullyAuthenticatedUserName = Utils.Alfresco.getFullyAuthenticatedUserName(),
		isServiceManager = ServicesUtils.isServiceManager(fullyAuthenticatedUserName),
		managerUserName = null,
		documentNode = null,
		operation = null,
		service = null,
		comment = '',
		commentArgs = null,
		
		operations = {
			
			'accept' : accept,
			'refuse' : refuse,
			'forward' : forward,
			'acceptAndForward' : acceptAndForward,
			'acceptForSignature' : acceptForSignature
			
		}
	;
	
	// MAIN LOGIC
	
	Common.securedExec(function() {
		
		var 
			parseArgs = new ParseArgs(
				{ name : 'nodeRef', mandatory : true}, 
				{ name : 'operation', mandatory : true, checkValue : checkOperationType }, 
				'comment',
				'service',
				'manager'
			),
			documentNodeRef = parseArgs['nodeRef']
		;
		
		documentNode = search.findNode(documentNodeRef);		
		if (!documentNode) {
			throw {
				code : '512',
				message : 'IllegalStateException! The provided nodeRef does not exist in the repository'
			};
		}
		
		if (!ActionUtils.canValidate(documentNode, fullyAuthenticatedUserName)) {
			throw {
				code : '403',
				message : 'Forbidden! The action cannot be executed by you in the current context'
			}
		}		
		
		operation = Utils.asString(parseArgs['operation']);
		comment = Utils.asString(parseArgs['comment']) || comment;
		service = Utils.asString(parseArgs['service']);
		
		
		if (isServiceManager) {
			managerUserName = fullyAuthenticatedUserName
		} else {
			managerUserName = Utils.asString(parseArgs['service']);
			if (!managerUserName) {
				throw {
					code : '512',
					message : 'IllegalStateException! The action cannot be executed by a service-assistant without providing a manager'
				}			
			}
		}
		
		main();
		
	});
	
	function checkOperationType(operation) {
		
		if (undefined !== operations[operation]) return '';
		return "The parameter 'operation' only accept values {accept, acceptAndForward, acceptForSignature, refuse, forward}";
		
	}
	
	function main() {
		
		operations[operation]();		
		setModel();
		addHistoryComment();
		
	}
	
	function accept() {
		
		// Move to outbox of the same service
		var errorMessage = DocumentUtils.moveToSiblingTray(documentNode, TraysUtils.OUTBOX_TRAY_NAME);
		if (errorMessage) {
			throw {
				code : '512',
				message : 'IllegalStateException! While accepting, ' + errorMessage
			};			
		}

		updateDocumentState(YammaModel.DOCUMENT_STATE_SENDING);
		
	}
	
	function acceptAndForward() {
		
		addHistoryComment(null, 'accept'); // add an accepting comment to history
		forward();
		// State is kept in validation
		
	}
	
	function acceptForSignature() {

		updateDocumentState(YammaModel.DOCUMENT_STATE_SIGNING);

	}
	
	function refuse() {
		
		// Back to processing state
		updateDocumentState(YammaModel.DOCUMENT_STATE_REVISING);
		
		// And return the document in the initial (assigned) service
		var assignedServiceName = DocumentUtils.getAssignedServiceName(documentNode);
		if (null == assignedServiceName) {
			throw {
				code : '512',
				message : 'IllegalStateException! While refusing, the assigned service cannot be found on the document and cannot be routed back'
			}
		}
		
		var errorMessage = DocumentUtils.moveToServiceTray(documentNode, assignedServiceName, TraysUtils.INBOX_TRAY_NAME);
		if (errorMessage) {
			throw {
				code : '512',
				message : "IllegalStateException! While refusing, " + errorMessage
			};						
		}

		commentArgs = [
			comment ? (' : ' + comment) : ' (non renseign\u00E9)', 
			Utils.Alfresco.getSiteTitle(assignedServiceName)
		];
		
	}
	
	function forward() {
		
		if (!service) {
			throw {
				code : '512',
				message : 'IllegalStateException! The service is mandatory when performing a delegation of validation'
			};			
		}

		var errorMessage = DocumentUtils.moveToServiceTray(documentNode, service);
		if (errorMessage) {
			throw {
				code : '512',
				message : "IllegalStateException! While refusing, " + errorMessage
			};						
		}
		
		commentArgs = [
			Utils.Alfresco.getSiteTitle(service), 
			comment ? (' : ' + comment) : ''
		];
		
	}
	
	
	
	function updateDocumentState(newState) {
		
		documentNode.properties[YammaModel.STATUSABLE_STATE_PROPNAME] = newState;
		documentNode.save();
		
	}
	
	function addHistoryComment(customArgs, forcedOperation) {
		
		commentArgs = customArgs || commentArgs || [comment];
		
		var msgKey = (forcedOperation || operation) + MSG_KEY_SUFFIX;
		updateDocumentHistory(msgKey, commentArgs);
		
	}
	
	function updateDocumentHistory(commentKey, args) {
		
		var message = msg.get(commentKey, args);
		
		// set a new history event
		HistoryUtils.addHistoryEvent(
			documentNode, 
			VALIDATE_REPLY_EVENT_TYPE + '!' + operation, /* eventType */
			message, /* comment */
			managerUserName, /* referrer */
			fullyAuthenticatedUserName /* delegate */
		);
		
	}
	
	function setModel() {
		
		model.operation = operation;
		model.newState = documentNode.properties[YammaModel.STATUSABLE_STATE_PROPNAME];
		
	}
	
	
})();