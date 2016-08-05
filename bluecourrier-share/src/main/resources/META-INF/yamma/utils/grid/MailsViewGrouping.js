Ext.define('Yamma.utils.grid.MailsViewGrouping', {

	extend : 'Ext.grid.feature.Grouping',
	alias : 'feature.mailsviewgrouping',
	
	groupByText : 'Grouper par',
	showGroupsText :' Montrer en groupe',
	
	collapsible : false, // Circumvent a bug
	
	/* 
	 * To circumvent another bug, we can force the view.isGrouping value
	 * in the init funtion (default is set to true, maybe because it is
	 * misused
	 */
	isGrouping : null,
	
	init : function() {
		
		this.callParent();
		
		if (null != this.isGrouping) {
			this.view.isGrouping = this.isGrouping;
		}
		
	}
	
});