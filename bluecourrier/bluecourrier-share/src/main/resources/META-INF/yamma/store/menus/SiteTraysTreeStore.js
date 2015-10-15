Ext.define('Yamma.store.menus.SiteTraysTreeStore', {
	
	extend : 'Yamma.store.menus.SiteMenuTreeStore',
	
	WS_URL : 'alfresco://bluedolmen/yamma/treenode/trays',
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
		
	}
	
});

