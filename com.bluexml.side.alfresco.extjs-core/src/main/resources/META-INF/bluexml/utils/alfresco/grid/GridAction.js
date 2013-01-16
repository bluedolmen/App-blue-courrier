Ext.define('Bluexml.utils.alfresco.grid.GridAction', {

    mixins: {
        observable: 'Ext.util.Observable'
    },

    constructor: function (config) {
    	
        this.mixins.observable.constructor.call(this, config);

        this.addEvents(
            'success',
            'failure',
            'preparationReady',
            'beforePerformAction',
            'performAction'
        );
        
        this.on('preparationReady', this.onPreparationReady, this);
    },	
	
    /**
     * @private
     * @type Object
     */
	grid : null,
	
	/**
	 * @cfg {String} The icon path which represents the action
	 */
	icon : null,
	
	/**
	 * @cfg {String} The tooltip message of the action
	 */
	tooltip : '',
	
	/**
	 * @cfg {String} The field-name of the record value that may be used to
	 *      identify if the action is available. If not defined then, the
	 *      appropriate method (@see #isAvailable) should be implemented.
	 */
	availabilityField : null,

	/**
	 * @cfg {Boolean} Whether the grid should be made busy when the action
	 *      performs. The grid-action has to be initialized correctly (using
	 *      gridactions attribute) in order for this to work.
	 */
	showBusy : false,
	
	/**
	 * @cfg {Boolean} [true] Determine if the preparation will be made on each
	 *      record or once globally, the resulting context being passed to the
	 *      (batched) action execution.
	 * 
	 */
	prepareOnce : true,
	
	hideClass : Ext.baseCSSPrefix + 'hide-display',
	
	init : function(grid) {
		if (!grid) return;
		
		this.grid = grid;
	},	
	
	getActionDefinition : function(index) {
		
		var 
			me = this,
			defaultDefinition =	{
				icon : me.icon,
				tooltip : me.tooltip,
				handler : me.onActionLaunched,
				scope : me,
				
				getClass : function(value, meta, record) {
					
					var isAvailable = me.isAvailable(record);
					if (Ext.isFunction(isAvailable)) {
						
						// postponed availability
						function onAvailable(available) {
							
							if (true !== available) return; // do nothing
							
							Ext.defer(function() {
								var item = me.grid.down('x-action-col-{' + index + '}');
								if (!item) return;
								
								item.show();
							});
							
						}
						
						isAvailable(onAvailable);
						return me.hideClass; // default is hiding
						
					} 
					
					// The availability on the deferred function is untested and likely to be buggy
					return (isAvailable) ? '' : me.hideClass;
					
				}
			},
			overridigDefinition = me.getOverridingActionDefinition() || {},
			definition = Ext.apply(defaultDefinition, overridigDefinition)
		;
		
		return definition;
		
	},
	
	getOverridingActionDefinition : function() {
		return null;
	},
	
	/**
	 * Determines if the action is available w.r.t. the provided record.
	 * A context may be provided to provide deeper information (e.g. when
	 * testing on multiple records).
	 *  
	 * @param {Ext.data.Model} record
	 * @param {Object} context
	 * @return {Boolean}
	 */
	isAvailable : function(record, context) {
		
		if ( Ext.isArray(record)) return this.isBatchAvailable(record, context);
		
		if (this.availabilityField) {
			var actionAvailable = record.get(this.availabilityField);
			return (true === actionAvailable);			
		}
		
		return true;
	},
	
	isBatchAvailable : function(records, context) {
		
		var 
			me = this,
			isAvailable = true
		;
		
		Ext.each(records, function(record) {
			isAvailable &= me.isAvailable(record, context);
			return isAvailable; // break on isAvailable = false
		}, this);
		
		return isAvailable;
		
	},
	
	onActionLaunched : function(grid, rowIndex, colIndex, item, e) {
		
		var 
			record = grid.getStore().getAt(rowIndex)
		;
		
		this.launchAction(record, item, e);
		
	},

	/**
	 * This may work on single or iteratble data.
	 * 
	 * @param {Ext.util.MixedCollection} records
	 */
	launchAction : function(records) {
		
		records = Ext.isArray(records) ? records : [records];
		
		if (this.prepareOnce) {			
			this.prepareBatchAction(records);
		} else {
			this.performBatchAction(records, {});
		}
		
	},
	
	getParameters : function(record) {
		return [record];
	},
	
	prepareBatchAction : function(records) {
		this.prepareAction();
		this.fireEvent('preparationReady', records, {});
	},
	
	prepareAction : function(record) {
		if (null == record) return;
		this.fireEvent('preparationReady', record, {});
	},
	
	onPreparationReady : function(records, preparationContext) {
		
		if (null === records) return;
		
		if ( Ext.isArray(records)) {
			this.performBatchAction(records, preparationContext);
		} else {
			var record = records;
			this.performActionInternal(record, preparationContext);
		}
		
	},
	
	performBatchAction : function(records, preparationContext) {
		
		if (! Ext.isArray(records)) Ext.Error.raise('IllegalStateException! The provided parameter is not iterable.');
		
		var
			me = this
		;
		
		Ext.each(records, function(record) {
			
			if (!me.prepareOnce) {
				me.prepareAction(record);
			} else {
				me.performActionInternal(record, preparationContext);
			}
			
		});
		
	},
	
	/**
	 * @private
	 */
	performActionInternal : function(record, preparationContext) {
		
		var 
			doPerformAction = this.fireEvent('beforePerform', this, record, preparationContext, this.grid),
			parameters
		;
		if (false === doPerformAction) return; // continue
		
		parameters = this.getParameters(record).concat(preparationContext);
		return this.performAction.apply(this, parameters);
		
	},
	
	performAction : function(/* arguments */) {
		
		this.fireEvent('actionComplete', this, this.grid, arguments);
		
	},
	
	refreshGrid : function(keepSelection, onRefreshPerformed) {
		if (null == this.grid) return;
		this.grid.refresh(keepSelection, onRefreshPerformed);
	},
	
	setBusy : function(isBusy) {
		
		if (null == this.grid) return;
		this.grid.setLoading(true === isBusy);
		
	}
	
});