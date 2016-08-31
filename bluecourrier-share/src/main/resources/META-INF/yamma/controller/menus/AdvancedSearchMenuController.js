Ext.define('Yamma.controller.menus.AdvancedSearchMenuController', {
	
    extend: 'Ext.app.Controller',
    
    uses : [
    	'Bluedolmen.view.forms.window.SearchFormWindow',
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
    	
    	var 
    		me = this,
    		typeId = item.typeId,
    		datatype = 'bluecourrier:mail' /* actually an aspect */
    	;
    	if (null == typeId) return;
    	
    	Ext.define('Bluedolmen.view.forms.window.SearchFormWindow.YammaDocument', {
    		
    		extend : 'Bluedolmen.view.forms.window.SearchFormWindow',
    		
			getItemDescription : function(itemId) {
				return Yamma.Constants.DOCUMENT_TYPE_DEFINITIONS[typeId];
			},	
    		
			onSearch : function(term, query) {
		
				query.datatype = datatype;
	    		launchSearch(typeId, term, query);
				this.callParent(arguments);
				
			}	
			
    	}, function() {
    		
    		var 
    			searchFormWindow = new this(),
    			typeDefinition = Yamma.Constants.DOCUMENT_TYPE_DEFINITIONS[typeId],
    			aspects = typeDefinition.aspects || [],
    			mainAspect = aspects[0] || null
    		;
    		
    		if (null == mainAspect) {
    			Ext.Error.raise(i18n.t('controller.advancedsearch.error.mainAspect'));
    		}
    		
    		searchFormWindow.load({
    			formConfig : {
    				itemId : "cm:content",
    				formId : Yamma.Constants.YAMMA_SEARCH_FORMID
    			}
    		});
    		
    	});    	
    	
    	function launchSearch(typeId, term, query) {
    		
    		var context = Ext.create('Yamma.utils.Context', {
    			
    			label : i18n.t('controller.advancedsearch.title'),
    			query : query,
    			term : term
    			
    		});
    	
    		me.application.fireEvent('contextChanged', context);
    		
    	}    	
    	
    	
    }    
    
});