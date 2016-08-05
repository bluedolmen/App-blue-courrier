Ext.define('Yamma.view.windows.SelectCMSFileWindow', {

	extend : 'Yaecma.view.windows.SelectFileWindow',
	width : 500,
	height : 550,
	
	statics : {
		OPERATION_COPY : 'copy',
		OPERATION_MOVE : 'move'
	},
	
	documentsViewConfig : {
		rootRef : 'st:sites' 
	},
		
	getItems : function() {
		
		var items = this.callParent();
		
		items.push({
			xtype : 'checkbox',
			height : '30px',
			itemId : 'move-checkbox',
			boxLabel : "Déplacer le fichier",
			boxLabelAlign : 'after',
			checked : false,
			margin : '10 10 0 10'
		});
		
		items.push({
			xtype : 'textfield',
			height : '30px',
			itemId : 'filename-textfield',
			fieldLabel : 'Nom du fichier',
			regex : /^[a-zA-Z_][\w \-\.]*\.\w+$/,
			margin : '0 10 10 10',
			disabled : true
		});
		
		return items;
	},
	
	onFileSelectionChange : function(selectedFile) {
		
		var
			fileNameTextField = this.queryById('filename-textfield'),
			fileName = selectedFile ? selectedFile.get('cm:name') : null
		;
		
		if (null == selectedFile) {
			fileNameTextField.setRawValue('');
			fileNameTextField.disable();
		} else {
			fileNameTextField.setRawValue(fileName);
			fileNameTextField.enable();
		}
		
		this.callParent(arguments);
		
	},
	
	getOperation : function() {
		
		var
			moveCheckBox = this.queryById('move-checkbox'),
			checked = moveCheckBox.getValue()
		;
		
		return checked ?
			Yamma.view.windows.SelectCMSFileWindow.OPERATION_MOVE :
			Yamma.view.windows.SelectCMSFileWindow.OPERATION_COPY
		;
		
	},
	
	getFileName : function() {
		
		var
			fileNameTextField = this.queryById('filename-textfield'),
			fileName = fileNameTextField.getValue()
		;
		
		return fileName || null;
		
	}
	
	
	
	
});