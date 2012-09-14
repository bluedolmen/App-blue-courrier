///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/alfresco/extjs/yamma/actions/common/common.lib.js">
///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/alfresco/extjs/yamma/actions/common/parseargs.lib.js">
///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">

(function() {
	
	const SEND_REPLY_EVENT_TYPE = 'send-reply';
	
	// PRIVATE
	var fullyAuthenticatedUserName = Utils.getFullyAuthenticatedUserName();
	var documentNode;
	
	// MAIN LOGIC
	
	Common.securedExec(function() {
		
		var parseArgs = new ParseArgs({ name : 'nodeRef', mandatory : true});
		var documentNodeRef = parseArgs['nodeRef'];
		documentNode = search.findNode(documentNodeRef);
		
		if (!documentNode) {
			throw {
				code : '512',
				message : 'IllegalStateException! The provided nodeRef does not exist in the repository'
			}
		}
		
		var documentHasReplies = ReplyUtils.hasReplies(documentNode);
		if (!ActionUtils.canReply(documentNode, fullyAuthenticatedUserName) || !documentHasReplies) {
			throw {
				code : '403',
				message : 'Forbidden! The action cannot be executed by you in the current context'
			}			
		}
					
		main();
		
	});
	
	function main() {
		
		updateDocumentState();
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
	
	function addHistoryComment() {
		
		var replies = ReplyUtils.getReplies(documentNode);
		
		var formattedRepliesTitle = Utils.reduce(
			replies, 
			function(replyNode, aggregateValue, isLast) {
				var replyTitle = replyNode.properties.title || replyNode.name;
				return aggregateValue + replyTitle + (isLast ? '' : ', ');
			},
			''
		);
		
		updateDocumentHistory(
			replies.length > 1 ? 'sendReplies.comment' : 'sendReply.comment', 
			[formattedRepliesTitle]
		);
	}
	
	function updateDocumentHistory(commentKey, args) {
		
		var message = msg.get(commentKey, args);
		
		// set a new history event
		HistoryUtils.addHistoryEvent(
			documentNode, 
			SEND_REPLY_EVENT_TYPE, /* eventType */
			message /* comment */
		);
		
	}
	
	function setModel(documentNode) {
		model.documentNodeRef = Utils.asString(documentNode.nodeRef);
	}
	
	
})();