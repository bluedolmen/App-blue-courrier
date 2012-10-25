Ext.define('Yamma.model.OpenSearch',{
	
	extend : 'Ext.data.Model',
	uses : [
		'Yamma.utils.Constants'
	],
	
    fields: [
        {name: 'nodeRef', type: 'string'},
        {name: 'typeShort', type: 'string'},
        {name: 'name',  type: 'string', mapping : 'cm:name'},
        {name: 'reference', type : 'string', mapping : 'yamma-ee:Referenceable_reference'},
        {name: 'title', type : 'string', mapping : 'cm:title'},
        {
        	name: 'display', 
        	type : 'string', 
        	convert : function(value, record) {
        		
        		var 
        			name = record.get('name'),
        			typeShort = record.get('typeShort'),
        			title = record.get('title'),
        			typeDefinition = Yamma.utils.Constants.DOCUMENT_TYPE_DEFINITIONS[typeShort],
        			icon = typeDefinition.icon,
        			displayValue = ''
        				+ '<div>'
        				+ (icon ? '<img src="' + icon + '" align="left" style="padding-right:4px; vertical-align:middle" ></img> ' : '')
        				+ (title ? '<span><b>' + title + '</b></span>' : '')
        				+ (name ? '<span> (<i>' + name + '</i>)</span>' : '')
        				+ '</div>'
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
		'Bluexml.Alfresco'
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
    
    listConfig: {
		loadingText: 'Recherche...',
		emptyText: 'Aucun document trouvé.',

		//Custom rendering template for each item
		getInnerTpl: function(displayField) {
			return '{display}';
		}
	},
    
    initComponent : function() {
    	
    	var WS_URL = 'alfresco://bluexml/yamma/datasource/OpenSearch/data';
    	
    	this.store = Ext.create('Ext.data.Store', {
			model: 'Yamma.model.OpenSearch',
			proxy: {
			    type: 'ajax',
			    url : Bluexml.Alfresco.resolveAlfrescoProtocol(WS_URL),
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