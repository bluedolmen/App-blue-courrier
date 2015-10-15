/**
 * This class defines a generic Store to get access to Alfresco datasource
 * definitions
 * <p>
 * The main logic of this class relies in the statics part which play the role
 * of a Store factory
 */
Ext.define('Bluedolmen.store.AlfrescoTreeStore', {

	alternateClassName : ['Bluedolmen.TreeStore'],
	extend : 'Ext.data.TreeStore',
	
	requires : [
		'Bluedolmen.utils.alfresco.Alfresco'
	],	
	
	fields : [], // fields will be set dynamically later    
    pageSize : 20, // default page-size
	autoLoad: false,
	
	remoteSort : true, // sort will be delegated to the server
	remoteGroup : true, // the same for groups
	remoteFilter : true // and for filters
	
});
