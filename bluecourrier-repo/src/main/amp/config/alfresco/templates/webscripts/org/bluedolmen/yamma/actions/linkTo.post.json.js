///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/nodeaction.lib.js">

(function() {
	
	function checkTargetNodeIsValid(targetRef) {
		
		var targetNode = Utils.Alfresco.getExistingNode(targetRef, true /* failSilently */);
		if (null == targetNode) {
			'The target node has to be a valid existing node';
		}
		
	}
	
	Yamma.Actions.LinkToAction = Utils.Object.create(Yamma.Actions.DocumentNodeAction, {
		
		eventType : 'linkTo',
		
		targetNode : null,
		linkType : 'reply-to',
		comment : null,
		
		wsArguments : [
   			{ name : 'targetRef', mandatory : true, checkValue : checkTargetNodeIsValid }, 
   			'linkType',
   			'comment'
   		],
   				
   		prepare : function() {
   			
   			this.targetNode = Utils.Alfresco.getExistingNode(this.parseArgs['targetRef']);
   			
   			var linkType = Utils.asString(this.parseArgs['linkType']);
   			if (null != linkType && linkType != this.linkType) {
   				throw {
   					code : 400,
   					message : 'The service does not yet accept other links than replies.'
   				};
   			}
   			
   			this.comment = Utils.asString(this.parseArgs['comment']);
   			
   		},		

		
		isExecutable : function(node) {
			
			// Check whether the document is an incoming-document
			if (!MailUtils.isIncomingMail(node)) return false;
			
			return true;
			
		},
		
		doExecute : function(node) {
			
			ReplyUtils.addReply(
				this.targetNode, /* document */
				node, /* replyNode */
				false, /* moveInside */
				true /* omitHistoryEvent */
			);
			
			var 
				targetDisplayText = DocumentUtils.displayText(this.targetNode),
				_comment = this.comment ? '.' + this.comment : ''
			;
			
			this.updateDocumentHistory('link.reply', [targetDisplayText, _comment]);
			
		}
		
	});

	Yamma.Actions.LinkToAction.execute();	
	
})();