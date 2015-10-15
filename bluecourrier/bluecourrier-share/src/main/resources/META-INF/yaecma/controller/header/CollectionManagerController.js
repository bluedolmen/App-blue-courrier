Ext.define('Yaecma.controller.header.CollectionManagerController', {
	
    extend: 'Ext.app.Controller',
    
    refs : [
	    {
	    	ref : 'collectionManager',
	    	selector : 'collectionmanager'
	    }
    ],
            
    init: function() {
    	
		this.application.on({
	        keepMe : this.onKeepMe,
	        scope: this
	    });		    	
    	
    	this.callParent();
    },
    
    onKeepMe : function(nodeRef, record, previewFrame) {
    	
    	var 
    		collectionManager = this.getCollectionManager()
    	;
    	
    }
    
    
    
});