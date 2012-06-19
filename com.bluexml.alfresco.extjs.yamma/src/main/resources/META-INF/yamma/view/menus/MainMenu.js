Ext.define('Yamma.view.menus.MainMenu.TreeStore', {
	
	extend : 'Ext.data.TreeStore',
	
	WS_URL : 'alfresco://bluexml/yamma/treenode',
	ICON_CLS_MAPPING : {
		'st:site' : Yamma.Constants.getIconDefinition('group'),
		'cm:folder' : Yamma.Constants.getIconDefinition('folder'),
		'cm:content' : Yamma.Constants.getIconDefinition('page')
	},
	DEFAULT_ICON_CLS : Yamma.Constants.getIconDefinition('folder'),
	
	nodeParam : 'node',
	
	constructor : function() {
		
		this.fields = this.getFieldsDefinition();
		this.proxy = this.getProxyDefinition();
		return this.callParent();
		
	},
	
	getFieldsDefinition : function() {
		
		var me = this;
		
		return [
			{ name : 'id', type : 'string', mapping : 'ref'},
			{ name : 'type', type : 'string'},
	    	{ name : 'text', type : 'string' , mapping : 'title' },
	    	{ name : 'qtitle', type : 'string' , mapping : 'description' },
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
	    			var type = record.get('type');
	    			if (type) {
	    				var iconDef = me.ICON_CLS_MAPPING[type];
	    				if (iconDef) return iconDef.iconCls;
	    			}
	    			
	    			return me.DEFAULT_ICON_CLS.iconCls; 
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

Ext.define('Yamma.view.menus.MainMenu', {

	extend : 'Ext.tree.Panel',
	alias : 'widget.mainmenu',
			
	id : 'menu-panel',
	border : 1,
	rootVisible : false,
	
	initComponent : function() {
		this.store = this.getTreeStore();
		this.callParent();
	},
	
	getTreeStore : function() {
		return Ext.create('Yamma.view.menus.MainMenu.TreeStore');
	}
	
});