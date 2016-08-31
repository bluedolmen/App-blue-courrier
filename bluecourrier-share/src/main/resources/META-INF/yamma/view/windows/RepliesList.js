Ext.define('Yamma.view.windows.RepliesList', {

	extend : 'Yamma.utils.grid.StoreGridPanel',
	alias : 'widget.replieslist',
	
	requires : [
		'Yamma.utils.datasources.Replies'
	],
	
	title : i18n.t('view.window.replieslist.title'),//'Réponses au courrier',
	storeId : 'Replies',
	hasPaging : false,
	
	REPLY_NAME_TITLE : i18n.t('view.window.replieslist.name_title'),//'Nom du document',
	REPLY_AUTHOR_TITLE : i18n.t('view.window.replieslist.author_title'),//'Auteur',
	REPLY_WRITING_DATE_TITLE :i18n.t('view.window.replieslist.writing_date_title'),// 'Date de rédaction',
	REPLY_SENT_DATE_TITLE : i18n.t('view.window.replieslist.sent_date_title'),//'Date d\'envoi',
	
	getColumns : function() {
		
		return [
		
			this.getDocumentTypeColumnDefinition(),
		
			this.getNameColumnDefinition(),
			
			this.getAuthorColumnDefinition(),
			
			this.getWritingDateColumnDefinition(),
			
			this.getSentDateColumnDefinition()		
			
		];
		
	},	
	
	// TODO: Should be factorized with the one of MailsView...
	getDocumentTypeColumnDefinition : function() {
		
		return this.applyDefaultColumnDefinition (
		
			{
				xtype : 'actioncolumn',
				maxWidth : 30,
				tooltip : i18n.t('view.window.replieslist.columns.type'),//'Type', // if the plugin is applied on the containing table
				plugins : Ext.create('Bluedolmen.utils.grid.column.HeaderImage', {iconCls : Yamma.Constants.UNKNOWN_TYPE_DEFINITION.iconCls}),
				
				items : [
					{
			
						getClass : function(value, meta, record) {
							
							var typeDefinition =
								getMimeTypeDefinition(record) ||
								Yamma.Constants.UNKNOWN_TYPE_DEFINITION;					
							
							meta.tdAttr = 'data-qtip="' + typeDefinition.title + '"';
							return typeDefinition.iconCls;
						}
						
					}
					
				]
				
			}
		);
		
		function getMimeTypeDefinition(record) {
			var mimetype = record.get('mimetype');
			if (!mimetype) return null;
			
			return Yamma.Constants.MIME_TYPE_DEFINITIONS[mimetype];
		}		
	},
	
	getNameColumnDefinition : function(config) {
		
		return this.applyDefaultColumnDefinition (
			{
				width : 210,
				text : this.REPLY_NAME_TITLE,
				dataIndex : Yamma.utils.datasources.Replies.REPLY_NAME_QNAME
			}		
		);		
		
	},	
	
	getAuthorColumnDefinition : function(config) {
		
		return this.applyDefaultColumnDefinition (
			{
				width : 150,
				text : this.REPLY_AUTHOR_TITLE,
				dataIndex : Yamma.utils.datasources.Replies.REPLY_AUTHOR_QNAME
			}		
		);		
		
	},
	
	getWritingDateColumnDefinition : function() {
		
		return this.applyDefaultColumnDefinition(
			{
				xtype : 'datecolumn',
				text : this.REPLY_WRITING_DATE_TITLE,
				dataIndex :  Yamma.utils.datasources.Replies.REPLY_WRITING_DATE_QNAME
			}		
		);
		
	},
	
	getSentDateColumnDefinition : function() {
		
		return this.applyDefaultColumnDefinition(
			{
				xtype : 'datecolumn',
				text : this.REPLY_SENT_DATE_TITLE,
				dataIndex :  Yamma.utils.datasources.Replies.REPLY_SENT_DATE_QNAME
			}		
		);
		
	}
	
	
});