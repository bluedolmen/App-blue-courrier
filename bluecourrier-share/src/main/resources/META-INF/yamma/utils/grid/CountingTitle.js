Ext.define('Yamma.utils.grid.CountingTitle', {
	
	init : function() {
		
		function onStoreLoaded(store, records, successful) {
			
			var nb = records ? records.length : 0;
			
			if (!successful || 0 == nb) {
				this.resetTitleToDefault();
				return;
			}
				
			this.updateTitle('(' + nb + ')');
			
		}
		
		function onStoreCleared(store, records, successful) {			
			this.resetTitleToDefault();
		}
		
		this.on('storeloaded', onStoreLoaded, this);
		this.on('storecleared', onStoreCleared, this);
		
	}
	
});