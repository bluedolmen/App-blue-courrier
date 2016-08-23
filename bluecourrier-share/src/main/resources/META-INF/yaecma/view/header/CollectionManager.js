Ext.define('Yaecma.view.header.CollectionManager', {

	COLLECTION_EMPTY_ICON : Yaecma.Constants.getIconDefinition('collection_empty', 32),
	COLLECTION_FULL_ICON : Yaecma.Constants.getIconDefinition('collection_full', 32),
	
	extend : 'Ext.button.Button',
	alias : 'widget.collectionmanager',
	
	text : '',
	iconAlign : 'left',
	width : 100,
	
	menu : [],
	
	storedDocuments : [],
	
	style : {
		'background-image' : 'none' // forced because there is a problem (bug?) with setting the icon dynamically 
	},
	
	initComponent : function() {
		
		this.setScale('large');
		this._updateState();
		
		this.callParent(arguments);
		
	},
	
	isEmpty : function() {
		return Ext.isEmpty(this.storedDocuments);
	},
	
	getDocumentNumber : function() {
		return this.storedDocuments.length;
	},
	
	_updateState : function() {
		
		var 
			documentNumber = this.getDocumentNumber(),

			icon = (0 == documentNumber) 
				? this.COLLECTION_EMPTY_ICON.icon
				: this.COLLECTION_FULL_ICON.icon,
				
			text = (0 == documentNumber)
				? i18n.t('widget.collectionmanager.state.update.none')
				: '' + documentNumber + ' doc.'
		;
		this.setIcon(icon);
		this.setText(text);
		
	},
	
	collectionDocument : function(nodeRef, record) {
		this.storedDocuments.push(record);
	}
	
});