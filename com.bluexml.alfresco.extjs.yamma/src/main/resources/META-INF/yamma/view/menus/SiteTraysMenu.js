Ext.define('Yamma.view.menus.SiteTraysMenu.TreeStore', {
	
	extend : 'Yamma.view.menus.SiteMenuTreeStore',
	
	WS_URL : 'alfresco://bluexml/yamma/treenode/trays',
	RECORD_MAPPING : {
		
		'default' : {
			iconCls : Yamma.Constants.getIconDefinition('folder').iconCls,
			text : 'inconnu',
			qtitle : 'inconnu'
		},
		
		'st:site' : {
			iconCls : Yamma.Constants.getIconDefinition('group').iconCls
		},
		
		'tray' : {
			iconCls : function(record) {
				var trayName = record.get('name');
				
				switch (trayName) {
				case 'inbox':
					return Yamma.Constants.getIconDefinition('folder_in').iconCls;
				case 'outbox':
					return Yamma.Constants.getIconDefinition('folder_out').iconCls;
				case 'ccbox':
					return Yamma.Constants.getIconDefinition('page_white_stack').iconCls;
				}
				
				return Yamma.Constants.getIconDefinition('folder_page').iconCls;
			},
			expanded : function(record) {
				return true;
			}
		},
		
		'state-tray' : {
			iconCls : function(record) {
				var 
					stateId = record.get('name'),
					stateDefinition = Yamma.Constants.DOCUMENT_STATE_DEFINITIONS[stateId]
				;
				
				return stateDefinition.iconCls;
			},
			text : function(record) {
				var 
					stateId = record.get('name'),
					stateDefinition = Yamma.Constants.DOCUMENT_STATE_DEFINITIONS[stateId]
				;
				
				return stateDefinition.shortTitle;				
			},
			qtitle : function(record) {
				var 
					stateId = record.get('name'),
					stateDefinition = Yamma.Constants.DOCUMENT_STATE_DEFINITIONS[stateId]
				;
				
				return stateDefinition.title;								
			}
		}
		
	},
	
	title : 'Bannettes par service'
    
});

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
		return Ext.create('Yamma.view.menus.SiteTraysMenu.TreeStore');
	}
	
});