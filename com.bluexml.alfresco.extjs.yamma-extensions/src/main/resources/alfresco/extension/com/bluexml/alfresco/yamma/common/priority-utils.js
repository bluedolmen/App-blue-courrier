(function() {	

	PriorityUtils = {
		
		isDueDateSet : function(documentNode) {
			DocumentUtils.checkDocument(documentNode);
			return documentNode.properties[YammaModel.DUEABLE_DUE_DATE_PROPNAME] != null;			
		},
		
		updateDueDate : function(documentNode, delay) {
		
			DocumentUtils.checkDocument(documentNode);
			var 
				createdDate = ( 
					documentNode.properties[YammaModel.INBOUND_DOCUMENT_DELIVERY_DATE_PROPNAME] 
					|| documentNode.properties.created 
					|| new Date()
				),
				delayInDays = ('number' == typeof delay) ? delay : PriorityUtils.getDelayInDays(delay),
				delayInMillis = delayInDays * 1000 * 60 * 60 *24,
				dueDateMillis = createdDate.getTime() + delayInMillis
			;
			
			documentNode.properties[YammaModel.DUEABLE_DUE_DATE_PROPNAME] = new Date(dueDateMillis);
			documentNode.save();
			
		},
		
		getDelayInDays : function(delayNode) {
			
			if (!delayNode) return 0;
			if (!delayNode.properties) return 0; // not a ScriptNode
			var delay = delayNode.properties[YammaModel.DELAY_DELAY_PROPNAME];
			
			return delay || 0;
			
		}
		
	};

})();
