Ext.define('Yamma.store.Authorities', {
	
	extend : 'Ext.data.Store',
	
	statics : {
		DATASOURCE_URL : 'alfresco://bluedolmen/yamma/authorities',
		USER_ICONCLS : Yamma.Constants.getIconDefinition('user').iconCls,
		GROUP_ICONCLS : Yamma.Constants.getIconDefinition('group').iconCls
	},
	
	constructor : function() {
		
		this.fields = [
       		{ name : 'id', type : 'string', mapping : 'shortName'},
    		'shortName',
    		'displayName',
    		'authorityType',
    		'url',
    		{ name : 'enabled', type : 'boolean' },// USER
    		'avatar', // USER
    		'fullName', // GROUP
    		'zones', // GROUP
    		{
    			name : 'iconCls',
    			convert : this.getIconCls
    		}
    	]; 
	
		this.proxy = {
			
		    type: 'ajax',
		    url : Bluedolmen.Alfresco.resolveAlfrescoProtocol(this.statics().DATASOURCE_URL),
		    
		    reader: {
		        type : 'json',
		        root : 'authorities'
		    }
		    
		};
		
		this.callParent();
		
	},
	
	getIconCls : function(value, record) {
		
		var authorityType = record.get('authorityType');
		if ('GROUP' == authorityType) return Yamma.store.Authorities.GROUP_ICONCLS; 
		if ('USER' == authorityType) return Yamma.store.Authorities.USER_ICONCLS;
		
		return null;
		
	}
	
	
});

