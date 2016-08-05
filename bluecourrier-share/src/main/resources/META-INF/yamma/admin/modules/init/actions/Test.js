Ext.define('Yamma.admin.modules.init.actions.Test', {
	
	extend : 'Yamma.admin.modules.init.InitAction',
	
	title : "Test d'initialisation",
	
    id : 'init-test',
    iconCls : Yamma.utils.Constants.getIconDefinition('gear').iconCls, 

    
    install : function(onNewStateAvailable) {
    	
    	Ext.defer(function() {
    		onNewStateAvailable(Yamma.admin.modules.init.InitAction.INSTALLATION_STATES.FULL);
    	}, 2000);
    	
    },
    
    getState : function(onStateAvailable) {
    	
    	if (!Ext.isFunction(onStateAvailable)) return;
    	
    	Ext.defer(function(){
    		onStateAvailable(Yamma.admin.modules.init.InitAction.INSTALLATION_STATES.NO);
    	}, 100);
    	
    }
    
    
});