Ext.define('Yamma.controller.header.OpenSearchController', {
	
    extend: 'Ext.app.Controller',
    
	refs : [
    
		{
			ref : 'mailsView',
			selector : 'mailsview'
		}
	    
    ],
        
    init: function() {
    	
		this.control({
			'#quicksearch' : {
				select : this.onOpenSearchSelect,
				specialkey : this.onSpecialKey
			}
    	});
    	
    	this.callParent();
    },
    
    onOpenSearchSelect : function(combo, records, eOpts) {
    	
    	if (!records || 0 == records.length) return;
    	var 
    		record = records[0],
    	
    	// TODO: Use constants?
//    		ref = record.get('reference') + ' – ' + record.get('name'),
    		nodeRef = record.get('nodeRef'),
    	
    		context = Ext.create('Yamma.utils.Context', {
//	    		title : ref,
	    		filters : [
					{
						property : 'nodeRef',
						value : nodeRef
					}
				]
	    	})
	    ;
    	
    	this.application.fireEvent('contextChanged', context);    	
    	
    },
    
    onSpecialKey : function(combo, e) {
    	
    	if (e.getKey() != e.ENTER) return;
    	
    	var value = combo.getValue();
    	if (!value) return;
    	
    	var 
    		term = combo.adaptQuery(value),
    	
    		context = Ext.create('Yamma.utils.Context', {
	    		title : i18n.t('controller.quicksearch.title'),
	    		// server-side search does not accept a term only, a query has to be provided,
	    		// that's why we define a filter
	    		filters : [
					{
						property : 'term',
						value : term
					}
				]
	    	})
	    ;
    	
    	this.application.fireEvent('contextChanged', context);
    	
    	e.stopEvent();
    	
    }
    
    
});