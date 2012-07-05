(function() {
	
	const HISTORY_CONTAINER_NAME = 'history';
	const GENERIC_EVENT_TYPENAME = 'Event';

	HistoryUtils = {
		
		createOrGetHistoryContainer : function(document) {
			
			var documentContainer = YammaUtils.getDocumentContainer(document);
			if (!documentContainer) {
				logger.warn('[HistoryUtils.createOrGetHistoryContainer] Cannot create the document-container.');
				return null;
			}
			
			// check existing
			var historyChild = documentContainer.childByNamePath(HISTORY_CONTAINER_NAME);
			if (historyChild) return historyChild;
			
			return documentContainer.createFolder(HISTORY_CONTAINER_NAME);
		},
		
		addHistoryEvent : function(document, eventType, comment, referrer) {
			
			var historyContainer = this.createOrGetHistoryContainer(document);
			if (!historyContainer) {
				logger.warn('[HistoryUtils.addHistoryEvent] Cannot add the history event (no history-container).');
				return null;
			}
			
			// Create the history event in the history-container of the document-container
			var properties = {};
			properties[YammaModel.EVENT_DATE_PROPNAME] = new Date();
			properties[YammaModel.EVENT_EVENT_TYPE_PROPNAME] = eventType || GENERIC_EVENT_TYPENAME;
			properties[YammaModel.EVENT_COMMENT_PROPNAME] = comment || '';
			properties[YammaModel.EVENT_REFERRER_PROPNAME] = referrer || Utils.getFullyAuthenticatedUserName();			
			
			var newEvent = historyContainer.createNode(null, YammaModel.EVENT_TYPE_SHORTNAME, properties);
			if (!newEvent) {
				logger.warn('[HistoryUtils.addHistoryEvent] Cannot create the history event.');
				return null;
			}
			
			// Also associate the event to the document-node
			document.createAssociation(newEvent, YammaModel.HISTORIZABLE_HISTORY_ASSOCNAME);
			
			return newEvent;
			
		}
		
	};

})();
