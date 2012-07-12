///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/alfresco/extjs/yamma/actions/common/common.lib.js">
///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/alfresco/extjs/yamma/actions/common/parseargs.lib.js">
///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">

(function() {
	
	const PROCESSING_EVENT_TYPE = 'processing';

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
				message : 'InvalidStateException! The provided nodeRef does not exist in the repository'
			}
		}
		
		if (!ActionUtils.canTakeProcessing(documentNode, fullyAuthenticatedUserName)) {
			throw {
				code : '403.1',
				message : 'Forbidden! The action cannot be executed by you in the current context'
			}			
		}
		
		main();
	});
	
	function main() {
		
		updateDocumentState();
		updateDocumentHistory(
			'takeProcessing.comment', 
			Utils.wrapAsList(Utils.getPersonUserName(fullyAuthenticatedUserName)) 
		);
		
		setModel();
		
	}
	
	function updateDocumentState() {
		
		documentNode.properties[YammaModel.STATUSABLE_STATE_PROPNAME] = YammaModel.DOCUMENT_STATE_PROCESSING;
		documentNode.save();
		
	}
	
	function updateDocumentHistory(commentKey, args) {
		
		var message = msg.get(commentKey, args);
		
		// set a new history event
		HistoryUtils.addHistoryEvent(
			documentNode, 
			PROCESSING_EVENT_TYPE, /* eventType */
			message /* comment */
		);
		
	}
	
	
	function setModel() {
		model.documentNodeRef = Utils.asString(documentNode.nodeRef);
	}
	
	
})();