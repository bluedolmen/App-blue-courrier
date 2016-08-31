Ext.define('Yamma.view.history.DocumentHistoryList', {

	extend : 'Yamma.utils.grid.StoreGridPanel',
	alias : 'widget.documenthistorylist',
	
	requires : [
		'Bluedolmen.utils.grid.column.HeaderImage',
		'Yamma.utils.datasources.History'
	],
	
	mixins : {
		deferredloading : 'Yamma.view.edit.NodeRefDeferredLoading'
	},	
	
	title : i18n.t('view.history.documenthistorylist.title'),
	iconCls : Yamma.Constants.getIconDefinition('date').iconCls,
	cls : 'history',
	
	storeId : 'History',
	hasPaging : false,
	refreshable : true,
	
	EVENT_DATE_TITLE : i18n.t('view.history.documenthistorylist.date_title'),
	EVENT_TYPE_TITLE : i18n.t('view.history.documenthistorylist.type_title'),
	EVENT_COMMENT_TITLE : i18n.t('view.history.documenthistorylist.comment_title'),
	EVENT_ACTOR_TITLE : i18n.t('view.history.documenthistorylist.actor_title'),
	
	storeConfigOptions : {
		// Meant to be empty ! => see initComponent
	},
	
	setupToolbar : function() {
		
		var me = this;
		
		if (!this.refreshable) return;
		
		this.bbar = [
		    '->',
		    {
		    	xtype : 'button',
		    	iconCls : 'x-tbar-loading',
		    	handler : function() {
		    		var store = me.getStore();
		    		if (null == store) return;
		    		
		    		store.load();
		    	}
		    }
		];
		
	},	
	
 	getDerivedFields : function() {
 		
 		/*
		 * Here we map to names that do not contains ':' since this character
		 * has a special meaning in tpl processing
		 */
 		return [
 		
	 		{ name : 'created', mapping : Yamma.utils.datasources.History.EVENT_DATE_QNAME },
	 		{ 
	 			name : 'htmlComment', 
	 			mapping : Yamma.utils.datasources.History.EVENT_COMMENT_QNAME,
	 			convert : function(value, record) {
	 				
	 				return value.replace(/\n/g,'<br>');
	 				
	 			}
	 		},
	 		{ 
	 			name : 'author', 
	 			mapping : Yamma.utils.datasources.History.EVENT_REFERRER_QNAME,
	 			convert : function(value, record) {
	 				
	 				var
	 					referrer = value,
	 					delegate = record.get(Yamma.utils.datasources.History.EVENT_DELEGATE_QNAME)
	 				;
	 				
	 				return (
	 					(referrer ? referrer : '(inconnu)') +
	 					(delegate ? ' p.o. ' + delegate : '')
	 				);
	 				
	 			}
	 		},
	 		{
	 			name : 'hasDelegate',
	 			mapping : Yamma.utils.datasources.History.EVENT_DELEGATE_QNAME,
	 			convert : function(value, record) {
	 				return !!value;
	 			}
	 		}
 		
 		];
 		
 	},	
	
	
	initComponent : function() {
		
		this.setupToolbar();		
		
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
			
			this.getEventColumnDefinition()
			
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
				tooltip : i18n.t('view.history.documenthistorylist.columns.actiontypecolumn.tooltip'),
				plugins : Ext.create('Bluedolmen.utils.grid.column.HeaderImage', { iconCls : Yamma.Constants.getIconDefinition('lightning').iconCls }),
				
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
				return eventDefinition.iconCls;
			}
			
		};		
		
	},
	
	EVENT_TEMPLATE : new Ext.XTemplate(
		'<div class="header">',
			'<span class="created">Le {created:date("d/m/Y")} à {created:date("G:i")}</span>',
		'</div>',
		'<div class="comment">{htmlComment}</div>',
		'<div class="author">{author}</div>'
	), 
	
	getEventColumnDefinition : function() {
		
		return {	
			xtype : 'templatecolumn',
			flex : 1,
			text : i18n.t('view.history.documenthistorylist.columns.eventcolumn'),
			tpl : this.EVENT_TEMPLATE, 
			dataIndex :  Yamma.utils.datasources.History.EVENT_DATE_QNAME,
			sortable : true
		};
		
	}
	
	
	
	
});