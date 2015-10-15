Ext.define('Yamma.store.services.ServicesTreeStore', {

	extend : 'Ext.data.TreeStore',
	
	requires : [
		'Yamma.store.services.ServicesTreeStoreProxy'
	],
	
	showMembership : false,
	
	groupIconCls : Yamma.Constants.getIconDefinition('group_mail').iconCls,
	groupExpanded : true,
	expandable : true,
	
	remoteSort : false,
	sorters : [
		{
			property : 'text'
		}
	],
	
	additionalFields : [],
	
	constructor : function(config) {
		
		Ext.apply(this, config || {});
		
		this.fields = this.getFieldsDefinition();
		this.proxy = this.getProxyDefinition();
		
		return this.callParent(arguments);
		
	},	

	getFieldsDefinition : function() {
		
		var fieldsDefinition = [
			{ name : 'id', type : 'string', mapping : 'name'},
			{ name : 'name', type : 'string'},
	    	{ 
				name : 'text', 
				type : 'string', 
				mapping : 'title',
				convert : function(value, record) {
					// This could be mapped to the ServiceManager
					if ('root' == record.getId()) return 'Tous';
					return value;
				}
			},
	    	{
	    		name : 'leaf',
	    		type : 'boolean',
	    		mapping : 'hasChildren',
	    		convert: this.leafConvertFunction
	    	},
	    	{
	    		name : 'iconCls',
	    		type : 'string',
	    		defaultValue : Ext.isString(this.groupIconCls) ? this.groupIconCls : null,
	    		convert : Ext.isFunction(this.groupIconCls) ? this.groupIconCls : function(value) {return value;}
	    	},
	    	{
	    		name : 'expandable',
	    		type : 'boolean',
	    		defaultValue : this.expandable
	    	},
	    	{
	    		name : 'expanded',
	    		type : 'boolean',
	    		defaultValue : this.groupExpanded
	    	},
	    	{
	    		name : 'disabled',
	    		type : 'boolean',
	    		convert : this.disabledConvertFunction
	    	},
	    	{
	    		name : 'isSignable',
	    		type : 'boolean'
	    	},
	    	{
	    		name : 'inboxTray',
	    		type : 'string'
	    	}
	    ];
		
		if (true === this.showMembership) {
			fieldsDefinition.push('membership');
		}
		
		if (this.additionalFields) {
			fieldsDefinition = fieldsDefinition.concat(this.additionalFields);
		}
		
		return fieldsDefinition;
	    
	},
	
	leafConvertFunction : function(value, record) {
		return !value;		
	},
	
	disabledConvertFunction : Ext.emptyFn,
	
	getProxyDefinition : function() {
		
	    return Ext.create('Yamma.store.services.ServicesTreeStoreProxy' , {
	    	
	    	showMembership : this.showMembership,
	    	
	        reader: {
	            type: 'json',
	            root: 'children'
	        }
	        
	    });
	    
	}
	
});
