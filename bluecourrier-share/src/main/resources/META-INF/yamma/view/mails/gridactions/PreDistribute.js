Ext.define('Yamma.view.mails.gridactions.PreDistribute', {
	
	extend : 'Yamma.view.mails.gridactions.Distribute',
	
	taskName : ['bcinwf:pendingTask'],
	actionName : 'Start',
//	actionName : 'startDistribution',
	
	icon : Yamma.Constants.getIconDefinition('group_edit').icon,
	tooltip : i18n.t('view.mails.gridactions.pre-distribute.tooltip'),
	
	dialogConfig : {
		enableDistribution : false
	}
	
});