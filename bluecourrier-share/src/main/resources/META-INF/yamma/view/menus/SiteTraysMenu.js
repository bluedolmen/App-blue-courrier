Ext.define('Yamma.view.menus.SiteTraysMenu', {

	extend : 'Ext.tree.Panel',
	alias : 'widget.sitetraysmenu',
	
	id : 'sitetrays-menu',
	
	title : i18n.t('view.menu.sitetraysmenu.title'),//'Bannettes',
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
						text : i18n.t('view.menu.sitetraysmenu.tree.incomming'),//'Entrant',
						iconCls : Yamma.Constants.INBOUND_MAIL_TYPE_DEFINITION.iconCls,
						expanded : true,
						children : [
							{
								text : i18n.t('view.menu.sitetraysmenu.tree.incomming-delivering'),///'Distribution',
								iconCls : Yamma.Constants.DOCUMENT_STATE_DEFINITIONS['delivering'].iconCls,
								leaf : true,
								filters : {
									type : 'inbound',
									state : 'delivering'
								}
							},
							{
								text : i18n.t('view.menu.sitetraysmenu.tree.incomming-processing'),//'Traitement',
								iconCls : Yamma.Constants.DOCUMENT_STATE_DEFINITIONS['processing'].iconCls,
								leaf : true,
								filters : {
									type : 'inbound',
									state : 'processing'
								}
							},
							{
								text : i18n.t('view.menu.sitetraysmenu.tree.incomming-processed'),///'Traité',
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
						text : i18n.t('view.menu.sitetraysmenu.tree.outgoing'),//'Sortant',
						iconCls : Yamma.Constants.OUTBOUND_MAIL_TYPE_DEFINITION.iconCls,
						expanded : true,
						children : [
							{
								text : i18n.t('view.menu.sitetraysmenu.tree.outgoing-processing'),//'Elaboration',
								iconCls : Yamma.Constants.DOCUMENT_STATE_DEFINITIONS['processing'].iconCls,
								leaf : true,
								filters : {
									type : 'outbound',
									state : 'processing'
								}
							},
							{
								text : i18n.t('view.menu.sitetraysmenu.tree.outgoing-validation'),//'Validation',
								iconCls : Yamma.Constants.DOCUMENT_STATE_DEFINITIONS['validating!processed'].iconCls,
								leaf : true,
								filters : {
									type : 'outbound',
									state : 'validating!processed'
								}
							},
							{
								text : i18n.t('view.menu.sitetraysmenu.tree.outgoing-sending'),//'Envoi',
								iconCls : Yamma.Constants.DOCUMENT_STATE_DEFINITIONS['sending'].iconCls,
								leaf : true,
								filters : {
									type : 'outbound',
									state : 'sending'
								}
							},
							{
								text : i18n.t('view.menu.sitetraysmenu.tree.outgoing-processed'),//'Traité',
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
						text : i18n.t('view.menu.sitetraysmenu.tree.copy-inbound'),//'Copies',
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