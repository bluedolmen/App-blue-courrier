Ext.define('Bluexml.utils.alfresco.grid.GridAction', {

    mixins: {
        observable: 'Ext.util.Observable'
    },

    constructor: function (config) {
    	
        this.mixins.observable.constructor.call(this, config);

        this.addEvents(
            'success',
            'failure',
            'beforePerformAction',
            'performAction'
        );
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
	
	init : function(grid) {
		if (!grid) return;
		
		this.grid = grid;
	},
	
	getActionDefinition : function() {
		
		var 
			me = this,
			defaultDefinition =	{
				icon : me.icon,
				tooltip : me.tooltip,
				handler : me.onActionLaunched,
				scope : me,
				
				getClass : function(value, meta, record) {
					return (!me.isAvailable(record)) ? (Ext.baseCSSPrefix + 'hide-display') : '';  
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
	
	isAvailable : function(record) {
		
		if (this.availabilityField) {
			var actionAvailable = record.get(this.availabilityField);
			return (true === actionAvailable);			
		}
		
		return true;
		
	},
	
	onActionLaunched : function(grid, rowIndex, colIndex, item, e) {
		var 
			record = grid.getStore().getAt(rowIndex),
			parameters = this.getParameters(record)
		;
		
		this._performAction.apply(this, parameters);
	},
	
	getParameters : function(record) {
		return [record];
	},
	
	_performAction : function(/* arguments */) {
		
		var doPerformAction = this.fireEvent('beforePerformAction', this, this.grid);
		if (false === doPerformAction) return;
				
		var result = this.performAction.apply(this, arguments);
		this.fireEvent('performAction', this, this.grid, result);
	},
	
	performAction : function(/* arguments */) {
		
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