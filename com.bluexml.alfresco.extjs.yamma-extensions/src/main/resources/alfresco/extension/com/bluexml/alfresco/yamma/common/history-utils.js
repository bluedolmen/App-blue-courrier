(function() {
	
	const GENERIC_EVENT_TYPENAME = 'Event';

	HistoryUtils = {
		
		addHistoryEvent : function(document, eventType, comment, referrer, delegate) {
			
			// Create the history event in the history-container of the document-container
			var
				referrerUserName = null != referrer
					? Utils.Alfresco.getPersonUserName(referrer) 
					: Utils.Alfresco.getFullyAuthenticatedUserName(),
				delegateUserName = null != delegate 
					? Utils.Alfresco.getPersonUserName(delegate) 
					: null,  
				properties = {}
			;
			properties[YammaModel.EVENT_DATE_PROPNAME] = new Date();
			properties[YammaModel.EVENT_EVENT_TYPE_PROPNAME] = eventType || GENERIC_EVENT_TYPENAME;
			properties[YammaModel.EVENT_COMMENT_PROPNAME] = comment || '';
			properties[YammaModel.EVENT_REFERRER_PROPNAME] = referrerUserName;
			if (delegateUserName != referrerUserName) {
				properties[YammaModel.EVENT_DELEGATE_PROPNAME] = delegateUserName;
			}
			
			var newEvent = document.createNode(null, YammaModel.EVENT_TYPE_SHORTNAME, properties, YammaModel.HISTORIZABLE_HISTORY_ASSOCNAME);
			if (null == newEvent) {
				logger.warn('[HistoryUtils.addHistoryEvent] Cannot create the history event.');
				return null;
			}
			
			return newEvent;
			
		},
		
		getHistoryEvents : function(document, filteredType, ascending) {
			
			if (!DocumentUtils.isDocumentNode(document)) return [];
			
			var events = document.childAssocs[YammaModel.HISTORIZABLE_HISTORY_ASSOCNAME];
			if (null == events) return [];
			
			filteredType = Utils.wrapString(filteredType);
			return Utils.filter(events, function(event) {
				return filteredType == Utils.asString(event.properties[YammaModel.EVENT_EVENT_TYPE_PROPNAME]);
			});
			
			return events;
			
//			var 
//				luceneQuery = ( 
//					'+PRIMARYPARENT:"' + document.nodeRef + '"' +
//					' +TYPE:"' + YammaModel.EVENT_TYPE_SHORTNAME + '"'
//				)
//			;
//			
//			if (null != filteredType) {
//				luceneQuery += ' +' + Utils.Alfresco.getLuceneAttributeFilter(YammaModel.EVENT_EVENT_TYPE_PROPNAME, filteredType);
//			}
//			
//			var result = search.luceneSearch({
//				query : luceneQuery,
//				sort : [ {
//					column : '@' + EVENT_DATE_PROPNAME,
//					ascending : (true === ascending)
//				}]
//			}) || [];
//			
//			return result;
			
		}
		
		
	};

})();
