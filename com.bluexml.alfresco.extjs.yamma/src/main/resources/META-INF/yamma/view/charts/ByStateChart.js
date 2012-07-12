Ext.define('Yamma.view.charts.ByStateChart', {

	extend : 'Yamma.view.charts.YammaStoreChart',
	storeId : 'StateSummary',
	
	totalDocumentNumber : -1,
	
 	onStoreLoaded : function(records) {
 		this.totalDocumentNumber = getTotalDocumentNumber(records);
 		
		function getTotalDocumentNumber(records) {
			if (!records) return 0;
			var total = 0;
			Ext.Array.forEach(records, function(record) {
				var documentNumber = record.get('documentNumber') || 0;
				total += documentNumber;
			});
			return total;
		}
 	},
 	
 	getTotalDocumentNumber : function() {
 		return this.totalDocumentNumber;
 	},
	
	getRecordStateTitle : function(record) {
		var stateId = record.get('yamma-ee:Statusable_state');
		var stateLabel = this.getStateShortTitle(stateId);
		
		return stateLabel;
	},
	
	getStateShortTitle : function(stateId) {
		if (!stateId) return '';
		
		var stateDefinition = Yamma.Constants.DOCUMENT_STATE_DEFINITIONS[stateId];
		return stateDefinition ? stateDefinition.shortTitle : '';
	},
	
 	getTitleLabel : function(record) {
 		return this.getRecordStateTitle(record);
 	} 	
	
});