/**
 * Meant to be used as a mixin of a given component.
 * <p>
 * This piece of code enables to retrieve and define columns based
 * on the generic datasource definition.
 */
Ext.define('Bluedolmen.utils.alfresco.grid.AlfrescoStoreTable', {
	
	requires : [
		'Bluedolmen.utils.grid.column.HeaderTooltip',
		'Bluedolmen.utils.grid.column.HeaderImage'
	],
	
	mixins : {
		alfrescostoreaware : 'Bluedolmen.store.AlfrescoStoreAware'
	},
	
	plugins : [
		'headertooltip'
	],
	
	DEFAULT_DATE_FORMAT : 'd/m/Y',

 	load : function(storeConfigOptions, proxyConfigOptions) {
 		
 		var me = this;
 		
 		if (me.columns && me.columns.length == 0) {
	 		this.refreshColumns(/* onColumnRefreshed */ delegatedLoad );
 		} else {
 			delegatedLoad();
 		};
 		
 		function delegatedLoad() {
 			me.mixins.alfrescostoreaware.load.call(me, storeConfigOptions, proxyConfigOptions);
 		}
 	},
 	
 	/**
	 * Clears the embedded data.
	 * 
	 * @param {Boolean}
	 *            [removeColumns=false] Also remove columns when clearing
	 */
 	clear : function(removeColumns) {
 		
 		this.clearStore();
 		if (true === removeColumns) {
 			me.columns = null;
 		}
 		
 	},
 	
 	onStoreAvailable : function(store) {
 		
 		this.reconfigure(store);
 		this.mixins.alfrescostoreaware.onStoreAvailable.call(this, store);
 		
 	}, 	
 	
 	refreshColumns : function(onColumnRefreshed) {
 		
		var me = this;
		
		// initialize columns
		this.retrieveColumnDefinition(
			/* onColumnDefinitionRetrieved */
			function(columnsDefinition) {
				var extjsColumns = mapColumnsDefinition(columnsDefinition);
				me.reconfigure(null, extjsColumns);
				onColumnRefreshed.call(this);
			}
		);
		
	    /**
		 * This method maps the column-definition from Alfresco to the ExtJS
		 * definition
		 * 
		 * @param {}
		 *            columnsDefinition
		 * @return {}
		 */
	    function mapColumnsDefinition(columnsDefinition) {
	    	
	 		return Ext.Array.map(columnsDefinition,
	 		
	 			function(columnDefinition, index, array) {
					return me.mapColumnDefinition(columnDefinition); 				
	 			}
	 			
	 		);
	 				 		
	    }



 	},
 	
 	/**
	 * Helper method that call a WS to retrieve the columns-definition
	 * <p>
	 * The current implementation relies on field datasource definition. An
	 * improved version would rely on a specific WS to retrieve
	 * column-definition which may depend on other factors (e.g.
	 * user-preferences)
	 */
	retrieveColumnDefinition : function(onColumnDefRetrieved) {
 	
		if (!this.storeId) {
			throw new Error('The storeId "' + this.storeId + '" is not a valid non-empty String');
		}

		this.getStoreFactory().requestDatasourceDefinition(
		
			this.storeId,
			
			/* onDatasourceDefinitionRetrieved */
			function(datasourceDefinition) {
				onColumnDefRetrieved(datasourceDefinition.fields);					
			}
			
		);
		
 	},
    
    /**
	 * Get the config object of a given column based on the Alfresco-based
	 * BritairStore retrieved definition
	 * 
	 * @param {Object}
	 *            columnDefinition
	 * @return {Object} the config object of the ExtJS datagrid column
	 * @see Ext.grid.column.Column
	 */
    mapColumnDefinition : function(columnDefinition) {
    	
		var config = this.getColumnDefinition(columnDefinition.name, columnDefinition);
		return this.applyDefaultColumnDefinition(config);

    },
    
    applyDefaultColumnDefinition : function(columnDefinition) {
    	var defaultConfig = this.getDefaultColumnDefinition(columnDefinition.xtype);
    	return Ext.applyIf(columnDefinition, defaultConfig);
    },
    
    /**
     * 
     * @param {String} xtype (optional) to get default values based on column type
     * @return {}
     */
    getDefaultColumnDefinition : function(xtype) {
    	
    	var me = this;
		var definition = {
					
			xtype : xtype || 'gridcolumn',
			text : '',
			hideable : false,			
			groupable : false
			
		};
		
		var additional = {};
		
		switch (xtype) {
			case 'datecolumn' :
				additional = {
					format : me.DEFAULT_DATE_FORMAT,
					align : 'center',
					width : 100,
					maxWidth : 150
				};
			break;
		}
		Ext.apply(definition, additional);
    	
		return definition;
    },
    
    getColumnDefinition : function(columnName, columnDefinition) {
    	
		return {
					
			xtype : this.getColumnType(columnDefinition),		
			text : this.getColumnLabel(columnDefinition),
			dataIndex : columnDefinition.name
			
		};
    	
    },
    
    /**
	 * Generic behaviour to map a column definition to a column-type (xtype)
	 * 
	 * @param {Object}
	 *            columnDefinition
	 * @return {String} the xtype of the column
	 */
    getColumnType : function(columnDefinition) {

    	var dataType = columnDefinition.type;
		var columnType = {
			"int" : "numbercolumn",
			"long" : "numbercolumn",
			"float" : "numbercolumn",
			"double" : "numbercolumn",
			"date" : "datecolumn",
			"datetime" : "datecolumn",
			"boolean" : "booleancolumn"
		}[dataType];
		
		return columnType ? columnType : 'gridcolumn';
    	
    },
    
    /**
	 * Default behaviour to get the label of the column
	 * 
	 * @param {Object}
	 *            columnDefinition
	 * @return {String} the label of the column
	 */
    getColumnLabel : function(columnDefinition) {
    	return columnDefinition.label || columnDefinition.name;
    }
	
	
});