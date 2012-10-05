///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/outmail-utils.js">

(function() {
	
	var 
		childAssoc = behaviour.args[0],
		isNew = behaviour.args[1],
		tray = childAssoc.getParent(),
		documentContainer = childAssoc.getChild()
	;	
	
	if (
			/* The tray is not an inbox */
			!TraysUtils.isOutboxTray(tray) ||
			
			/* The document is new */
			isNew ||
			
			/* The new document is not a document-container */
			!DocumentUtils.isDocumentContainer(documentContainer)
			
	) {
		return;
	}

	var document = ( documentContainer.assocs[YammaModel.DOCUMENT_CONTAINER_REFERENCE_ASSOCNAME] || [])[0];
	if (
		!document ||
		!OutcomingMailUtils.isSentByMail(document)
	) {
		return;
	}

	OutcomingMailUtils.sendMail(document);
	
})();
