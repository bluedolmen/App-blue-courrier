Ext.define('Yaecma.view.windows.SelectFileWindow', {

	extend : 'Ext.window.Window',
	alias : 'widget.selectfilewindow',
	
	requires : [
		'Yaecma.view.documents.DocumentsView'
	],
	
	title : 'Sélectionner un fichier',
	
	layout : 'vbox',
	
	defaults : {
		width : '100%'
	},
	
	documentsViewConfig : {},
	
	initComponent : function() {
		
		this.items = this.getItems() || [];
		
		this.buttons = [
			{
				text : 'OK',
				itemId : 'okButton',
				iconCls : Yaecma.Constants.getIconDefinition('accept').iconCls,
				handler : this.onOKClick,
				scope : this
				
			},
			{
				text : 'Annuler',
				itemId : 'cancelButton',
				iconCls : Yaecma.Constants.getIconDefinition('cancel').iconCls,
				handler : this.onCancelClick,
				scope : this
			}
		];
		
		this.addEvents('fileselected');
		
		this.callParent();
		
		this.documentsView.on('selectionchange', this.onSelectionChange, this);
		this.documentsView.on('fileselected', this.onFileSelected);
		
	},
		
	/**
	 * @protected
	 */
	getItems : function() {
		
		this.documentsView = Ext.create('Yaecma.view.documents.DocumentsView', 
			Ext.apply({
				xtype : 'documentsview',
				title : 'Liste des contenus',
				header : false,
				hideHeaders : true,
				flex : 1
			}, this.documentsViewConfig)
		);
		
		return [this.documentsView];
		
	},
	
	onOKClick : function(button) {
		
		var
			selectionModel = this.documentsView.getSelectionModel(),
			selected = selectionModel.getSelection(),
			record = selected[0]
		;
		
		if (null != record) {
			this.onFileSelected(record.get('nodeRef'), record);
		}		
		
	},
	
	onCancelClick : function(button) {
		this.close();
	},
	
	onSelectionChange : function(grid, selectedRecords) {

		var
			record = selectedRecords[0],
			isContainer = record ? record.get('isContainer') : false
		;
		
		if (Ext.isEmpty(selectedRecords) || isContainer) {
			this.onFileSelectionChange(null);
			return;
		}
		
		this.onFileSelectionChange(record);
		
	},
	
	onFileSelectionChange : function(selectedFile) {
		
		var
			okButton = this.queryById('okButton')
		;
		
		okButton.setDisabled(null == selectedFile);
		
	},
	
	onFileSelected : function(nodeRef, record) {
		if (!this.fireEvent('fileselected', nodeRef, record)) return;
		this.close();
	}
	
});