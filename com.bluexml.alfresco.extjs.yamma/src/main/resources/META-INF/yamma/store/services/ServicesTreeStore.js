Ext.define('Yamma.store.services.ServicesTreeStore', {

	extend : 'Ext.data.TreeStore',
	
	WS_URL : 'alfresco://bluexml/yamma/services' 
		+ '?rformat=tree' 
		+ '&depth=-1'
		+ '&membership={membership}',	
	
	nodeParam : 'parentService',
	showMembership : false,
	
	constructor : function() {
		
		this.fields = this.getFieldsDefinition();
		this.proxy = this.getProxyDefinition();
		return this.callParent();
		
	},	

	getFieldsDefinition : function() {
		
		return [
			{ name : 'id', type : 'string', mapping : 'name'},
			{ name : 'name', type : 'string'},
	    	{ 
				name : 'text', 
				type : 'string' , 
				mapping : 'title'
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
	    			return Yamma.Constants.getIconDefinition('group').iconCls;
	    		}
	    	},
	    	{
	    		name : 'expanded',
	    		type : 'boolean',
	    		convert : function(value, record) {
	    			return true;
	    		}
	    	}
	    ];
	    
	},
	
	getProxyDefinition : function() {
		
		var url = Bluexml.Alfresco.resolveAlfrescoProtocol(
			this.WS_URL.replace(/\{membership\}/, '' + this.showMembership)
		);

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
