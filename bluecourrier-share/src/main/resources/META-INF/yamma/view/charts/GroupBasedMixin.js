Ext.define('Yamma.view.charts.GroupBasedMixin', {
	
	/**
	 * Retrieve the services from the provided store
	 */
	getCachedGroupValues : function() {
		
		if (null == this.dataStore) return [];
		
		if (null == this.dataStore.cachedGroupValues) {
			this.dataStore.cachedGroupValues = Ext.Array.map(this.dataStore.getGroups(), function(group) {
				return group.name;
			});
		}
		
		return this.dataStore.cachedGroupValues;
		
	},	
	
	/**
	 * @protected
	 */
	getDocumentNumberAxeDefinition : function() {
		
		return ({
            title: false,
            type: 'Numeric',
            position: 'top',
            grid : true,
            fields: this.aggregatedFields,
            minimum: 0
		});
		
	},
	
	/**
	 * May not be used for some given charts.
	 * Here to get factorization
	 * @protected
	 */
	getGroupValuesAxeDefinition : function() {
		
		var me = this;
		
		if (!this.groupFieldName) {
			Ext.Error.raise("IllegalStateException! The 'groupFieldName' property has to be defined to use this definition");
		}
		
		return ({
            title: false,
            type : 'Category',
            position: 'left',
            fields: [ this.groupFieldName ],
            label : {
                rotate: {
                    degrees: 315
                },
            	renderer : function(value, label) {
            		return me.splitToMultiline(
            			me.getGroupValuesLabelTitle(value)
            		);
            	}
            }
		});
		
	},
	
	/**
	 * @protected
	 */
	getGroupValuesLabelTitle : function(value) {
		
		return value;
		
	}	
	
});