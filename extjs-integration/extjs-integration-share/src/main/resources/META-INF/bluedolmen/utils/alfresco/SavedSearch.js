Ext.define('Bluedolmen.utils.alfresco.SavedSearch', {

	extend : 'Bluedolmen.utils.alfresco.DataList',
	
	statics : {
		
		SAVED_SEARCH_DATALIST_NAME : 'savedSearch'
		
	},
	
	constructor : function(siteName) {
		this.callParent(arguments);
	},
	 
	getSavedSearchRef : function(savedSearchId) {
	 	
		if (!savedSearchId) {
			throw new Error('IllegalArgumentException! The provided saved-search id is not valid.');
		}
		 	
		
	},
	
	getSavedSearches : function(onSavedSearchesRetrieved) {
		
		retrieveDatalistData(Bluedolmen.utils.alfresco.SavedSearch.SAVED_SEARCH_DATALIST_NAME, onSavedSearchesRetrieved);
	 	
	}

	
});