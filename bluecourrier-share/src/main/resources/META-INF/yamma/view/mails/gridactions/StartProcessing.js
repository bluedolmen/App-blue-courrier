Ext.define('Yamma.view.mails.gridactions.StartProcessing', {

	extend : 'Yamma.view.mails.gridactions.SimpleTaskRefGridAction',
	
	icon : Yamma.Constants.getIconDefinition('pencil_go').icon,
//	tooltip : 'Traiter le document',
	
	taskName : 'bcinwf:processingTask',
//	discardIfOwner : true,
	//status :  i18n.t('view.mails.gridactions.startprocessing.status'),
	status :  "Not Yet Started",
	getTip : function(value, metadata, record) {
		
		var 
			me = this,
			serviceRole = getServiceRole(record)
		;
		
		function getServiceRole() {
			
			var task = me.getFirstMatchingTask(record);
			if (null == task) return null;
				
			return (task.properties || {})[Yamma.utils.DeliveryUtils.PROP_SERVICE_ROLE] || '' ;
			
		}

		return i18n.t( ['view.mails.actions.StartProcessing' + (serviceRole ? '.' + serviceRole : '') + ".tooltip" , 'view.mails.actions.StartProcessing.tooltip'] );
		
	},
	
	actionUrl : 'alfresco://bluedolmen/yamma/take-processing',
	supportBatchedNodes : true
		
});