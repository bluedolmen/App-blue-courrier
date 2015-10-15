/**
 * This class defines an extension of an {@link Ext.data.proxy.Ajax} by using a
 * 'POST' method and by providing the parameters as JSON data
 * <p>
 * This ajax call method is notably used in various webscript calls
 */
Ext.define('Bluedolmen.utils.alfresco.AjaxJsonPostProxy', {

	extend : 'Ext.data.proxy.Ajax',
	
	actionMethods : {
    	read : 'POST'
    },
 
    noCache : false,
    
    buildRequest : function () {
    	var request = this.callParent(arguments);
    
		request.jsonData = request.params || {};
		request.params = null;
		
		return request;
    }    
	
});
