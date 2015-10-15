Ext.define('Yamma.view.edit.EditDocumentView', {

	extend : 'Ext.container.Container',
//	extend : 'Ext.panel.Panel',
	alias : 'widget.editdocumentview',
	
	requires : [
		'Yamma.view.edit.EditDocumentForm',
		'Yamma.view.comments.CommentsView',
		'Yamma.view.attachments.AttachmentsView',
		'Yamma.view.history.DocumentHistoryList'
//		'Yamma.utils.datasources.Documents'
	],
	
//	layout : 'accordion',
//    layoutConfig: {
//		titleCollapse: false,
//		animate: false
//    },
	
	layout : 'hbox',
	
	defaults : {
		height : '100%',
		split : true,
		border : 1
	},
	
//	border : 1,
	
	items : [
 		{
			xtype : 'tabpanel',
			width : '100%',
			defaults : {
				border : 0
			},
			items : [
				{
					xtype : 'threadedview',
					id : 'threadedview'
				},
			         
		 		{
					xtype : 'editdocumentform'
				},
				{
					xtype : 'documenthistorylist',
					title : 'Historique',
					hideHeaders : true
				},
				{
					xtype : 'commentsview'
				},
		 		{
					xtype : 'attachmentsview'
				}
			]
//			,
//			margin : '0 2 0 0'			
		}
// 		,
//		{
//			xtype : 'tabpanel',
//			width : '40%',
//			defaults : {
//				border : 0
//			},			
//			items : [
//					{
//						xtype : 'commentsview'
//					},
//			 		{
//						xtype : 'attachmentsview'
//					}
//			],
//			margin : '0 0 0 2'
//		},
	],
	
	updateContext : function(context) {
		
		var
			nodeRef = context.get('nodeRef') || Ext.Error.raise('IllegalArgumentException! The provided nodeRef is not valid'),	
			formId = this.getFormId(context),
			permissions = context.get('permissions'),
			
			editDocumentForm = this.getEditDocumentForm(),
			commentsView = this.getCommentsView(),
			attachmentsView = this.getAttachmentsView(),
			documentHistoryList = this.getDocumentHistoryList()
		;
		
		editDocumentForm.dload(nodeRef, formId, false /* forceLoad */, permissions);
		commentsView.dload(nodeRef, permissions);
		attachmentsView.dload(nodeRef, permissions);
		documentHistoryList.dload(nodeRef, permissions);
		
	},
	
	getFormId : function(context) {
		
		var
			origin = context.get(Yamma.utils.datasources.Documents.MAIL_ORIGIN_QNAME),
			state = context.get(Yamma.utils.datasources.Documents.STATUSABLE_STATE_QNAME)
		;
			
		if ('manual' == origin) return 'fill-online';
//		if (state) return 'state_' + state.replace(/[^\w]/g,'_');
		
		return 'mail';
		
	},
	
	getEditDocumentForm : function() {
		
		if (!this.editDocumentForm) { 
			this.editDocumentForm = this.down('editdocumentform');
		}
		return this.editDocumentForm;
		
	},
	
	getCommentsView : function() {
		
		if (!this.commentsView) {
			this.commentsView = this.down('commentsview');
		}
		return this.commentsView;
		
	},
	
	getAttachmentsView : function() {
		
		if (!this.attachmentsView) {
			this.attachmentsView = this.down('attachmentsview');
		}
		return this.attachmentsView;
		
	},
	
	getDocumentHistoryList : function() {
		
		if (!this.documentHistoryList) {
			this.documentHistoryList = this.down('documenthistorylist');
		}
		return this.documentHistoryList;
		
	},
	
	clear : function() {
		
		var 
			editDocumentForm = this.getEditDocumentForm(),
			commentsView = this.getCommentsView(),
			attachmentsView = this.getAttachmentsView(),
			documentHistoryList = this.getDocumentHistoryList()
		;
		
		editDocumentForm.dclear();
		commentsView.dclear();
		attachmentsView.dclear();
		documentHistoryList.dclear();
		
	}
	
	
});