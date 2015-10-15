Ext.define('Yamma.utils.ServicesManager', {

	requires : [
		'Yamma.store.services.ServicesTreeStore'
	],
	
	mixins: {
		observable: 'Ext.util.Observable'
	},
	
    singleton : true,
    
    HAS_ROLE_FILTER : function(role) {
    	
    	return function(node) {
    		
    		if (!node) return false;
    		var membership = node.get('membership') || {};
    		
    		return true === membership[role];
    		
    	};
    	
    },
    
    store : null,
	
	constructor: function (config) {
		
		var me = this;
		
		this.mixins.observable.constructor.call(this, config);

		this.addEvents(
			'loaded'
		);
			
		var servicesStore = Ext.create('Yamma.store.services.ServicesTreeStore', {
			showMembership : true
		});
		
		servicesStore.load({
			callback : function(records, operation, success) {
				if (!success) return;
				me.fireEvent('loaded');
			}
		});
		
		this.store = servicesStore;
		
	},	
	
	getDescription : function(serviceName) {		
		
		if (null == this.store) return null;
		return this.store.getRootNode().findChild('name', serviceName, true /* deep */);
		
	},
	
	getDisplayName : function(serviceName) {
		
		if (!serviceName) return '';
		
		var serviceDescription = Yamma.utils.ServicesManager.getDescription(serviceName);
		if (null == serviceDescription) return serviceName;
		
		return serviceDescription.get('text') || serviceName;
		
	},
	
	getServicesList : function(filter) {
		
		if (null == this.store) return [];
		
		var 
			rootNode = this.store.getRootNode(),
			result = []
		;
		
		filter = filter || function() { return true; };
		
		rootNode.cascadeBy(function(node) {
			
			if (filter(node)) {
				result.push(node);
			}
			
			return true; // continue
			
		});
		
		return result;
		
	}
	

});