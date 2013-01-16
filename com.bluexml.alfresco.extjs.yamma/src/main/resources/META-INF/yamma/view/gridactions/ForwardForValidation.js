Ext.define('Yamma.view.gridactions.ForwardForValidation', {
	
	extend : 'Yamma.view.gridactions.SimpleNodeRefGridAction',
	
	icon : Yamma.Constants.getIconDefinition('tick_go').icon,
	tooltip : 'Transmettre pour validation',
	actionUrl : 'alfresco://bluexml/yamma/send-outbound',
	availabilityField : Yamma.utils.datasources.Documents.DOCUMENT_USER_CAN_SEND_OUTBOUND,	

	supportBatchedNodes : true,	
	
	performServerRequest : function(nodeRefs) {
		
		this.jsonPost({
			nodeRef : nodeRefs,
			skipValidation : false
		});
		
	}	
	
	
});