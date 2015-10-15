Ext.define('Yamma.admin.modules.init.InitAction', {
	
	statics : {
		
		INSTALLATION_STATES : {
			NO : 'state-no',
			FULL : 'state-full',
			PARTIALLY : 'state-partial',
			UNDETERMINED : 'state-undetermined',
			BUSY : 'state-busy'
		}
		
	},
	
	title : (function(){return this.$className;})(),
	
    requires: [
    ],

    id : 'init-admin',
    iconCls : Yamma.utils.Constants.getIconDefinition('gear').iconCls, 

    install : null,
    
    uninstall : null,
    
    reset : null,
    
    getState : function(onStateAvailable) {
    	
    	if (Ext.isFunction(onStateAvailable)) {
    		onStateAvailable(Yamma.admin.modules.init.InitAction.INSTALLATION_STATES.UNDETERMINED);
    	}
    	
    },
    
    getDetails : function(onDetailsAvailable) {
    	
    	if (Ext.isFunction(onDetailsAvailable)) {
    		onDetailsAvailable('');
    	}
    	
    }

});