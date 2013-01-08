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
	EVENT_ACTOR_TITLE : 'Acteur',

	storeConfigOptions : {		
	    
	},
	
	initComponent : function() {
		
		this.storeConfigOptions.sorters = [{
	    	property : Yamma.utils.datasources.History.EVENT_DATE_QNAME,
	    	direction : 'DESC'			
		}];
		this.callParent(arguments);
		
	},
		
	getColumns : function() {
		return [
		
			/* Event type */
			this.getActionTypeColumnDefinition(),
			
			/* Event date */
			this.getDateColumnDefinition(),
		
			/* Event comment */
			this.getCommentColumnDefinition(),

			/* Event actor */
			this.getActorColumnDefinition()
			
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
				dataIndex :  Yamma.utils.datasources.History.EVENT_TYPE_QNAME,
				sortable : false
			}
		);
		
	},
	
	getCommentColumnDefinition : function(config) {
		
		return this.applyDefaultColumnDefinition(
			{
				xtype : 'gridcolumn',
				flex : 1,
				text : this.EVENT_COMMENT_TITLE,
				dataIndex :  Yamma.utils.datasources.History.EVENT_COMMENT_QNAME,
				sortable : false
			}		
		);
		
	},
	
	ACTOR_TEMPLATE : new Ext.XTemplate(
		'<div class="history-actor">',
		'<div class="referrer">{referrer}</div>',
		'<div class="{delegateClass}">{delegate}</div>',
		'</div>'
	),	
	
	getActorColumnDefinition : function() {
		
		var 
			me = this,
			
			coldef = this.applyDefaultColumnDefinition (
				{
					width : 200,
					text : this.MAIL_ACTOR_LABEL,
					dataIndex : Yamma.utils.datasources.History.EVENT_REFERRER_QNAME,
					sortable : false,
					renderer : function(value, meta, record) {
						
						var 
							referrer = value,
							delegate = record.get(Yamma.utils.datasources.History.EVENT_DELEGATE_QNAME),							
							delegateClass = delegate ? 'delegate' : Ext.baseCSSPrefix + 'hide-display',
							
							actor = me.ACTOR_TEMPLATE.applyTemplate({
								referrer : referrer,
								delegate : delegate,
								delegateClass : delegateClass
							})
						;
											
						return actor;
						
					}
					
				}
			);
		
		return coldef;
	},
	
	getActionTypeColumnDefinition : function() {
		
		return this.applyDefaultColumnDefinition (
		
			{
				xtype : 'actioncolumn',
				maxWidth : 40,
				tooltip : "Nature de l'évènement",
				plugins : Ext.create('Bluexml.utils.grid.column.HeaderImage', { iconCls : Yamma.Constants.getIconDefinition('lightning').iconCls }),
				
				items : [
					this.getActionTypeActionDefinition()
				]				
				
			}
		);
		
	},
	
	getActionTypeActionDefinition : function() {
		
		return	{
			
			getClass : function(value, meta, record) {
				
				var
					eventType = record.get(Yamma.utils.datasources.History.EVENT_TYPE_QNAME),
					eventDefinition = Yamma.Constants.getHistoryEventDefinition(eventType)
				;
				
				meta.tdAttr = 'data-qtip="' + eventDefinition.title + '"';
				return eventDefinition.iconCls + ' ' + 'column-header-img';
			}
			
		};		
		
	}
	
	
	
});