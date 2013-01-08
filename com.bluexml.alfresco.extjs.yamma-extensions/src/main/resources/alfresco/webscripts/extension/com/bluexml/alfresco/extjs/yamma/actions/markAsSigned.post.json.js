///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/actions/common.lib.js">
///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/actions/parseargs.lib.js">
///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/outmail-utils.js">
///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/send-utils.js">

(function() {
	
	const SIGNED_OUTBOUND_EVENT_TYPE = 'signed-outbound';
	
	// PRIVATE
	var 
		fullyAuthenticatedUserName = Utils.Alfresco.getFullyAuthenticatedUserName(), /* string */
		documentNode /* ScriptNode */
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
		
		if (!ActionUtils.canMarkAsSigned(documentNode, fullyAuthenticatedUserName)) {
			throw {
				code : '403',
				message : 'Forbidden! The action cannot be executed by you in the current context'
			};			
		}
		
		main();
		
	});
	
	function main() {
		
		SendUtils.sendDocument(documentNode);		
		addHistoryComment();		
		setModel(documentNode);
		
	}	
	
	function addHistoryComment() {
		
		var 
			replies = ReplyUtils.getReplies(documentNode),
			replyNames = Utils.map(replies, function(replyNode) {
				return replyNode.properties.title || replyNode.name;
			}),			
			formattedRepliesTitle = Utils.String.join(replyNames, ',')
		;
		
		updateDocumentHistory(
			replies.length > 1 ? 'signedOutboundMails.comment' : 'signedOutboundMail.comment', 
			[formattedRepliesTitle]
		);
	}
	
	function updateDocumentHistory(commentKey, args) {
		
		var message = msg.get(commentKey, args || []);
		
		// set a new history event
		HistoryUtils.addHistoryEvent(
			documentNode, 
			SIGNED_OUTBOUND_EVENT_TYPE, /* eventType */
			message /* comment */
		);
		
	}
	
	function setModel(documentNode) {
		model.documentNodeRef = Utils.asString(documentNode.nodeRef);
	}
	
	
})();