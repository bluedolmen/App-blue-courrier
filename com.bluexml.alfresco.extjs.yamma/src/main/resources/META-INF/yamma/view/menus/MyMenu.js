Ext.define('Yamma.view.menus.MyMenu', {

	extend : 'Ext.tree.Panel',
	alias : 'widget.mymenu',
	
	statics : {
		MY_DOCUMENTS_ASSIGNED : 'myDocuments!assigned',
		MY_DOCUMENTS_PROCESSING : 'myDocuments!processing',
		MY_DOCUMENTS_VALIDATING : 'myDocuments!validating',
		MY_DOCUMENTS_LATE : 'myDocuments!late'
	},
	
	id : 'my-menu',
	
	title : 'Mon Bureau',
	iconCls : 'icon-house',
	
	rootVisible : false,

	initComponent : function() {
		this.root = this.getRootDefinition();
		this.callParent();
	},
	
	getRootDefinition : function() {
	
		return {
			text : '',
			expanded : true,
			children : [
				{
					text : 'Mes documents',
					expanded : true,
					iconCls : 'icon-page_white_user',
					
					children : [
						{
							text : 'Assignés',
							leaf : true,
							iconCls : 'icon-page_white_star',
							id : Yamma.view.menus.MyMenu.MY_DOCUMENTS_ASSIGNED
						},
	
						{
							text : 'En cours de traitement',
							leaf : true,
							iconCls : 'icon-page_white_edit',
							id : Yamma.view.menus.MyMenu.MY_DOCUMENTS_PROCESSING
						},					
					
						{
							text : 'En validation',
							leaf : true,
							iconCls : 'icon-page_white_medal',
							id : Yamma.view.menus.MyMenu.MY_DOCUMENTS_VALIDATING
						},
						
						{
							text : 'En retard',
							leaf : true,
							iconCls : 'icon-exclamation',
							id : Yamma.view.menus.MyMenu.MY_DOCUMENTS_LATE
						}
					]
					
				}
			]
		}
		
	}
	
});