///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/actions/common.lib.js">
///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/actions/parseargs.lib.js">
///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/send-utils.js">


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
		comment = '', // comment may be used to the simple 'forward' operation, but is currently not used...
		commentArgs = null,
		
		operations = {
			
			'forward' : forward,
			'acceptAndForward' : acceptAndForward,
			'acceptForSignature' : acceptForSignature,
			'acceptAndSend' : acceptAndSend
			
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
		
		managerUserName = Utils.asString(parseArgs['manager']);
		if (!managerUserName) {
			if (isServiceManager) {
				managerUserName = fullyAuthenticatedUserName
			} else {
				throw {
					code : '512',
					message : 'IllegalStateException! The action cannot be executed by a service-assistant without providing a manager'
				}			
			}
		}
		
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
		
		main();
		
	});
	
	function checkOperationType(operation) {
		
		if (undefined !== operations[operation]) return '';
		return "The parameter 'operation' only accept values {accept, acceptAndForward, acceptForSignature, forward}";
		
	}
	
	function main() {
		
		operations[operation]();		
		setModel();
		addHistoryComment();
		
	}
	
	function acceptAndSend() {
		
		addHistoryComment(null, 'accept'); // add an accepting comment to history
		SendUtils.sendDocument(documentNode);
		
	}
	
	function acceptAndForward() {
		
		addHistoryComment(null, 'accept'); // add an accepting comment to history
		forward();
		// State is kept in validation
		
	}

	function acceptForSignature() {

		addHistoryComment(null, 'accept'); // add an accepting comment to history
		updateDocumentState(YammaModel.DOCUMENT_STATE_SIGNING);

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