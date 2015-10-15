Ext.define('Yamma.store.menus.SiteMenuTreeStore', {

	extend : 'Ext.data.TreeStore',
	
	WS_URL : 'alfresco://bluedolmen/yamma/treenode/{rootType}',
	
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
		}
	},
	
	nodeParam : 'node',
	title : '',
	
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
	    	},
	    	{
	    		name : 'expanded',
	    		type : 'boolean',
	    		convert : function(value, record) {
	    			return me.getRecordMapping(record, 'expanded', value);
	    		}
	    	}
	    ];
	    
	},
	
	getProxyDefinition : function() {
		
		var url = Bluedolmen.Alfresco.resolveAlfrescoProtocol(this.WS_URL);

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
