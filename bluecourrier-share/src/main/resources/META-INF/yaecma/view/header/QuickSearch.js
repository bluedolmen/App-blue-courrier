Ext.define('Yaecma.view.header.QuickSearch', {

	extend : 'Ext.form.field.ComboBox',
	alias : 'widget.quicksearch',
	
	uses : [
		'Yaecma.model.QuickSearch'
	],
	
	DATASOURCE_URL : 'alfresco://bluedolmen/yaecma/datasource/quicksearch/data',
	
    fieldLabel: '',//Recherche rapide',
    labelClsExtra : 'icon-magnifier_zoom_in',
    labelWidth : 30,
    queryMode: 'remote',
    queryParam: '@term',
    valueField: 'nodeRef',
    hideTrigger : true,
    width : 300,
    grow : true,
    
    listConfig: {
		loadingText: i18n.t('widget.quicksearch.config.loading'),
		emptyText: i18n.t('widget.quicksearch.config.empty'),

		//Custom rendering template for each item
		getInnerTpl: function(displayField) {
			return '{display}';
		}
	},
    
    initComponent : function() {
    	
    	this.store = Ext.create('Ext.data.Store', {
			model: 'Yaecma.model.QuickSearch',
			proxy: {
			    type: 'ajax',
			    url : Bluedolmen.Alfresco.resolveAlfrescoProtocol(this.DATASOURCE_URL),
			    reader: {
			        type: 'json',
			        root: 'items'
			    }
			}
		});
		
		this.callParent();
    },
    
    listeners : {
    	beforequery : function(queryEvent, eOpts) {
    		if (!queryEvent.query || queryEvent.length < 2) {
    			queryEvent.cancel = true;
    			return;
    		}
    		
    		queryEvent.query = this.adaptQuery(queryEvent.query);
    	}
    },
    
    adaptQuery : function(query) {
    	return '*' + query + '*';
    }
	
	
});