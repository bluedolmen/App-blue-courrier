///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/actions/common.lib.js">
///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/actions/parseargs.lib.js">
///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/alfresco/extjs/yamma/actions/nodeaction.lib.js">


(function() {
	
	
	const 
		REFUSE_REPLY_HISTORY_KEY = 'refuseReply.history',
		REFUSE_REPLY_COMMENT_TITLE_KEY = 'refuseReply.comment.title'
	;
	
	Yamma.Actions.RefuseReplyAction = Utils.Object.create(Yamma.Actions.ManagerDocumentNodeAction, {
		
		eventType : 'refuse-reply',
		
		comment : '(non renseign\u00E9)',
		assignedServiceName : '',

		wsArguments : [
			'comment'
		],
						
		prepare : function() {
			
			Yamma.Actions.ManagerDocumentNodeAction.prepare.call(this);
			this.comment = Utils.asString(this.parseArgs['comment']) || this.comment;
			
		},		
		
		isExecutable : function(node) {
			
			return (
				Yamma.Actions.ManagerDocumentNodeAction.isExecutable.apply(this, arguments) &&
				ActionUtils.canValidate(node, this.fullyAuthenticatedUserName) ||
				ActionUtils.canMarkAsSigned(node, this.fullyAuthenticatedUserName)
			);
			
		},
		
		doExecute : function(node) {

			this.updateDocumentState(YammaModel.DOCUMENT_STATE_REVISING);
			this.moveToInitiallyAssignedService();
			this.addHistoryComment();
			this.addComment();
			
		},
		
		moveToInitiallyAssignedService : function() {
			
			// And return the document in the initial (assigned) service
			var assignedServiceName = DocumentUtils.getAssignedServiceName(this.node);
			if (null == assignedServiceName) {
				throw {
					code : '512',
					message : 'IllegalStateException! While refusing, the assigned service cannot be found on the document and cannot be routed back'
				}
			}
			
			var errorMessage = DocumentUtils.moveToServiceTray(this.node, assignedServiceName, TraysUtils.INBOX_TRAY_NAME);
			if (errorMessage) {
				throw {
					code : '512',
					message : "IllegalStateException! While refusing, " + errorMessage
				};						
			}
	
			this.assignedServiceName = Utils.Alfresco.getSiteTitle(assignedServiceName);
			
		},
		
		addHistoryComment : function() {
			
			this.updateDocumentHistory(
				REFUSE_REPLY_HISTORY_KEY, 
				[ this.assignedServiceName ]
			);
			
		},		
		
		addComment : function() {
			
			var 
				currentService = DocumentUtils.getCurrentServiceSite(this.node),
				title = msg.get(REFUSE_REPLY_COMMENT_TITLE_KEY, [currentService.title]),
				htmlComment = ( 
					'<p>' +
					this.comment +
					'</p>'
				),
				isServiceManager = DocumentUtils.isServiceManager(this.node, this.fullyAuthenticatedUserName);
			;
			
			CommentUtils.addComment(this.node, {
				title : title,
				content : htmlComment,
				author : isServiceManager ? null : this.managerUserName
			});
			
		}
		
	});

	Yamma.Actions.RefuseReplyAction.execute();
	
})();