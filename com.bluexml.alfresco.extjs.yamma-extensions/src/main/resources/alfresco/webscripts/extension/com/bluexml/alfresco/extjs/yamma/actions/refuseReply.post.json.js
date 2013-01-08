///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/actions/common.lib.js">
///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/actions/parseargs.lib.js">
///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">


(function() {
	
	const 
		REFUSE_REPLY_EVENT_TYPE = 'refuse-reply',
		REFUSE_REPLY_HISTORY_KEY = 'refuseReply.history',
		REFUSE_REPLY_COMMENT_TITLE_KEY = 'refuseReply.comment.title'
	;
	
	// PRIVATE
	var 
		fullyAuthenticatedUserName = Utils.Alfresco.getFullyAuthenticatedUserName(),
		isServiceManager = ServicesUtils.isServiceManager(fullyAuthenticatedUserName),
		managerUserName = null,
		documentNode = null,
		currentService = null,
		comment = '(non renseign\u00E9)',
		assignedServiceName = ''
	;
	
	// MAIN LOGIC
	
	Common.securedExec(function() {
		
		var 
			parseArgs = new ParseArgs(
				{ name : 'nodeRef', mandatory : true}, 
				'comment',
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
		
		if (
			!ActionUtils.canValidate(documentNode, fullyAuthenticatedUserName) &&
			!ActionUtils.canMarkAsSigned(documentNode, fullyAuthenticatedUserName)
		) {
			throw {
				code : '403',
				message : 'Forbidden! The action cannot be executed by you in the current context'
			}
		}		
		
		currentService = DocumentUtils.getCurrentServiceSite(documentNode);
		comment = Utils.asString(parseArgs['comment']) || comment;		
		
		main();
		
	});
		
	function main() {
		
		updateDocumentState();
		moveToInitiallyAssignedService();
		updateDocumentHistory();
		addComment();
		setModel();
		
	}
	
	function updateDocumentState() {
		
		documentNode.properties[YammaModel.STATUSABLE_STATE_PROPNAME] = YammaModel.DOCUMENT_STATE_REVISING;
		documentNode.save();
		
	}
	
	function moveToInitiallyAssignedService() {
		
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

		assignedServiceName = Utils.Alfresco.getSiteTitle(assignedServiceName);
		
	}
	
	function addComment() {
		
		var 
			title = msg.get(REFUSE_REPLY_COMMENT_TITLE_KEY, [currentService.title]),
			htmlComment = 
			'<p>' +
			comment +
			'</p>'
		;
		
		CommentUtils.addComment(documentNode, {
			title : title,
			content : htmlComment,
			author : isServiceManager ? null : managerUserName
		});
		
	}
	
	function updateDocumentHistory() {
		
		var message = msg.get(REFUSE_REPLY_HISTORY_KEY, [assignedServiceName]);
		
		// set a new history event
		HistoryUtils.addHistoryEvent(
			documentNode, 
			REFUSE_REPLY_EVENT_TYPE, /* eventType */
			message, /* comment */
			managerUserName, /* referrer */
			fullyAuthenticatedUserName /* delegate */
		);
		
	}
	
	
	function setModel() {
		
		model.newState = documentNode.properties[YammaModel.STATUSABLE_STATE_PROPNAME];
		
	}
	
	
})();