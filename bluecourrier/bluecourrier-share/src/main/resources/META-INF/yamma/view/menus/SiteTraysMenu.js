Ext.define('Yamma.view.menus.SiteTraysMenu', {

	extend : 'Ext.tree.Panel',
	alias : 'widget.sitetraysmenu',
	
	id : 'sitetrays-menu',
	
	title : 'Bannettes',
	iconCls : 'icon-folder_page_white',

	border : 1,
	rootVisible : false,
	
	initComponent : function() {
		this.store = this.getTreeStore();
		this.callParent();
	},
	
	getTreeStore : function() {
		
		var treeStore = Ext.create('Ext.data.TreeStore', {
			
			fields : [
				'text', 'iconCls', 'expanded', 'children', 'leaf', 'filters'
			],
			root : {
				expanded : true,
				children : [
					{
						text : 'Entrant',
						iconCls : Yamma.Constants.INBOUND_MAIL_TYPE_DEFINITION.iconCls,
						expanded : true,
						children : [
							{
								text : 'Distribution',
								iconCls : Yamma.Constants.DOCUMENT_STATE_DEFINITIONS['delivering'].iconCls,
								leaf : true,
								filters : {
									type : 'inbound',
									state : 'delivering'
								}
							},
							{
								text : 'Traitement',
								iconCls : Yamma.Constants.DOCUMENT_STATE_DEFINITIONS['processing'].iconCls,
								leaf : true,
								filters : {
									type : 'inbound',
									state : 'processing'
								}
							},
							{
								text : 'Traité',
								iconCls : Yamma.Constants.DOCUMENT_STATE_DEFINITIONS['processed'].iconCls,
								leaf : true,
								filters : {
									type : 'inbound',
									state : 'processed'
								}
							}
//							{
//								text : 'Copies',
//								iconCls : Yamma.Constants.getIconDefinition('page_white_stack').iconCls,
//								leaf : true,
//								filters : {
//									type : 'copy!inbound'
//								}
//							}
						]
					},
					{
						text : 'Sortant',
						iconCls : Yamma.Constants.OUTBOUND_MAIL_TYPE_DEFINITION.iconCls,
						expanded : true,
						children : [
							{
								text : 'Elaboration',
								iconCls : Yamma.Constants.DOCUMENT_STATE_DEFINITIONS['processing'].iconCls,
								leaf : true,
								filters : {
									type : 'outbound',
									state : 'processing'
								}
							},
							{
								text : 'Validation',
								iconCls : Yamma.Constants.DOCUMENT_STATE_DEFINITIONS['validating!processed'].iconCls,
								leaf : true,
								filters : {
									type : 'outbound',
									state : 'validating!processed'
								}
							},
							{
								text : 'Envoi',
								iconCls : Yamma.Constants.DOCUMENT_STATE_DEFINITIONS['sending'].iconCls,
								leaf : true,
								filters : {
									type : 'outbound',
									state : 'sending'
								}
							},
							{
								text : 'Traité',
								iconCls : Yamma.Constants.DOCUMENT_STATE_DEFINITIONS['processed'].iconCls,
								leaf : true,
								filters : {
									type : 'outbound',
									state : 'processed'
								}
							}
						]
					},
					{
						text : 'Copies',
						iconCls : Yamma.Constants.getIconDefinition('page_white_stack').iconCls,
						leaf : true,
						filters : {
							type : 'copy!inbound'
						}
						
					}
				]
			}
		});
		
		return treeStore;
		
	}
	
});