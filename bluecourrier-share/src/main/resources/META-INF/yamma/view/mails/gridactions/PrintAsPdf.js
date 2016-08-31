Ext.define('Yamma.view.mails.gridactions.PrintAsPdf.Window', {

	extend : 'Ext.window.Window',
	alias : 'widget.printaspdfwindow',
	
	title :  i18n.t('view.mails.gridactions.printaspdf.window.title'),
	iconCls : Yamma.Constants.getIconDefinition('printer').iconCls,
	layout : 'fit',
	resizable : true,
	
	bodyPadding : 10,
	
	width : 300,
	height : 200,
	
	items : [
		{
			xtype : 'fieldcontainer',
			defaultType : 'checkboxfield',
			
	        layout: 'anchor',
	        defaults: {
	            layout: '100%'
	        },
	        
			items : [
				{
					boxLabel : i18n.t('view.mails.gridactions.printaspdf.window.items.boxcover'),
					itemId : 'boxcover',
					checked : true
				},
				{
					boxLabel : i18n.t('view.mails.gridactions.printaspdf.window.items.boxattachments'),
					itemId : 'boxattachments',
					checked : true
				},
				{
					boxLabel : i18n.t('view.mails.gridactions.printaspdf.window.items.boxdoublesided'),
					itemId : 'boxdoublesided',
					checked : true
				},
				{
					boxLabel : i18n.t('view.mails.gridactions.printaspdf.window.items.boxbarcode'),
					itemId : 'boxbarcode'
				}
			]
		}
	],
	
	getConfig : function() {
		
		return {
			includeCover : this.down('#boxcover').getValue(),
			includeAttachments : this.down('#boxattachments').getValue(),
			doubleSided : this.down('#boxdoublesided').getValue(),
			includeBarcode : this.down('#boxbarcode').getValue()
		};
		
	},
	
	initComponent : function() {
		
		var
			me = this
		;
		
		this.buttons = [
			{
				text : i18n.t('view.mails.gridactions.printaspdf.window.buttons.generate'),
				itemId : 'generate-button',
				iconCls : me.iconCls,
				handler : me.onGenerate,
				scope : this
				
			},
			{
				text : i18n.t('view.mails.gridactions.printaspdf.window.buttons.cancel'),
				itemId : 'cancel-button',
				iconCls : Yamma.Constants.getIconDefinition('cancel').iconCls,
	        	handler : function() {
	        		me.close();
	        	},
				scope : this
			}
		];		
		
		this.callParent();
		
	},
	
	onGenerate : function(button, e) {
		
	},
	
	renderTo : Ext.getBody()
	
});


Ext.define('Yamma.view.mails.gridactions.PrintAsPdf', {

	extend : 'Yamma.view.mails.gridactions.SimpleNodeRefGridAction',
	
	uses : [
		'Yamma.view.mails.gridactions.SimpleTaskRefGridAction'
	],
	
	icon : Yamma.Constants.getIconDefinition('printer').icon,
	tooltip : i18n.t('view.mails.gridactions.printaspdf.tooltip'),
	
	actionUrl : 'alfresco://bluedolmen/yamma/print-to-pdf',
	method : 'GET',
	
	taskName : ['bcwfoutgoing:Sending'],
	
	supportBatchedNodes : true,
	
	WS_URL : 'alfresco://bluedolmen/yamma/print-to-pdf'
				+ '?nodeRefs={nodeRefs}'
				+ '&doubleSided={doubleSided}'
				+ '&stamp={stamp}'
				+ '&cover={cover}'
				+ '&attachments={attachments}'
	,
	
	options : null,
	doubleSided : true,
	
	isAvailable : function(record) {
		return Yamma.view.mails.gridactions.SimpleTaskRefGridAction.getFirstMatchingTask(record, this.taskName);
	},	
	
//	performBatchAction : function(records, preparationContext) {
//		
//		var nodeRefList = Ext.Array.map(records, function(record) {
//			return me.getDocumentNodeRefRecordValue(record);
//		});
//		
//		this.openPdfResultWindow([].concat(nodeRefList));
//		this.callParent();
//	},
	
	performServerRequest : function(nodeRefList, preparationContext) {
		
		this.openPdfResultWindow([].concat(nodeRefList));
		
	},
	
	prepareBatchAction : function(records) {
		
		var
			me = this,
			optionWindow = Ext.create('Yamma.view.mails.gridactions.PrintAsPdf.Window', {
				onGenerate : onGenerate
			})
		;
		
		function onGenerate() {
			me.options = optionWindow.getConfig();
			me.fireEvent('preparationReady', records);
			optionWindow.close();
		}
		
		optionWindow.show();
		
	},
	
	openPdfResultWindow : function(nodeRefList) {
		
		var 
		
			nodeRefCommaSeparatedList = nodeRefList.join(','),
			
			url = Bluedolmen.Alfresco.resolveAlfrescoProtocol(this.WS_URL)
				.replace(/\{nodeRefs\}/, nodeRefCommaSeparatedList)
				.replace(/\{doubleSided\}/, this.options.doubleSided)
				.replace(/\{stamp\}/, this.options.includeBarcode ? "barcode" : "")
				.replace(/\{cover\}/, this.options.includeCover)
				.replace(/\{attachments\}/, this.options.includeAttachments)
				
		;
		
		window.open(url, '_blank');
		
	}
	
});