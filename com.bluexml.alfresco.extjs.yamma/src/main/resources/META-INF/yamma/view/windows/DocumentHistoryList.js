Ext.define('Yamma.view.windows.DocumentHistoryList', {

	extend : 'Yamma.utils.grid.YammaStoreList',
	alias : 'widget.documenthistorylist',
	
	requires : [
		'Bluexml.utils.grid.column.HeaderImage',
		'Yamma.utils.datasources.History'
	],
	
	title : 'Historique du courrier',
	storeId : 'History',
	hasPaging : false,
	
	EVENT_DATE_TITLE : 'Date',
	EVENT_TYPE_TITLE : 'Libellé',
	EVENT_COMMENT_TITLE : 'Commentaire',
	EVENT_REFERRER_TITLE : 'Acteur',

	storeConfigOptions : {		
	    
	},
	
	initComponent : function() {
		
		this.storeConfigOptions.sorters = [{
	    	property : Yamma.utils.datasources.History.EVENT_DATE_QNAME,
	    	direction : 'ASC'			
		}];
		this.callParent(arguments);
		
	},
		
	getColumns : function() {
		return [
		
			/* Event date */
			this.getDateColumnDefinition(),
		
			/* Event type */
			this.getTypeColumnDefinition(),
			
			/* Event comment */
			this.getCommentColumnDefinition(),

			/* Event referrer */
			this.getReferrerColumnDefinition()
			
		];
	},	
	
	getDateColumnDefinition : function() {
		
		return this.applyDefaultColumnDefinition(
			{
				xtype : 'datecolumn',
				text : this.EVENT_DATE_TITLE,
				dataIndex :  Yamma.utils.datasources.History.EVENT_DATE_QNAME
			}		
		);
		
	},
	
	getTypeColumnDefinition : function(config) {
		
		return this.applyDefaultColumnDefinition(
			{
				xtype : 'gridcolumn',
				text : this.EVENT_TYPE_TITLE,
				dataIndex :  Yamma.utils.datasources.History.EVENT_TYPE_QNAME
			}		
		);
		
	},
	
	getCommentColumnDefinition : function(config) {
		
		return this.applyDefaultColumnDefinition(
			{
				xtype : 'gridcolumn',
				flex : 1,
				text : this.EVENT_COMMENT_TITLE,
				dataIndex :  Yamma.utils.datasources.History.EVENT_COMMENT_QNAME
			}		
		);
		
	},
	
	getReferrerColumnDefinition : function() {
		
		return this.applyDefaultColumnDefinition(
			{
				xtype : 'gridcolumn',
				text : this.EVENT_REFERRER_TITLE,
				dataIndex :  Yamma.utils.datasources.History.EVENT_REFERRER_QNAME
			}		
		);

	}
	
	
});