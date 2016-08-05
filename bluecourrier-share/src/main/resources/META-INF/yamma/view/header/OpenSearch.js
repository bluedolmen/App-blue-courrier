Ext.define('Yamma.model.OpenSearch',{
	
	extend : 'Ext.data.Model',
	uses : [
		'Yamma.utils.Constants'
	],
	
    fields: [
        {name: 'nodeRef', type: 'string'},
        {name: 'typeShort', type: 'string'}, 
        {name: 'kind', type: 'string', mapping : Yamma.utils.datasources.Documents.MAIL_KIND_QNAME},
        {name: 'name',  type: 'string', mapping : 'cm:name'},
        {name: 'reference', type : 'string', mapping : Yamma.utils.datasources.Documents.REFERENCEABLE_REFERENCE_QNAME},
        {name: 'object', type : 'string', mapping : Yamma.utils.datasources.Documents.MAIL_OBJECT_QNAME},
        {
        	name: 'display', 
        	type : 'string', 
        	convert : function(value, record) {
        		
        		var 
        			name = record.get('name'),
        			kind = record.get('kind'),
        			object = record.get('object'),
        			reference = record.get('reference'),
        			typeDefinition = Yamma.utils.Constants.DOCUMENT_TYPE_DEFINITIONS[kind || 'mail'] || Yamma.utils.Constants.DOCUMENT_TYPE_DEFINITIONS['mail'],
        			icon = typeDefinition.icon,
        			displayValue = ''
        				+ '<div>'
        				+ (icon ? '<img src="' + icon + '" align="left" style="padding-right:4px; vertical-align:middle" ></img> ' : '')
        				+ (reference ? '<span>[' + reference + '] </span>' : '')
        				+ (object ? '<span><b>' + object + '</b></span>\n' : '')
        				+ (name ? '<span> <i>' + name + '</i></span>' : '')
        				+ '</div>'
        		;
        		
        		return displayValue;
        		
        	}
        },
        {
        	name : 'textDisplay',
        	type : 'string',
        	convert : function(value, record) {
        		
        		var 
	    			name = record.get('name'),
	    			object = record.get('object'),
	    			reference = record.get('reference'),
	    			displayValue = ''
	    				+ (reference ? '[' + reference + '] ' : '')
	    				+ (object ? object : name)
	    				+ (object ? ' (' + name + ')' : '')
	    		;
	    		
	    		return displayValue;
        		
        	}
        }
        
    ]

});

Ext.define('Yamma.view.header.OpenSearch', {

	extend : 'Ext.form.field.ComboBox',
	alias : 'widget.opensearch',
	
	requires : [
		'Bluedolmen.Alfresco'
	],
	
    fieldLabel: '',//Recherche rapide',
    labelClsExtra : 'icon-magnifier_zoom_in',
    labelWidth : 30,
    queryMode: 'remote',
    queryParam: '@term',
    valueField: 'nodeRef',
    hideTrigger : true,
    width : 300,
    grow : true,
    autoSelect : false,
    
    listConfig: {
		loadingText: 'Recherche...',
		emptyText: 'Aucun document trouvé.',

		//Custom rendering template for each item
		getInnerTpl: function(displayField) {
			return '{display}';
		}
	},
    
    initComponent : function() {
    	
    	var WS_URL = 'alfresco://bluedolmen/yamma/datasource/OpenSearch/data';
    	
    	this.store = Ext.create('Ext.data.Store', {
			model: 'Yamma.model.OpenSearch',
			proxy: {
			    type: 'ajax',
			    url : Bluedolmen.Alfresco.resolveAlfrescoProtocol(WS_URL),
			    reader: {
			        type: 'json',
			        root: 'items'
			    }
			},
			remoteFilter : true // for any added post-filters to avoid local filtering
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
    	
    	return (
    		(Ext.String.startsWith('*') ? '' : '*') + 
    		query + 
    		(Ext.String.endsWith('*') ? '' : '*')
    	);
    	
    }
	
	
});