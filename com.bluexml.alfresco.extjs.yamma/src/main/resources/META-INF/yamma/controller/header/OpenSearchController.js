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
			'opensearch' : {
				select : this.onOpenSearchSelect,
				specialkey : this.onSpecialKey
			}
    	});
    	
    	this.callParent();
    },
    
    onOpenSearchSelect : function(combo, records, eOpts) {
    	
    	if (!records || 0 == records.length) return;
    	var record = records[0];
    	
    	// TODO: Use constants?
    	var ref = record.get('reference') + ' – ' + record.get('name');
    	var nodeRef = record.get('nodeRef');
    	
    	var context = Ext.create('Yamma.utils.Context', {
    		title : ref,
    		filters : [
				{
					property : 'nodeRef',
					value : nodeRef
				}
			]
    	});
    	this.application.fireEvent('contextChanged', context);    	
    	
    },
    
    onSpecialKey : function(combo, e) {
    	if (e.getKey() != e.ENTER) return;
    	
    	var value = combo.getValue();
    	if (!value) return;
    	
    	var term = combo.adaptQuery(value);
    	
    	var context = Ext.create('Yamma.utils.Context', {
    		title : 'Recherche rapide',
    		filters : [
				{
					property : 'term',
					value : term
				}
			]
    	});
    	
    	this.application.fireEvent('contextChanged', context);
    	e.stopEvent();
    }
    
    
});