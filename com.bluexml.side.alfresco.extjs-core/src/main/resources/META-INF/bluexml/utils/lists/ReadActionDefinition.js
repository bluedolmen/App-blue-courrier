Ext.define('Bluexml.view.lists.ReadActionDefinition', {

	uses : [
		'Bluexml.view.forms.ViewFormWindow'
	],
	
	ICON_READ_ACTION : Bluexml.Site.getIconDefinition('magnifier_zoom_in'),	
	
	getReadActionDefinition : function(config) {
		var me = this;
		config = config || {};
		
		var genericDefinition = {
			icon : this.ICON_READ_ACTION.icon,
			tooltip : me.getReadActionTooltip(),
			handler : me.onReadAction,
			scope : me,
			getClass : function(value, metaData, record, rowIndex, colIndex, store) {
				return me.canRead(record) ? '' : 'x-hide-display';
			}
		};
		
		Ext.apply(genericDefinition, config);
		
		return genericDefinition;		
	},
	
	getReadActionTooltip : function() {
		return 'Voir le détail';
	},	

	/**
	 * By default, a user can alwas read a document
	 * @return {Boolean}
	 */
	canRead : function(record) {
		return (undefined === this.canEdit) || (!this.canEdit(record));
	},
	
	onReadAction : function(grid, rowIndex, colIndex, item, e) {		
		var record = grid.getStore().getAt(rowIndex);
		this.displayViewForm(record);
	},
	
	displayViewForm : function(record) {
		if (!record) {
			throw new Error('IllegalArgumentException! The record parameter is mandatory.');
		}
		
		var typeShort = this.getTypeShortRecordValue(record);
		var nodeRef = this.getNodeRefRecordValue(record);
		
		Ext.create('Yamma.view.forms.ViewFormWindow').load({
			itemId : typeShort,
			nodeRef : nodeRef
		});		
	},
	
	getTypeShortRecordValue : function(record) {
		return record.get('typeShort');
	},
	
	getNodeRefRecordValue : function(record) {
		return record.get('nodeRef');
	}
	
});