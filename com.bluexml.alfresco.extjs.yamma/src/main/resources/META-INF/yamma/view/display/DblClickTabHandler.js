/**
 * Plugin for adding a context action-menu to tabs.
 */
Ext.define('Yamma.view.display.DblClickTabHandler', {
	
	alias : 'plugin.dblclicktabhandler',

	mixins : {
		observable : 'Ext.util.Observable'
	},

	init : function(tabpanel) {
		
		this.tabPanel = tabpanel;
		
    	tabpanel.addEvents('tabdblclick');
    	tabpanel.on('add', 
    		function(container, component, position) {
    			
    			component.on('afterrender',
    				function(comp) {    					
    					Ext.get(comp.getEl()).on('dblclick',
    						function(event, el) {
    							tabpanel.fireEvent('tabdblclick', tabpanel, comp);
    						}
    					);
    				}
    			);
    			
    		}
    	);
				
	}

});