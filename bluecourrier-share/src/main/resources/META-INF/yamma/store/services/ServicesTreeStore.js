Ext.define('Yamma.store.services.ServicesTreeStore', {

	extend : 'Ext.data.TreeStore',
	
	requires : [
		'Yamma.store.services.ServicesTreeStoreProxy'
	],
	
	showMembership : false,
	
	groupIconCls : Yamma.Constants.getIconDefinition('group_mail').iconCls,
	groupExpanded : true,
	expandable : true,
	
	rootLabel : i18n.t('store.services.treestore.rootlabel'),
	
	remoteSort : false,
	sorters : [
		{
			property : 'text'
		}
	],
	
	computeAvailableAncestors : false,
	
	additionalFields : [],
	
	constructor : function(config) {
		
		Ext.apply(this, config || {});
		
		this.fields = this.getFieldsDefinition();
		this.proxy = this.getProxyDefinition();
		
		this.callParent(arguments);
		
		if (true === this.computeAvailableAncestors) {
			this.on('load', this._computeAvailableAncestors, this);
		}
		
	},	

	getFieldsDefinition : function() {
		
		var 
			me = this,
			fieldsDefinition = [
				{ name : 'id', type : 'string', mapping : 'name'},
				{ name : 'name', type : 'string'},
		    	{ 
					name : 'text', 
					type : 'string', 
					mapping : 'title',
					convert : function(value, record) {
						// This could be mapped to the ServiceManager
						if ('root' == record.getId()) return me.rootLabel;
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
		    ]
		;
		
		if (true === this.showMembership) {
			fieldsDefinition.push('membership');
		}
		
		if (true === this.computeAvailableAncestors) {
			fieldsDefinition.push({
				name : 'isAvailableAncestor',
//				type : 'boolean',
				defaultValue : null
			});
		}
		
		if (this.additionalFields) {
			fieldsDefinition = fieldsDefinition.concat(this.additionalFields);
		}
		
		return fieldsDefinition;
	    
	},
	
	leafConvertFunction : function(value, record) {
		return ('root' != record.getId()) && !value;
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
	    
	},
	
	_computeAvailableAncestors : function() {
		
		var
			rootNode = this.getRootNode()
		;
		
		return isAvailableAncestor_(rootNode);
		
		function isAvailableAncestor_(node) {
			
			var isAvailableAncestor = node.get('isAvailableAncestor');
			
			if (null != isAvailableAncestor) {
				return isAvailableAncestor; // pre-computed
			}
			
			if (node.isLeaf()) {
				isAvailableAncestor = !node.get('disabled');
			}
			else {
				isAvailableAncestor = false;
				Ext.Array.each(node.childNodes, function(child) {
					isAvailableAncestor = isAvailableAncestor_(child) || isAvailableAncestor;
				});
			}
			
			node.set('isAvailableAncestor', isAvailableAncestor);
			return isAvailableAncestor;
			
		}
		
	}
	
});
