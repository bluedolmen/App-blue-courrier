/**
 * This class intends to manage the Alfresco DataList
 * interface integrated to Alfresco Share
 */
 Ext.define('Bluedolmen.utils.alfresco.DataList', {

 	requires : [
 		'Bluedolmen.utils.alfresco.Alfresco'
 	],
 	
 	/**
 	 * The Address of the Share data-list webscript 
 	 * @type String
 	 */
 	WS_ADDRESS : 'alfresco://slingshot/datalists/data/site/{site}/{container}/{list}',

 	constructor : function(siteName) {

 		if (null == siteName) {
 			throw new Error('The provided site-name has to be a valid String');
 		}

 		this.WS_ADDRESS = this.WS_ADDRESS
 			.replace(/\{site\}/,siteName)
 			.replace(/\{container\}/,'dataLists');
 		
 		return this.callParent();
 	},
 	
 	
 	retrieveDatalistData : function(dataListName, onDataRetrieved) {
 	
 		if (null == dataListName || ! ('string' == typeof(dataListName))) {
 			throw new Error('The provided data-list name "' + dataListName + '" has to be a valid String');
 		}
 		
 		var url = this.WS_ADDRESS
 			.replace(/\{list\}/,dataListName);
 			
 		
 		var Alfresco = Bluedolmen.utils.alfresco.Alfresco;
 		var ajaxRequest = Alfresco.getAjax();
 		
 		ajaxRequest.jsonPost({
			url : Alfresco.resolveAlfrescoProtocol(url),
			
			dataObj : {
				filter : {
					filterId : "all",
					filterData : ""
				}
			},
			
			successCallback : {
				fn : function(dataListData) {
					if (undefined == dataListData.json) return;
					
					onDataRetrieved(dataListData.json);
				}
			}
			
		});

 	}
 	
 });