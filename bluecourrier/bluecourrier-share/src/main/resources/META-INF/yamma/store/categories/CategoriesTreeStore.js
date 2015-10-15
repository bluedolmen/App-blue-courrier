Ext.define('Yamma.store.categories.CategoriesTreeStore', {

	extend : 'Ext.data.TreeStore',
	
	requires : [
		'Yamma.store.categories.CategoriesTreeStoreProxy'
	],
	
	showMembership : false,
	
	tagIconCls : Yamma.Constants.getIconDefinition('tag_orange').iconCls,
	categoryExpanded : false,
	expandable : true,
	
	remoteSort : false,
	sorters : [
		{
			property : 'text'
		}
	],
	
	additionalFields : [],
	rootNodeRef : 'alfresco://category/root',
	
	constructor : function(config) {
		
		Ext.apply(this, config || {});
		
		this.fields = this.getFieldsDefinition();
		this.proxy = this.getProxyDefinition();
		
		return this.callParent(arguments);
		
	},	

	getFieldsDefinition : function() {
		
		var fieldsDefinition = [
		                        
			{ name : 'id', type : 'string', mapping : 'nodeRef'},
			{ name : 'name', type : 'string'},
			{ name : 'description', type : 'string'},
			{ name : 'hasChildren', type : 'boolean'},
	    	{ 
				name : 'text', 
				type : 'string', 
				mapping : 'name',
				convert : function(value, record) {
					// This could be mapped to the ServiceManager
					if ('root' == record.getId()) return 'Toutes';
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
	    		defaultValue : Ext.isString(this.tagIconCls) ? this.tagIconCls : null,
	    		convert : Ext.isFunction(this.tagIconCls) ? this.tagIconCls : function(value) {return value;}
	    	},
	    	{
	    		name : 'expandable',
	    		type : 'boolean',
	    		defaultValue : this.expandable
	    	},
	    	{
	    		name : 'expanded',
	    		type : 'boolean',
	    		defaultValue : this.categoryExpanded
	    	},
	    	{
	    		name : 'disabled',
	    		type : 'boolean',
	    		convert : this.disabledConvertFunction
	    	},
	    	'userAccess'
	    ];
		
		if (this.additionalFields) {
			fieldsDefinition = fieldsDefinition.concat(this.additionalFields);
		}
		
		return fieldsDefinition;
	    
	},
	
	leafConvertFunction : function(hasChildren, record) {
		return !hasChildren;
	},
	
	disabledConvertFunction : Ext.emptyFn,
	
	getProxyDefinition : function() {
		
	    return Ext.create('Yamma.store.categories.CategoriesTreeStoreProxy' , {
	    	
	    	rootNodeRef : this.rootNodeRef	    	
	        
	    });
	    
	}
	
});
