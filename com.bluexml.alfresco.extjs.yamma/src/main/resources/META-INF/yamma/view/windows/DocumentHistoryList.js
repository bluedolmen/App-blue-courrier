Ext.define('Yamma.view.windows.DocumentHistoryList', {

	extend : 'Yamma.utils.grid.YammaStoreList',
	alias : 'widget.documenthistorylist',
	
	title : 'Historique du courrier',
	storeId : 'History',
	hasPaging : false,
	
	EVENT_DATE_TITLE : 'Date',
	EVENT_DATE_QNAME : 'yamma-ee:Event_date',
	
	EVENT_TYPE_TITLE : 'Libellé',
	EVENT_TYPE_QNAME : 'yamma-ee:Event_eventType',
	
	EVENT_COMMENT_TITLE : 'Commentaire',
	EVENT_COMMENT_QNAME : 'yamma-ee:Event_comment',
	
	EVENT_REFERRER_TITLE : 'Acteur',
	EVENT_REFERRER_QNAME : 'yamma-ee:Event_referrer_displayName',
	
	storeConfigOptions : {
		
	    sorters : [
		    {
		    	property : 'yamma-ee:Event_date',
		    	direction : 'ASC'
		    }
	    ]
	    
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
				dataIndex :  this.EVENT_DATE_QNAME
			}		
		);
		
	},
	
	getTypeColumnDefinition : function(config) {
		
		return this.applyDefaultColumnDefinition(
			{
				xtype : 'gridcolumn',
				text : this.EVENT_TYPE_TITLE,
				dataIndex :  this.EVENT_TYPE_QNAME
			}		
		);
		
	},
	
	getCommentColumnDefinition : function(config) {
		
		return this.applyDefaultColumnDefinition(
			{
				xtype : 'gridcolumn',
				flex : 1,
				text : this.EVENT_COMMENT_TITLE,
				dataIndex :  this.EVENT_COMMENT_QNAME
			}		
		);
		
	},
	
	getReferrerColumnDefinition : function() {
		
		return this.applyDefaultColumnDefinition(
			{
				xtype : 'gridcolumn',
				text : this.EVENT_REFERRER_TITLE,
				dataIndex :  this.EVENT_REFERRER_QNAME
			}		
		);

	}
	
	
});