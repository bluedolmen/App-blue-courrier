Ext.define('Yamma.view.mails.ServiceCombo.ServiceStore', {

	extend : 'Yamma.store.services.ServicesTreeStore',
	
	showMembership : true,
	
	disabledConvertFunction : function(value, record) {
		
		if (false === value) return false; // called when trying to force value on root 
		
		var membership = record.get('membership');
		if (membership && true == membership['ServiceManager']) return false;
		
		return true;
		
	}	
	
});

Ext.define('Yamma.view.mails.ServiceCombo', {
	
	extend : 'Ext.ux.TreePicker',
	
	requires : [
		'Ext.ux.tree.plugin.NodeDisabled'
	],
	
	alias : 'widget.servicecombo',
	
    name: 'service',
    autoScroll: true,
    width : 150,
    labelWidth : 50,
    displayField : 'text',
    
    grow : true,
    fieldLabel: i18n.t('view.mails.servicecombo.fieldLabel'),//'Service',
    labelAlign : 'right',
    labelSeparator : '',
    labelStyle : 'font-size : 1em ; font-weight : bold ; color : #15498B',     
    
    treePanelConfig : {
    	plugins : [{
    		ptype: 'dvp_nodedisabled'
        }]    	
    },
    
    initComponent : function() {
    	
    	var 
    		me = this,
    		store = Ext.create('Yamma.view.mails.ServiceCombo.ServiceStore')
    	;
    	this.store = store;
    	
    	store.on('load', function updateRootNodeAvailability(store, node, records, successful) {
    		
    		if (!successful) return;
    		
    		var accessibleSites = me.getAccessibleSites();
    		if (Ext.isEmpty(accessibleSites)) return; // 
    		
    		var rootNode = store.getRootNode();
    		if (!rootNode) return;
    		
    		rootNode.set('disabled', false);
    		
    	});
    	
    	store.load();
    	
    	this.callParent(arguments);

    },
    
    getAccessibleSites : function() {
    	
    	var 
    		result = [],
    		rootNode
    	;
    	
    	if (null == this.store) return [];
    	
    	rootNode = this.store.getRootNode();
    	if (null == rootNode) return [];
    	
    	rootNode.cascadeBy(function(node) {
    		if (node.get('disabled')) return;
    		result.push(node.get('name'));
    	});
    	
    	return result;
    	
    },
    
    // Override existing method to avoid selecting disabled items
    // => should probably have been mapped on select event
    onItemClick: function(view, record, node, rowIndex, e) {
    	var disabled = record.get('disabled');
    	if (disabled) return false;
    	
    	this.callParent(arguments);
    },
    
	fieldStyle : {
		'font-size' : '1em',
		'font-weight' : 'bold',
		'color' : '#15498B'
	}    
	
});
