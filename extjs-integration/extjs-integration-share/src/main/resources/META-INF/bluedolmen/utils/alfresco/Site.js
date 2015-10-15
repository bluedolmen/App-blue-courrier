/**
 * Alfresco Site management/helper 
 */
 Ext.define('Bluedolmen.utils.alfresco.Site', {
 
 	requires : [
 		'Bluedolmen.utils.alfresco.Alfresco',
 		'Bluedolmen.utils.alfresco.DataList'
 	],
 	 	 	
 	WS_ADDRESS : 'alfresco://sites/{sitename}',
 	
 	siteName : null,
 	
 	constructor : function(siteName) {

 		if (null == siteName ) {
 			throw new Error ('The provided site-name has to be a valid String');
 		}

 		this.siteName = siteName,
 		
 		this.WS_ADDRESS = this.WS_ADDRESS
 			.replace(/\{site\}/,siteName);
 		
 		return this;
 	},

 	
 	/**
 	 * Get the site Alfresco site-information of the given site shortname
 	 * @param {the callback to be called on info retrieved as an Object} onSiteInfoRetrieved
 	 */
 	getSiteInformation : function(onSiteInfoRetrieved) {
 		
 		if (null == siteName) {
 			throw new Error('The site-name has to be provided');
 		}
 		
 		var url = this.WS_ADDRESS.replace(/\{sitename\}/,siteName);
 		Bluedolmen.utils.alfresco.Alfresco.callWebscript(
 			{
	 			url : url,
	 			success : function(response, options) {
	 				
	 				var responseType = response.responseType;
	 				if ('json' != responseType) {
	 					throw new Error('Unexpected result on getting site information');
	 				}
	 				
	 				var responseText = response.responseText;
	 				var responseObject = Ext.JSON.decode(responseText);
	 				
	 				onSiteInfoRetrieved(responseObject);
	 			}
 			}
 		);
 	},
 	
 	getDataListData : function(dataListName, onDataRetrieved) {
 		var dataList = Bluedolmen.utils.alfresco.DataList.create(this.siteName); // should be cached
 		dataList.retrieveDatalistData(
 			dataListName,
 			onDataRetrieved
 		);
 	}
 	
 });