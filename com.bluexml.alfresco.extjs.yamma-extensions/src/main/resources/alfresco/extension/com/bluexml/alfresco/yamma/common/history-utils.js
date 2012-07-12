(function() {
	
	const GENERIC_EVENT_TYPENAME = 'Event';

	HistoryUtils = {
		
		addHistoryEvent : function(document, eventType, comment, referrer) {
			
			// Create the history event in the history-container of the document-container
			var properties = {};
			properties[YammaModel.EVENT_DATE_PROPNAME] = new Date();
			properties[YammaModel.EVENT_EVENT_TYPE_PROPNAME] = eventType || GENERIC_EVENT_TYPENAME;
			properties[YammaModel.EVENT_COMMENT_PROPNAME] = comment || '';
			properties[YammaModel.EVENT_REFERRER_PROPNAME] = referrer || Utils.getFullyAuthenticatedUserName();			
			
			var newEvent = document.createNode(null, YammaModel.EVENT_TYPE_SHORTNAME, properties, YammaModel.HISTORIZABLE_HISTORY_ASSOCNAME);
			if (!newEvent) {
				logger.warn('[HistoryUtils.addHistoryEvent] Cannot create the history event.');
				return null;
			}
			
			return newEvent;
			
		},
		
		getHistoryEvents : function(document) {
			
			if (!document) return [];			
			if (document.isSubType && !document.isSubType(YammaModel.DOCUMENT_TYPE_SHORTNAME)) return [];
			
			var events = document.childAssocs[YammaModel.HISTORIZABLE_HISTORY_ASSOCNAME];
			if (!events) return [];
			
			return events;
			
		}
		
		
	};

})();
