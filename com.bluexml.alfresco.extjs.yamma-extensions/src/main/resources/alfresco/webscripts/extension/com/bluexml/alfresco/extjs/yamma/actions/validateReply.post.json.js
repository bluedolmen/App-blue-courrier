///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/alfresco/extjs/yamma/actions/common/common.lib.js">
///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/alfresco/extjs/yamma/actions/common/parseargs.lib.js">
///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">

(function() {
	
	const VALIDATE_REPLY_EVENT_TYPE = 'validate-reply';
	
	// PRIVATE
	var 
		documentNode = null,
		documentContainer = null,
		operation = null,
		comment = '(non renseigné)',
		service = null
	;
	
	// MAIN LOGIC
	
	Common.securedExec(function() {
		
		var parseArgs = new ParseArgs(
			{ name : 'nodeRef', mandatory : true}, 
			{ name : 'operation', mandatory : true, checkValue : checkOperationType }, 
			'comment',
			'service'
		);
		var documentNodeRef = parseArgs['nodeRef'];
		documentNode = search.findNode(documentNodeRef);
		documentContainer = DocumentUtils.getDocumentContainer(documentNode) || documentNode;
		
		if (!documentNode) {
			throw {
				code : '512',
				message : 'IllegalStateException! The provided nodeRef does not exist in the repository'
			};
		}
		
		operation = Utils.asString(parseArgs['operation']);
		comment = Utils.asString(parseArgs['comment']) || comment;
		service = Utils.asString(parseArgs['service']);
					
		main();
		
	});
	
	function checkOperationType(operation) {
		if ('accept' == operation || 'refuse' == operation || 'delegate' == operation) return '';
		return "The parameter 'operation' only accept values {accept, refuse, delegate}";
	}
	
	function main() {
		
		switch(operation) {
			case 'accept':
				acceptReply();
			break;
			case 'refuse':
				refuseReply();
			break;
			case 'delegate':
				delegateReply();
			break;
			default:
				logger.warn('cannot find any operation to perform');
				setModel('unknown',documentNode.properties[YammaModel.STATUSABLE_STATE_PROPNAME]);
		}
		
	}
	
	function acceptReply() {
		moveDocumentToOutbox();
		addHistoryComment();
		
		// Now state the document as validating!delivery
		updateDocumentState(YammaModel.DOCUMENT_STATE_SENDING);
		setModel(operation, YammaModel.DOCUMENT_STATE_SENDING);
		
	}
	
	function moveDocumentToOutbox() {
		
		var enclosingTray = TraysUtils.getEnclosingTray(documentNode);
		if (!enclosingTray) throw '[accept] Cannot get the enclosing tray';
		
		var outboxTray = TraysUtils.getSiblingTray(enclosingTray, TraysUtils.OUTBOX_TRAY_NAME);
		if (!outboxTray) throw '[accept] Cannot get the outbox tray';

		if (!documentContainer.move(outboxTray)) {
			throw '[accept] Cannot move the document to the outbox container';
		}		
		
		return outboxTray;
		
	}	
	
	function refuseReply() {
		
		// Back to processing state
		updateDocumentState(YammaModel.DOCUMENT_STATE_PROCESSING);		
		setModel(operation, YammaModel.DOCUMENT_STATE_PROCESSING);
		
	}
	
	function delegateReply() {
		
		if (!service) {
			throw {
				code : '512',
				message : 'IllegalStateException! The service is mandatory when performing a delegation of validation'
			};			
		}
		
		var
			siteName = service,
			siteInboxTray = TraysUtils.getSiteTray(siteName, TraysUtils.INBOX_TRAY_NAME);
		;		
		if (!siteInboxTray) throw "[delegate] Cannot get the site inbox tray of service '" + siteName + "'";
		
		if (!documentContainer.move(siteInboxTray)) {
			throw "[delegate] Cannot move the provied document to the site inbox tray of service '" + siteName + "'";
		}

		addHistoryComment([siteName, comment ? ' : ' + comment : '']);
		setModel(operation, documentNode.properties[YammaModel.STATUSABLE_STATE_PROPNAME]);
	}
	
	
	
	function updateDocumentState(newState) {
		documentNode.properties[YammaModel.STATUSABLE_STATE_PROPNAME] = newState;
		documentNode.save();		
	}
	
	function addHistoryComment(commentArgs) {
		commentArgs = commentArgs || [comment];
		
		var msgKey = operation + 'Reply.comment';
		updateDocumentHistory(msgKey, commentArgs);
		
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