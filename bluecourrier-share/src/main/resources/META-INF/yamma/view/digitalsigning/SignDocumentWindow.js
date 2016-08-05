Ext.define('Yamma.view.digitalsigning.SignDocumentWindow', {
	
	extend : 'Ext.window.Window',
	
	requires : [
	    'Yamma.view.digitalsigning.SignDocumentPanel'
	],
	
	title: 'Certification du document',
	width: 400,
	height : 600,
	modal : true,
	
	nodeRef : null,

	layout : 'fit',
	
	initComponent : function() {
		
		var 
			me = this
		;
		
		this.items = [{
			
			xtype : 'signdocumentpanel',
			itemId : 'form',
			header : false,
			nodeRef : me.nodeRef,
			flex : 1,
			style: {
				border : '0px'
			}
			
		}];
		
		this.callParent();
		
	},
	
	getFormValues : function() {
		
		var
			form = this.queryById('form')
		;
		
		return form.getValues();
		
	}
	
});
