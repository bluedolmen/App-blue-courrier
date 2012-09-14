Ext.define('Yamma.view.menus.SiteTraysMenu.TreeStore', {
	
	extend : 'Ext.data.TreeStore',
	
	WS_URL : 'alfresco://bluexml/yamma/treenode',
	
	RECORD_MAPPING : {
		'default' : {
			iconCls : Yamma.Constants.getIconDefinition('folder').iconCls,
			text : 'inconnu',
			qtitle : 'inconnu'
		},
		'st:site' : {
			iconCls : Yamma.Constants.getIconDefinition('group').iconCls
		},
		'cm:folder' : {
			iconCls : Yamma.Constants.getIconDefinition('folder').iconCls
		},
		'cm:content' : {
			iconCls : Yamma.Constants.getIconDefinition('page').iconCls
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
	
	
	nodeParam : 'node',
	title : 'Bannettes par service',
	
	constructor : function() {
		
		this.fields = this.getFieldsDefinition();
		this.proxy = this.getProxyDefinition();
		return this.callParent();
		
	},
	
	/**
	 * @private
	 * @param propertyName
	 */
	getRecordMapping : function(record, propertyName, defaultValue) {
		
		var 
			type = record.get('type') || 'default',
			recordMapping = this.RECORD_MAPPING[type],
			propertyMapping = recordMapping[propertyName]
		;
		
		if (!propertyMapping) return defaultValue;	
		if (Ext.isFunction(propertyMapping)) return propertyMapping(record);
		
		return propertyMapping;
	},
	
	getFieldsDefinition : function() {
		
		var me = this;
		
		return [
			{ name : 'id', type : 'string', mapping : 'ref'},
			{ name : 'type', type : 'string'},
			{ name : 'name', type : 'string'},
	    	{ 
				name : 'text', 
				type : 'string' , 
				mapping : 'title',
				convert : function(value, record) {
					return me.getRecordMapping(record, 'text', value);
				}
			},
	    	{ 
				name : 'qtitle', 
				type : 'string' , 
				mapping : 'description',
				convert : function(value,record) {
					return me.getRecordMapping(record, 'qtitle', value);
				}
			},
	    	{
	    		name : 'leaf',
	    		type : 'boolean',
	    		mapping : 'hasChildren',
	    		convert: function(value, record) { 
	    			return !value;
	    		}
	    	},
	    	{
	    		name : 'iconCls',
	    		type : 'string',
	    		convert: function(value, record) {
					return me.getRecordMapping(record, 'iconCls', value);
	    		}
	    	}
	    ];
	    
	},
	
	getProxyDefinition : function() {
		
		var url = Bluexml.Alfresco.resolveAlfrescoProtocol(this.WS_URL);

	    return {
	    	
	    	type : 'ajax',
	        url : url,
	        
	        reader: {
	            type: 'json',
	            root: 'children'
	        }
	        
	    };
	}
    
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