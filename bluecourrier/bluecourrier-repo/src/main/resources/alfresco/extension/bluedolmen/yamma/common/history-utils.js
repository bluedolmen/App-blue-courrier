(function() {
	
	var GENERIC_EVENT_TYPENAME = 'Event';

	HistoryUtils = {
		
		/**
		 * Wrapper using config instead of developed parameters 
		 */
		addEvent : function(document, eventTypeOrConfig, comment) {
			
			if (null == document) {
				throw new Error('IllegalArgumentException! The document node is mandatory');
			}
			
			var
				config = Utils.isString(eventTypeOrConfig) ? {} : eventTypeOrConfig,
				eventType = (Utils.isString(eventTypeOrConfig) ? eventTypeOrConfig : config.eventType) || GENERIC_EVENT_TYPENAME,
				referrer = config.referrer,
				delegate = config.delegate						
			;
			
			comment = (Utils.isString(comment) ? comment : config.comment) || '';
			if (!comment && eventTypeOrConfig.key) {
				comment = Utils.Alfresco.getMessage(eventTypeOrConfig.key, eventTypeOrConfig.args || []);
				comment = Utils.String.trim(comment); 
			}
			
			// set a new history event
			HistoryUtils.addHistoryEvent(
				document, 
				eventType, /* eventType */
				comment, /* comment */
				referrer, /* referrer */
				delegate /* delegate */
			);
			
		},
		
		addHistoryEvent : function(document, eventType, comment, referrer, delegate) {
			
			// Create the history event in the history-container of the document-container
			var
				referrerUserName = null != referrer
					? Utils.Alfresco.getPersonUserName(referrer) 
					: Utils.Alfresco.getFullyAuthenticatedUserName(),
				delegateUserName = null != delegate 
					? Utils.Alfresco.getPersonUserName(delegate) 
					: null,
				historyContainer = this.getOrCreateHistoryContainer(document, true /* create */),
				properties = {}
			;
					
//			properties[YammaModel.EVENT_DATE_PROPNAME] = new Date();
			properties[YammaModel.EVENT_EVENT_TYPE_PROPNAME] = eventType || GENERIC_EVENT_TYPENAME;
			properties[YammaModel.EVENT_DESCRIPTION_PROPNAME] = comment || '';
			properties[YammaModel.EVENT_REFERRER_PROPNAME] = referrerUserName;
			if (delegateUserName != referrerUserName) {
				properties[YammaModel.EVENT_DELEGATE_PROPNAME] = delegateUserName;
			}
			
			var newEvent = historyContainer.createNode(null, YammaModel.EVENT_TYPE_SHORTNAME, properties, YammaModel.HISTORY_EVENT_ASSOCNAME);
			if (null == newEvent) {
				logger.warn('[HistoryUtils.addHistoryEvent] Cannot create the history event.');
				return null;
			}
			
			return newEvent;
			
		},
		
		getOrCreateHistoryContainer : function(document /* node */, create /* boolean */) {
			
			if (null == document) return null;
			
			var history = (document.childAssocs[YammaModel.HISTORIZABLE_HISTORY_ASSOCNAME] || [null])[0];
			if (null != history) return history;
			
			if (true !== create) return null;
			
			// Create container
			history = document.createNode(
					YammaModel.HISTORY_TYPE_SHORTNAME.split(':')[1] /* name */,
					YammaModel.HISTORY_TYPE_SHORTNAME /* childType */,
					null /* properties */,
					YammaModel.HISTORIZABLE_HISTORY_ASSOCNAME /* assocType */,
					YammaModel.HISTORY_TYPE_SHORTNAME /* assocName */
			);
			
			return history;
			
		},
		
		getHistoryEvents : function(document, filteredType, ascending /* true */) {
			
			var
				historyContainer = this.getOrCreateHistoryContainer(document, false /* create */)
			;
			
			if (null == historyContainer) return [];
			
			var events = historyContainer.childAssocs[YammaModel.HISTORY_EVENT_ASSOCNAME];
			if (null == events) return [];
			
			if (false === ascending) events.reverse();
			
			if (undefined === filteredType) return events || [];
			
			var filteringFunction = Utils.isFunction(filteredType) ? filteredType : defaultFilteringFunction;
			
			return Utils.filter(events, filteringFunction);
			
			
			function defaultFilteringFunction(event) {
				
				var filteredTypes = [].concat(filteredType);
				filteredTypes = Utils.map(filteredTypes, function(filteredType) {return Utils.asString(filteredType);});
				
				return Utils.contains(
					filteredTypes, 
					Utils.asString(event.properties[YammaModel.EVENT_EVENT_TYPE_PROPNAME])
				);
				
			}
			
		},
		
		getEventType : function(event) {
			
			if (null == event) return null;
			if (null == event.properties) return null;
			
			var eventType = Utils.wrapString(event.properties[YammaModel.EVENT_EVENT_TYPE_PROPNAME]) || null;
			return eventType;
			
		}
		
		
	};

})();
