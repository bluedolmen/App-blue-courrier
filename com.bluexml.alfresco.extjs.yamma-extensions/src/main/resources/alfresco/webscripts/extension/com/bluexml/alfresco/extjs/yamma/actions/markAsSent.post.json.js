///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/alfresco/extjs/yamma/actions/common/common.lib.js">
///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/alfresco/extjs/yamma/actions/common/parseargs.lib.js">
///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/outmail-utils.js">

(function() {
	
	const SENT_OUTBOUND_EVENT_TYPE = 'sent-outbound';
	
	// PRIVATE
	var 
		fullyAuthenticatedUserName = Utils.getFullyAuthenticatedUserName(), /* string */
		documentNode /* ScriptNode */,
		outboundDocumentNode /* ScriptNode */
	;
	
	// MAIN LOGIC
	
	Common.securedExec(function() {
		
		var 
			parseArgs = new ParseArgs({ name : 'nodeRef', mandatory : true}),
			documentNodeRef = parseArgs['nodeRef']
		;
		
		documentNode = search.findNode(documentNodeRef);
		if (!documentNode) {
			throw {
				code : '512',
				message : 'IllegalStateException! The provided nodeRef does not exist in the repository'
			};
		}
		
		if (!ActionUtils.canMarkAsSent(documentNode, fullyAuthenticatedUserName)) {
			throw {
				code : '403',
				message : 'Forbidden! The action cannot be executed by you in the current context'
			};			
		}
		
		outboundDocumentNode = OutcomingMailUtils.getOutcomingMail(documentNode) || documentNode;
		
		main();
		
	});
	
	function main() {
		
		updateDocumentState();
		updateOutboundMailSentDate();
		
		addHistoryComment();
		sendByMailIfNecessary();
		setModel(documentNode);
		
	}
	
	function updateDocumentState() {
		documentNode.properties[YammaModel.STATUSABLE_STATE_PROPNAME] = YammaModel.DOCUMENT_STATE_PROCESSED;				
		documentNode.save();
	}
	
	function updateOutboundMailSentDate() {
		outboundDocumentNode.properties[YammaModel.MAIL_SENT_DATE_PROPNAME] = new Date();
		outboundDocumentNode.save();
	}
	
	function sendByMailIfNecessary() {
		if (!OutcomingMailUtils.isSentByMail(documentNode)) return;
		var errorMessage = OutcomingMailUtils.sendMail(documentNode);
		
		if (errorMessage) {
			// Failed sending the mail
			updateDocumentHistory('sentEmail.failure.comment', [errorMessage]);
		} else {
			updateDocumentHistory('sentEmail.success.comment');
		}
		
	}
	
	function addHistoryComment() {
		
		var 
			replies = ReplyUtils.getReplies(documentNode),
			formattedRepliesTitle = Utils.reduce(
				replies, 
				function(replyNode, aggregateValue, isLast) {
					var replyTitle = replyNode.properties.title || replyNode.name;
					return aggregateValue + replyTitle + (isLast ? '' : ', ');
				},
				''
			)
		;
		
		updateDocumentHistory(
			replies.length > 1 ? 'sentOutboundMails.comment' : 'sentOutboundMail.comment', 
			[formattedRepliesTitle]
		);
	}
	
	function updateDocumentHistory(commentKey, args) {
		
		var message = msg.get(commentKey, args || []);
		
		// set a new history event
		HistoryUtils.addHistoryEvent(
			documentNode, 
			SENT_OUTBOUND_EVENT_TYPE, /* eventType */
			message /* comment */
		);
		
	}
	
	function setModel(documentNode) {
		model.documentNodeRef = Utils.asString(documentNode.nodeRef);
	}
	
	
})();