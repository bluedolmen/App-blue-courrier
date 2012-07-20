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
        {
        	name: 'display', 
        	type : 'string', 
        	convert : function(value, record) {
        		
        		var name = record.get('name');
        		var reference = record.get('reference');
        		var typeShort = record.get('typeShort');

        		var typeDefinition = Yamma.utils.Constants.DOCUMENT_TYPE_DEFINITIONS[typeShort];
        		var icon = typeDefinition.icon;
        		
        		var displayValue = '';
        		if (icon)
        			displayValue += '<img src="' + icon + '"></img> ';
        		
        		if (reference)
        			displayValue += '<span><b>' + reference + '</b> – </span>';
        		
        		displayValue += '<span><i>' + name + '</i></span>';
        		
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
	
    fieldLabel: 'Recherche rapide',
    queryMode: 'remote',
    queryParam: '@term',
    valueField: 'nodeRef',
    hideTrigger : true,
    width : 350,
    grow : true,
    
    listConfig: {
		loadingText: 'Recherche...',
		emptyText: 'Aucun document trouvé.',

		//Custom rendering template for each item
		getInnerTpl: function(displayField) {
			return '{display}';
            //return '<span><b>{reference}</b></span> – <span><i>{name}</i></span>';
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