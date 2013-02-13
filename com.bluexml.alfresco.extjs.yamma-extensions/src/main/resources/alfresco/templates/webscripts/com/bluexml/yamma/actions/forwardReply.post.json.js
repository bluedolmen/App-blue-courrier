///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/templates/webscripts/com/bluexml/yamma/actions/nodeaction.lib.js">


(function() {
	
	Yamma.Actions.ForwardReplyAction = Utils.Object.create(Yamma.Actions.ManagerDocumentNodeAction, {
		
		eventType : 'forward-reply',
		
		service : null,
		comment : '', // comment may be used to the simple 'forward' operation, but is currently not used...
		approbe : true,
		
		wsArguments : [
			'comment',
			'service',
			{ name : 'approbe', defaultValue : 'true' }
		],
				
		prepare : function() {
			
			Yamma.Actions.ManagerDocumentNodeAction.prepare.call(this);
			
			this.approbe = Utils.asString(this.parseArgs['approbe']) !== 'false';
			
			this.comment = Utils.asString(this.parseArgs['comment']) || this.comment;
			
			this.service = Utils.asString(this.parseArgs['service']);
			if (!this.service) {
				throw {
					code : '512',
					message : 'IllegalStateException! The service is mandatory when performing a delegation of validation'
				};			
			}
			
		},		
		
		isExecutable : function(node) {
			
			return (
				Yamma.Actions.ManagerDocumentNodeAction.isExecutable.apply(this, arguments) &&
				ActionUtils.canValidate(this.node, this.fullyAuthenticatedUserName)
			);
			
		},
		
		doExecute : function(node) {
			
			this.forward();		
			this.addHistoryComment();
			
		},
			
		forward : function() {
	
			var errorMessage = DocumentUtils.moveToServiceTray(this.node, this.service);
			if (errorMessage) {
				throw {
					code : '512',
					message : "IllegalStateException! While refusing, " + errorMessage
				};						
			}
			
			
		},		
				
		addHistoryComment : function() {
			
			var commentArgs = [
				Utils.Alfresco.getSiteTitle(this.service), 
				this.comment ? (' : ' + this.comment) : ''
			];
			
			this.updateDocumentHistory(
				this.approbe ? 'acceptAndForwardReply.comment' : 'forwardReply.comment', /* msgKey */ 
				commentArgs
			);
			
		}
		
	});

	Yamma.Actions.ForwardReplyAction.execute();

})();