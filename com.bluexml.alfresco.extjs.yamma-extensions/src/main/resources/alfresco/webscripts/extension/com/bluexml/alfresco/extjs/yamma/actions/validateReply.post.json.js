///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/alfresco/extjs/yamma/actions/common/common.lib.js">
///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/alfresco/extjs/yamma/actions/common/parseargs.lib.js">
///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">

(function() {
	
	const VALIDATE_REPLY_EVENT_TYPE = 'validate-reply';
	
	// PRIVATE
	var fullyAuthenticatedUserName = Utils.getFullyAuthenticatedUserName();
	var documentNode;
	var operation;
	var comment = '(non renseigné)';
	
	// MAIN LOGIC
	
	Common.securedExec(function() {
		
		var parseArgs = new ParseArgs(
			{ name : 'nodeRef', mandatory : true}, 
			{ name : 'operation', mandatory : true, checkValue : checkOperationType }, 
			'comment'
		);
		var documentNodeRef = parseArgs['nodeRef'];
		documentNode = search.findNode(documentNodeRef);
		
		if (!documentNode) {
			throw {
				code : '512',
				message : 'IllegalStateException! The provided nodeRef does not exist in the repository'
			}
		}
		
		operation = parseArgs['operation'];
		comment = parseArgs['comment'] || comment;
					
		main();
		
	});
	
	function checkOperationType(operation) {
		if ('accept' == operation || 'refuse' == operation) return '';
		return "The parameter 'operation' only accept values {accept,refuse}";
	}
	
	function main() {
		
		switch (operation) {
			case 'accept':
				acceptReply();
				break;
			case 'refuse':
				refuseReply();
				break;
		}
		
	}
	
	function acceptReply() {
		var outboxTray = moveDocumentToOutbox();
		
		// Now state the document as validating!delivery
		documentNode.properties[YammaModel.STATUSABLE_STATE_PROPNAME] = YammaModel.DOCUMENT_STATE_PROCESSED;
		documentNode.save();

		setModel(operation, YammaModel.DOCUMENT_STATE_PROCESSED);
	}
	
	function refuseReply() {
		
		// Back to processing state
		documentNode.properties[YammaModel.STATUSABLE_STATE_PROPNAME] = YammaModel.DOCUMENT_STATE_PROCESSING;
		documentNode.save();
		
		setModel(operation, YammaModel.DOCUMENT_STATE_PROCESSING);
		
	}
	
	
	function moveDocumentToOutbox() {
		
		var enclosingTray = TraysUtils.getEnclosingTray(documentNode);
		if (!enclosingTray) throw 'Cannot get the enclosing tray';
		
		var outboxTray = TraysUtils.getSiblingTray(enclosingTray, TraysUtils.OUTBOX_TRAY_NAME);
		if (!outboxTray) throw 'Cannot get the outbox tray';

		var documentContainer = DocumentUtils.getDocumentContainer(documentNode);
		if (!documentContainer) throw 'Cannot get the document container';
				
		if (!documentContainer.move(outboxTray)) {
			throw 'Cannot move the document to the outbox container';
		}
		
		updateDocumentState();
		addHistoryComment();
		
		return outboxTray;
		
	}
	
	
	function updateDocumentState() {
		
		
	}
	
	function addHistoryComment() {
		
		var msgKey = operation + 'Reply.comment';
		updateDocumentHistory(msgKey, [comment]);
		
	}
	
	function updateDocumentHistory(commentKey, args) {
		
		var message = msg.get(commentKey, args);
		
		// set a new history event
		HistoryUtils.addHistoryEvent(
			documentNode, 
			VALIDATE_REPLY_EVENT_TYPE, /* eventType */
			message /* comment */
		);
		
	}
	
	function setModel(operation, newState) {
		model.operation = operation;
		model.newState = newState;
	}
	
	
})();