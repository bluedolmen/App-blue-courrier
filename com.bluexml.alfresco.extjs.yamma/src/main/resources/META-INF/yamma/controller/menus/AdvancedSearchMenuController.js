Ext.define('Yamma.controller.menus.AdvancedSearchMenuController', {
	
    extend: 'Ext.app.Controller',
    
    uses : [
    	'Bluexml.view.forms.window.SearchFormWindow',
    	'Yamma.utils.Context'
    ],    
    
    init: function() {
    	
		this.control({
			
			'advancedsearchmenu menuitem' : {
				click : this.onSearchByTypeMenuItemClicked
			}
			
    	});
    	
    	this.callParent();
    },
    
    onSearchByTypeMenuItemClicked : function(item, event, eOpts ) {
    	
    	var me = this;
    	var typeId = item.typeId;
    	if (null == typeId) return;
    	
    	Ext.define('Bluexml.view.forms.window.SearchFormWindow.YammaDocument', {
    		
    		extend : 'Bluexml.view.forms.window.SearchFormWindow',
    		
			getItemDescription : function(itemId) {
				return Yamma.Constants.DOCUMENT_TYPE_DEFINITIONS[typeId];
			},	
    		
			onSearch : function(formData) {
		
	    		var term = formData.term;
	    		delete formData.term;
	    		var query = formData;
	    		launchSearch(typeId, term, query);
	    		
				this.callParent(arguments);
				
			}	
			
    	}, function() {
    		
    		var searchFormWindow = new this();
    		searchFormWindow.load({
    			formConfig : {
    				itemId : typeId
    			}
    		});
    		
    	});    	
    	
    	function launchSearch(typeId, term, query) {
    		
    		var context = Ext.create('Yamma.utils.Context', {
    			
    			label : 'Recherche avancée',
    			query : query,
    			term : term
    			
    		});
    	
    		me.application.fireEvent('contextChanged', context);
    		
    	}    	
    	
    	
    }    
    
});