Ext.define('Bluedolmen.model.Group', {
	
	extend : 'Ext.data.Model',
	
	/*
	 * These fields are designed for the api/people webscripts The list
	 * of fields provided by this webscript notably change from the
	 * basic cm:person type in the sense where this is an augmented
	 * subset of the existing properties.
	 */
	fields : [
	   "authorityType",
	   "shortName",
	   "fullName",
	   "displayName",
	   "url",
	   "zones"
	],
	proxy : {
		type : 'rest',
		url : Bluedolmen.Alfresco.resolveAlfrescoProtocol('alfresco://api/grups'),
		reader : 'json',
		extraParams : {
			'zone' : 'APP.DEFAULT'
		}
	}
	
});
