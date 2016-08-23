Ext.define('Yamma.view.mails.gridactions.DeliveringAction', {
	
	extend : 'Yamma.view.mails.gridactions.SimpleTaskRefGridAction',
	
	actionUrl : 'alfresco://bluedolmen/yamma/distribute',
	
	taskName : 'bcinwf:deliveringTask',
	taskTitle : i18n.t('view.mails.actions.Delivering.actionName'),
	
	supportBatchedNodes : true,
	
	constructor : function() {
		
		this.tooltip = this.taskTitle; // Useful for batch-actionable menu display 
		this.callParent();
	},
	
	getServiceRole : function(record) {
		
		var task = this.getFirstMatchingTask(record);
		if (null == task) return null;
			
		return (task.properties || {})[Yamma.utils.DeliveryUtils.PROP_SERVICE_ROLE] || '' ;
		
	},
	
	getServiceName : function(record) {
		
		var task = this.getFirstMatchingTask(record);
		if (null == task) return null;
		
		return (task.properties || {})[Yamma.utils.DeliveryUtils.PROP_SERVICE_NAME] || '';
		
	},
	
	getProcessKind : function(record) {
		
		var task = this.getFirstMatchingTask(record);
		if (null == task) return null;
		
		return (task.properties || {})[Yamma.utils.DeliveryUtils.PROP_PROCESS_KIND] || '';
		
	},
	
	getIconCls : function(record) {
		
		var
			serviceRole = this.getServiceRole(record),
			baseName = Yamma.utils.DeliveryUtils.ICON_CLS_BASENAME[serviceRole]
		;
		
		if (!baseName) return '';
		return Yamma.Constants.getIconDefinition(baseName + '_' + this.iconClsSuffix).iconCls;
		
	},
	
	TASK_TEMPLATE : new Ext.XTemplate(
		'<div><b>{title}</b></div>',
		'<div><i>Processus</i> : <b>{processKind}</b></div>',
		'<div><i>Role actuel</i> : <b>{serviceRole}</b></div>',
		'<div><i>Service en charge</i> : <b>{serviceName}</b></div>'
	),
	
	getTitle : function(value, metadata, record) {
		
	},
	
	getTip : function(value, metadata, record) {
		
		var
			serviceRole = this.getServiceRole(record),
			serviceName = this.getServiceName(record),
			processKind = this.getProcessKind(record)
		;
		
		return this.TASK_TEMPLATE.applyTemplate({
			
			serviceRole : Yamma.utils.DeliveryUtils.ROLE_TITLE[serviceRole] || '',
			serviceName : Yamma.utils.ServicesManager.getDisplayName(serviceName),
			processKind : (Yamma.utils.DeliveryUtils.getProcessKinds()[processKind] || {}).label,
			title : this.taskTitle
			
		});
		
	}
	
});
