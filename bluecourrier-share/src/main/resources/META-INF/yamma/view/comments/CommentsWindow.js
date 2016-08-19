Ext.define('Yamma.view.comments.CommentsWindow', {

	extend : 'Ext.window.Window',
	alias : 'widget.commentswindow',
	
	title : i18n.t('view.comments.commentswindow.title'),
	layout : 'fit',
	resizable : true,
	
	items : [
		{
			xtype : 'commentsview',
			preventHeader : true
		}
	],
	
	nodeRef : null,
	
	constructor : function(config) {
		this.nodeRef = config.nodeRef;
		this.callParent(arguments);
	},
	
	initComponent : function() {
		
		this.callParent(arguments);
		
		var commentsView = this.child('commentsview');
		commentsView.loadComments(this.nodeRef);		
		
	},
	
	renderTo : Ext.getBody()
	
});
