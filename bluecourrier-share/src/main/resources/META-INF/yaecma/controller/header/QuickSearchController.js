Ext.define('Yaecma.controller.header.QuickSearchController', {
	
    extend: 'Ext.app.Controller',
            
    init: function() {
    	
		this.control({
			'quicksearch' : {
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
    		ref = record.get('name'),
    		nodeRef = record.get('nodeRef'),
    	
    		searchContext = {
    			description : ref,
    			filters : [
	    			{
	    				id : 'nodeRef',
	    				value : nodeRef
	    			}
    			]
    		}
		;
			
    	this.application.fireEvent('searchPerformed', searchContext);    	
    	
    },
    
    onSpecialKey : function(combo, e) {
    	
    	if (e.getKey() != e.ENTER) return;
    	
    	var value = combo.getValue();
    	if (!value) return;
    	
    	var 
    		term = combo.adaptQuery(value),
    	
			searchContext = {
    			description : 'Termes ' + term,
    			filters : [
	    			{
	    				id : 'term',
	    				value : term
	    			}
    			]
    		}
	    ;
    	
    	this.application.fireEvent('searchPerformed', searchContext);
    	e.stopEvent();
    }
    
    
});