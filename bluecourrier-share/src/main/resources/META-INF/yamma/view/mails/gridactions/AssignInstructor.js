Ext.define('Yamma.view.mails.gridactions.AssignInstructor', {
	
	extend : 'Yamma.view.mails.gridactions.DeliveringAction',
	
	uses : [
		'Yamma.view.dialogs.AssignmentDialog'
	],
	
	taskTitle : i18n.t('view.mails.gridactions.assigntinstructor.tasktitle'),
	
	actionUrl : 'alfresco://bluedolmen/yamma/assign-processing',
	
	availabilityField : Yamma.utils.datasources.Documents.DOCUMENT_USER_CAN_DISTRIBUTE,
	actionName : 'Assign',
	
	supportBatchedNodes : true,
	
	iconClsSuffix : 'user',
	
	isAvailable : function(record, context) {
		
		if (!this.callParent(arguments)) return false;
		
		var serviceRole = this.getServiceRole(record);
		return 'inf' != serviceRole;
		
	},
	
	prepareBatchAction : function(records) {
		
		var
			me = this,
			record = Ext.isIterable(records) ? records[0] : records,
			serviceName = this.getServiceName(record),
			serviceDisplayName = Yamma.utils.ServicesManager.getDisplayName(serviceName),
			serviceRole = this.getServiceRole(record),
			iconCls = this.getIconCls(record)
		;
		
		this.assignDialog = Ext.create('Yamma.view.dialogs.AssignmentDialog', {
			
			serviceName : serviceName,
			serviceDisplayName : serviceDisplayName,
			serviceRole : serviceRole,
			iconCls : iconCls,
			
			assign : function(selectedRecord) {
				
				me.assignedInstructor = selectedRecord.get('userName');
				
				me.assignDialog.hide();
				me.fireEvent('preparationReady', records, {} /* preparationContext */);
				
			}
			
		});
		
		this.assignDialog.show();
		
	},	
	
	getAdditionalRequestParameters : function() {
		
		return ({
			manager : this.usurpedManager || undefined,
			assignee : this.assignedInstructor,
			action : this.actionName
		});
		
	},	
	
	
	onSuccess : function() {
		
		this.callParent();
		
		if (null != this.assignDialog) {
			this.assignDialog.close();
			this.assignDialog = null;
		}
		
	}
	
	
});