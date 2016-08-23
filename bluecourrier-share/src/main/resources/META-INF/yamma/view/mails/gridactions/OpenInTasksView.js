Ext.define('Yamma.view.mails.gridactions.OpenInTasksView', {

	extend : 'Yamma.view.mails.gridactions.SimpleNodeRefGridAction',
	
	uses : [
		'Yamma.view.mails.gridactions.SimpleTaskRefGridAction'
	],
	
	icon : Yamma.Constants.getIconDefinition('cog_go').icon,
	tooltip : i18n.t('view.mails.gridactions.openintask.tooltip'),
	
	supportBatchedNodes : false,
	
	isAvailable : function(record) {
		
		return Yamma.view.mails.gridactions.SimpleTaskRefGridAction.hasTask(record);
		
	},
	
	performBatchAction : function(records, preparationContext) {
		
		this.grid.fireEvent('gototasksview', records);
		
	}	
	
});