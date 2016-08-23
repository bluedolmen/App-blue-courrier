Ext.define('Yamma.view.mails.GroupersMenu', {
	
	extend : 'Yamma.view.mails.SortersMenu',
	
	iconCls : Yamma.Constants.getIconDefinition('shape_group').iconCls,
	
	showDirection : false,
	
	sortEventName : 'groupby',
	
	defaultLabel : i18n.t('view.mails.groupby.defaultlabel'),//'Grouper par',
	
	sortAscendingIcon : Yamma.Constants.getIconDefinition('shape_group'),
	sortDescendingIcon : Yamma.Constants.getIconDefinition('shape_group'),
	
	showNoneSorter : true,
	
	initComponent : function() {
		
		this.sorters = this.groupers; // backward compatibility
		this.callParent();
		
	}
    
});