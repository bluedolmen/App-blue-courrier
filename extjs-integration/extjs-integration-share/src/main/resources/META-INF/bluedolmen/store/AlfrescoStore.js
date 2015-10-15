/**
 * This class defines a generic Store to get access to Alfresco datasource
 * definitions
 * <p>
 * The main logic of this class relies in the statics part which play the role
 * of a Store factory
 */
Ext.define('Bluedolmen.store.AlfrescoStore', {

	alternateClassName : ['Bluedolmen.Store'],
	extend : 'Ext.data.Store',
	
	requires : [
		'Bluedolmen.utils.alfresco.Alfresco'
	],	
	
	fields : [], // fields will be set dynamically later    
    pageSize : 20, // default page-size
	autoLoad: false,
	
	remoteSort : true, // sort will be delegated to the server
	remoteGroup : true, // the same for groups
	remoteFilter : true, // and for filters
	
	getGroupString : function(instance) {

		var 
			me = this,
			groupField = me.groupers.first()
		;

		if (!groupField) return '';
		
		var 
			groupPropertyName = groupField.property,
			groupFieldType = instance.fields.get(groupPropertyName).type.type
		;
		
		switch (groupFieldType) {
		
			case 'date':
				return getDateFieldGroupString();
			break;
			
		}
		
		return me.callParent(arguments);
		
		function getDateFieldGroupString() {
			var value = instance.get(groupPropertyName);
			return Ext.util.Format.date(value, 'd/m/Y');
		}
		
	}	
    
});
