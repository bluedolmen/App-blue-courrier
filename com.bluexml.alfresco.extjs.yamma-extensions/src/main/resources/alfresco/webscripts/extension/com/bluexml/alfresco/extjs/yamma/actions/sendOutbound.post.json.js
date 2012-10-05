///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/alfresco/extjs/yamma/actions/common/common.lib.js">
///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/alfresco/extjs/yamma/actions/common/parseargs.lib.js">
///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">

(function() {
	
	const SEND_OUTBOUND_EVENT_TYPE = 'send-outbound';
	
	// PRIVATE
	var 
		fullyAuthenticatedUserName = Utils.getFullyAuthenticatedUserName(), /* string */
		documentNode, /* ScriptNode */ 
		sentByMail /* boolean */
	;
	
	// MAIN LOGIC
	
	Common.securedExec(function() {
		
		var 
			parseArgs = new ParseArgs({ name : 'nodeRef', mandatory : true}, { name : 'sentByMail', defaultValue : 'true' } ),
			documentNodeRef = parseArgs['nodeRef']
		;
		
		sentByMail = ( Utils.asString(parseArgs['sentByMail']) === 'true' );
		
		documentNode = search.findNode(documentNodeRef);
		if (!documentNode) {
			throw {
				code : '512',
				message : 'IllegalStateException! The provided nodeRef does not exist in the repository'
			};
		}
		
		if (!ActionUtils.canSendOutbound(documentNode, fullyAuthenticatedUserName)) {
			throw {
				code : '403',
				message : 'Forbidden! The action cannot be executed by you in the current context'
			};			
		}
					
		main();
		
	});
	
	function main() {
		
		updateDocumentState();
		manageSentByMail();
		addHistoryComment();
		setModel(documentNode);
		
	}
	
	function updateDocumentState() {
		
		// Now state the document as validating!delivery
		documentNode.properties[YammaModel.STATUSABLE_STATE_PROPNAME] = YammaModel.DOCUMENT_STATE_VALIDATING_PROCESSED;
		
		// Also update writing-date if not filled
		var writingDate = documentNode.properties[YammaModel.MAIL_WRITING_DATE_PROPNAME];
		if (!writingDate) {
			documentNode.properties[YammaModel.MAIL_WRITING_DATE_PROPNAME] = new Date();
		}
		
		documentNode.save();
		
	}
	
	function manageSentByMail() {
		if (sentByMail !== true) return;
		
		var 
			replies = ReplyUtils.getReplies(documentNode)
		;
			
		Utils.forEach(replies, function(reply) {
			reply.addAspect(YammaModel.SENT_BY_EMAIL_ASPECT_SHORTNAME);
		});
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
			replies.length > 1 ? 'sendOutboundMails.comment' : 'sendOutboundMail.comment', 
			[formattedRepliesTitle]
		);
	}
	
	function updateDocumentHistory(commentKey, args) {
		
		var message = msg.get(commentKey, args);
		
		// set a new history event
		HistoryUtils.addHistoryEvent(
			documentNode, 
			SEND_OUTBOUND_EVENT_TYPE, /* eventType */
			message /* comment */
		);
		
	}
	
	function setModel(documentNode) {
		model.documentNodeRef = Utils.asString(documentNode.nodeRef);
	}
	
	
})();