///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/alfresco/extjs/yamma/actions/common/common.lib.js">
///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/alfresco/extjs/yamma/actions/common/parseargs.lib.js">
///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">

(function() {
	
	const ARCHIVE_DOCUMENT_EVENT_TYPE = 'archive';
	
	// PRIVATE
	var 
		fullyAuthenticatedUserName = Utils.getFullyAuthenticatedUserName(), /* string */
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
		
		if (!ActionUtils.canArchive(documentNode, fullyAuthenticatedUserName)) {
			throw {
				code : '403',
				message : 'Forbidden! The action cannot be executed by you in the current context'
			};			
		}
					
		main();
		
	});
	
	function main() {
		
		updateDocumentState();
		addHistoryComment();
		
		ArchivesUtils.moveToArchives(documentNode);
		setModel(documentNode);
		
	}
	
	function updateDocumentState() {
		documentNode.properties[YammaModel.STATUSABLE_STATE_PROPNAME] = YammaModel.DOCUMENT_STATE_ARCHIVED;				
		documentNode.save();
	}
	
	function udpateSentDate() {
		documentNode.properties[YammModel.SENT_BY_EMAIL_SENT_DATE_PROPNAME] = new Date();
		documentNode.save();
	}
	
	function addHistoryComment() {
		
		updateDocumentHistory('archiveDocument.comment');
	}
	
	function updateDocumentHistory(commentKey, args) {
		
		var message = msg.get(commentKey, args || []);
		
		// set a new history event
		HistoryUtils.addHistoryEvent(
			documentNode, 
			ARCHIVE_DOCUMENT_EVENT_TYPE, /* eventType */
			message /* comment */
		);
		
	}
	
	function setModel(documentNode) {
		model.documentNodeRef = Utils.asString(documentNode.nodeRef);
	}
	
	
})();