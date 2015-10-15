Ext.define('Bluedolmen.utils.DirtyManager', {

	extend : 'Ext.util.Observable',
	singleton : true,
	
	DIRTY : {
		WORK_IN_PROGRESS_DOCUMENTS : "WorkInProgressDocuments",
		VALID_DOCUMENTS : "ValidDocuments",
		ARCHIVED_DOCUMENTS : "ArchivedDocuments",
		VALIDATING_DOCUMENTS : "ValidatingDocuments",
		NEW_AVAILABLE_DOCUMENTS : "NewReceipt",
		REQUESTS : 'Requests'
	},
	
    constructor: function(config){
    	
    	config = config || {};
    	
        this.addEvents({
            dirty : true
        });

        // Copy configured listeners into *this* object so that the base class's
        // constructor will add them.
        this.listeners = config.listeners;

        // Call our superclass constructor to complete construction process.
        this.callParent(arguments)
    },	
	
	setDirty : function(componentId) {
		this.fireEvent('dirty', componentId);
	}	
	
});