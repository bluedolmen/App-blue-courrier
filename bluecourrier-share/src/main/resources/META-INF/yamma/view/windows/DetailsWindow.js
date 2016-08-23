Ext.define('Yamma.view.windows.DetailsWindow', {

	extend : 'Ext.window.Window',
	
	requires : [
		'Bluedolmen.utils.alfresco.forms.ViewFormFrame',
		'Yamma.view.history.DocumentHistoryList',
		'Yamma.view.windows.RepliesList'
	],
	
	title : i18n.t('view.window.assigntowindow.buttons.assign.text'),//'Fiche détaillée',
	layout : 'vbox',
	
	config : {
		documentNodeRef : null
	},

	height : Ext.getBody().getViewSize().height * 0.9,
    width : Ext.getBody().getViewSize().width * 0.8,
	
	defaults : {
		width : '100%',
		padding : 5
	},

	initComponent : function() {
		
		var documentNodeRef = this.getDocumentNodeRef();
		if (!documentNodeRef) {
			Ext.Error.raise(i18n.t('view.window.detailswindow.errors.init'));
		}
		
		this.items = this._getItems();
		
		this.callParent();
	},
	
	_getItems : function() {
		
		var 
			documentNodeRef = this.getDocumentNodeRef(),
		
			viewForm = Ext.create('Bluedolmen.utils.alfresco.forms.ViewFormFrame', {
				flex : 4,
				plain : true,
				autoScroll : false,
				
				formConfig : {
					formId : 'mail',
					itemId : documentNodeRef
				}
			}),
		
			documentHistoryList = Ext.create('Yamma.view.history.DocumentHistoryList', {
				flex : 2
			}),

			repliesList = Ext.create('Yamma.view.windows.RepliesList', {
				flex : 1
			}),
			
			loadConfig = {
				filters : [
					{
						property : 'nodeRef',
						value : documentNodeRef
					}
				]
			}
			
		;
		
		viewForm.load();
		documentHistoryList.load(loadConfig);
		repliesList.load(loadConfig);
		
		return [

			viewForm,
//			{
//				xtype : 'splitter',
//				height : 5
//			},
			documentHistoryList,
			repliesList
		
		];
		
	}
	
});