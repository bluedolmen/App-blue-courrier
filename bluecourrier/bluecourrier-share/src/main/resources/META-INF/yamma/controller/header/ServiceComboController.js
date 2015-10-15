Ext.define('Yamma.controller.header.ServiceComboController', {
	
    extend: 'Ext.app.Controller',
    
	refs : [
    
		{
			ref : 'serviceCombo',
			selector : 'servicecombo'
		},
		
		{
			ref : 'mainMenu',
			selector : 'mainmenu'
		}
	    
    ],
        
    init: function() {
    	
		this.control({
			'servicecombo' : {
				select : this.onServiceSelect
			}
    	});
    	
    	this.callParent();
    	
    },
    
    onServiceSelect : function(picker, record, eOpts) {
    	
    	var 
    		serviceName = record.get('name'),
    		serviceLabel = record.get('text'),
    		mainMenu = this.getMainMenu(),
    		context = null
    	;
    	
    	if (!record.isRoot()) {
    		
        	context = Ext.create('Yamma.utils.Context');
    		context.setService({
    			label : serviceLabel,
    			serviceName : serviceName
    		});

    	}
    	
		mainMenu.fireEvent('contextChanged', context);
		
    }
    
    
});