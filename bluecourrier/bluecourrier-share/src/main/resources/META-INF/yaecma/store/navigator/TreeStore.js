Ext.define('Yaecma.store.navigator.TreeStore', {

	extend : 'Ext.data.TreeStore',
	
	storeId : 'Navigator',
	
	statics : {
		
		WS_URL : 'alfresco://bluedolmen/yaecma/treenode',
		
		RECORD_MAPPING : {
			
			'default' : {
				iconCls : Yaecma.Constants.getIconDefinition('folder').iconCls
			},
			
			'st:sites' : {
				iconCls : Yaecma.Constants.getIconDefinition('group').iconCls
			},
			
			'cm:folder' : {
				iconCls : Yaecma.Constants.getIconDefinition('folder').iconCls
			},
			
			'cm:content' : {
				iconCls : Yaecma.Constants.getIconDefinition('page').iconCls
			}
			
		}
		
	},
	
	/**
	 * @cfg {Boolean} Whether to retrieve folders in the datasource. Default to true
	 */
	showFolders : true,
	
	/**
	 * @cfg {Boolean} Whether to retrieve files in the datasource. Default to true
	 */
	showFiles : true,
	
	nodeParam : 'parent',
	
	title : '',
	
	constructor : function(config) {

		this.setConfig(config);
		this.fields = this.getFieldsDefinition();
		this.proxy = this.getProxyDefinition();
		
		return this.callParent(arguments);
	},
	
	/**
	 * @private
	 */
	setConfig : function(config) {
		
		if (undefined !== config.showFiles) {
			this.showFiles = config.showFiles;
			delete config.showFiles;
		}
		
		if (undefined !== config.showFiles) {
			this.showFiles = config.showFiles;
			delete config.showFiles;
		}
		
	},
	
	getFieldsDefinition : function() {
		
		var me = this;
		
		return [
			{ name : 'id', type : 'string', mapping : 'ref'},
			{ name : 'type', type : 'string'},
			{ name : 'name', type : 'string'},
			{ name : 'path', type : 'string'},
	    	{ name : 'text', type : 'string', mapping : 'name' },
	    	{ name : 'qtip', type : 'string', mapping : 'title' },
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
		
		var url = Bluedolmen.Alfresco.resolveAlfrescoProtocol( Yaecma.store.navigator.TreeStore.WS_URL );

	    return {
	    	
	    	type : 'ajax',
	        url : url,
	        
	        reader: {
	            type: 'json',
	            root: 'children'
	        },
	        
	        extraParams : {
	        	showFolders : this.showFolders,
	        	showFiles : this.showFiles
	        }
	        
	    };
	},
	
	/**
	 * @private
	 * @param propertyName
	 */
	getRecordMapping : function(record, propertyName, defaultValue) {
		
		var 
			type = record.get('type') || 'default',
			recordMapping = 
				Yaecma.store.navigator.TreeStore.RECORD_MAPPING[type] || 
				Yaecma.store.navigator.TreeStore.RECORD_MAPPING['default'],
			propertyMapping = recordMapping[propertyName]
		;
		
		if (!propertyMapping) return defaultValue;	
		if (Ext.isFunction(propertyMapping)) return propertyMapping(record);
		
		return propertyMapping;
	}
	
});
