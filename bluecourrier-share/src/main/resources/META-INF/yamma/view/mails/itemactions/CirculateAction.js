Ext.define('Yamma.view.mails.itemactions.CirculateAction', {
	
	extend : 'Bluedolmen.utils.alfresco.grid.ContextMenuAction',
	
	requires : [
	    'Bluedolmen.store.GroupStore'
	],
	
	uses : [
	    'Yamma.view.dialogs.CirculateDialog'
	],
	
	statics : {
		actionUrl : 'alfresco://bluedolmen/yamma/share-with'
	},
	
	text :  i18n.t('view.mails.itemaction.circulate.text'),
	
	iconCls : Yamma.Constants.getIconDefinition('transmit').iconCls,
	
	isAvailable : true,
	
	execute : function(record, item, view) {
		
		var 
			me = this,
			nodeRef = record.get('nodeRef'),
			status = record.get(Yamma.utils.datasources.Documents.STATUSABLE_STATE_QNAME),
			shareSelectionWindow = Ext.create('Yamma.view.dialogs.CirculateDialog', {
				nodeRef : nodeRef,
				enableServicesSelection : ('pending' != status) && !hasDistributionTask(record) 
			});
		;
		
		function hasDistributionTask(record) {
			
			var
				tasks = record.get(Yamma.view.mails.gridactions.SimpleTaskRefGridAction.TASKS_PROPERTY_NAME),
				taskNames = [/* 'bcinwf:pendingTask', */'bcinwf:deliveringTask', 'bcinwf:validatingTask']
			;
			
			return Ext.Array.some(tasks, function(task) {
				
				var taskName = task.name;
				return Ext.Array.contains(taskNames, taskName);
				
			});
			
		}
		
		shareSelectionWindow.show();
		
		function share() {
			
			var 
				url = Bluedolmen.Alfresco.resolveAlfrescoProtocol(Yamma.view.mails.itemactions.ShareDocumentAction.actionUrl),
				shares = shareSelectionWindow.getShares(),
				encodedShares = Yamma.view.mails.gridactions.Distribute.encodeShares(shares)
			;
			
			Bluedolmen.Alfresco.jsonPost({
				
				url : url,
				
				dataObj : {
					nodeRef : nodeRef,
					shares : encodedShares
				},
				
				onSuccess : function onSuccess(jsonResponse) {
					shareSelectionWindow.close();
				}
			
			});
			
		}
		
	},
	
	
	
});
