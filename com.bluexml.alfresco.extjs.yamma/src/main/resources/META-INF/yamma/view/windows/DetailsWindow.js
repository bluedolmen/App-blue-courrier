Ext.define('Yamma.view.windows.DetailsWindow', {

	extend : 'Ext.window.Window',
	
	requires : [
		'Bluexml.utils.alfresco.forms.ViewFormFrame',
		'Yamma.view.windows.DocumentHistoryList',
		'Yamma.view.windows.RepliesList'
	],
	
	title : 'Fiche détaillée',
	layout : 'vbox',
	
	config : {
		documentNodeRef : null
	},

	height : Ext.getBody().getViewSize().height,
    width : Ext.getBody().getViewSize().width * 0.8,
	
	defaults : {
		
		padding : 5
		
	},

	initComponent : function() {
		
		var documentNodeRef = this.getDocumentNodeRef();
		if (!documentNodeRef) {
			Ext.Error.raise('IllegalStateException! The window has to be initialized with a valid documentNodeRef');
		}
		
		this.items = this.getItems();
		
		this.callParent();
	},
	
	getItems : function() {
		
		var documentNodeRef = this.getDocumentNodeRef();
		
		var viewForm = Ext.create('Bluexml.utils.alfresco.forms.ViewFormFrame', {
			width : '100%',
			flex : 4,
			plain : true,
			autoScroll : false,
			
			formConfig : {
				itemId : documentNodeRef
			}
		});
		viewForm.load();
		
		var documentHistoryList = Ext.create('Yamma.view.windows.DocumentHistoryList', {
			width : '100%'
		});
		documentHistoryList.load({
			filters : [
				{
					property : 'nodeRef',
					value : documentNodeRef
				}
			]
		});

		var repliesList = Ext.create('Yamma.view.windows.RepliesList', {
			width : '100%'		
		});
		repliesList.load({
			filters : [
				{
					property : 'nodeRef',
					value : documentNodeRef
				}
			]
		});
		
		return [

			viewForm,
			documentHistoryList,
			repliesList
		
		];
		
	}
	
});