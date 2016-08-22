Ext.require([
             
	'Yamma.utils.datasources.Documents',
//	'Yamma.utils.grid.MailsViewGrouping',
	'Yamma.utils.ServicesManager'
	
], function() {

Ext.define('Yamma.view.mails.MailsView', {

	extend : 'Yamma.utils.grid.StoreGridPanel',
	alias : 'widget.mailsview',
	
	requires : [
//		'Yamma.view.windows.DocumentStatisticsWindow',
		'Ext.ux.grid.column.CheckColumn',
		'Yamma.utils.button.UploadButton',
		'Yamma.view.mails.ServiceCombo',
		'Yamma.view.mails.ServiceFiltersCombo',
		'Yamma.view.mails.SortersMenu',
		'Yamma.view.mails.ExportButton'
	],
	
	mixins : {
		mailcolumndefinitions : 'Yamma.view.mails.MailColumnDefinitions'
	},
	
//	features : [
//		Ext.create('Yamma.utils.grid.MailsViewGrouping')
//	],
	
	storeId : 'Mails',
	
//	proxyConfigOptions : {
//		extraParams : {
//			'@discardReplies' : true // Just another permanent filter
//		}
//	},
	
//	hasPaging : false,
	
	title : '',
	
	gridactions : [
		'Yamma.view.mails.gridactions.OpenInTasksView'
	],
	
	maxAvailableActions : 1,	
	
  	itemactions : [
		'Yamma.view.mails.itemactions.ShowDetailsWindowAction',
		'Yamma.view.mails.itemactions.DownloadFileAction',
		'Yamma.view.mails.itemactions.GoToShareAction',
		'Yamma.view.mails.itemactions.LinkToExistingMailAction',
		'Yamma.view.mails.itemactions.ManageTasksAction',
		'Yamma.view.mails.itemactions.StartFollowingAction',
		'Yamma.view.mails.itemactions.StopFollowingAction',
		'Yamma.view.mails.itemactions.CirculateAction',
		'Yamma.view.mails.itemactions.RestartProcessingAction'
	],
       	
  	maxAvailableActions : 3,	
		
	initComponent : function() {

		this.setupBackgroundColors();
		this.setupToolbar();
		
		this.storeConfigOptions = Ext.merge( (this.storeConfigOptions || {}), {
			filters : []
		});
		
		this.callParent(arguments);
		
		this.filterButton = this.queryById('filter-button'); // cached component
		
		this.hidePagingToolbarRefreshButton();
		
	},
	
	hidePagingToolbarRefreshButton : function() {
		
		var refreshButton = this.queryById('refresh');
		if (null != refreshButton) {
			refreshButton.setVisible(false);
		}
		
	},
	
	setupBackgroundColors : function() {
		
		var me = this;
		
		this.viewConfig = Ext.Object.merge(this.viewConfig || {}, {
			
			getRowClass : function(record, rowIndex, rowParams, store) {

				return me.getRowClass(record);
				
			}

		});
		
	},	
	
	getRowClass : function(record) {
		
		var 
			priority = record.get(Yamma.utils.datasources.Documents.PRIORITY_QNAME),
			priorityLevel = Number(priority.split('|')[1] || -1),
			processType = record.get('processType')
		;
		
		if (priorityLevel >= 90) return 'row-mail-vip';
		else if (priorityLevel >= 50) return 'row-mail-important';
		else if ('with-validation' == processType) return 'row-mail-with-validation';
		
		return null;
		
	},
	
	setupToolbar : function() {
		
		var me = this;
		
		this.tbar = [
		    '->',
		    
		    this.setupSorters(),
		    
		    ' ',
		    
		    this.setupFilters(),
		    
		    ' ',
		    
		    /**
		     * Replaces the normal behaviour of the paging-toolbar.
		     * Users are disturbed by the alternate location compared to
		     * the tasks view, the latter is indded not yet paged and the
		     * refresh button has been placed in the toolbar.
		     */
		    {
		    	xtype : 'button',
		    	iconCls : Ext.baseCSSPrefix + 'tbar-loading',
		    	tooltip : i18n.t('widget.mailsview.toolbar.button.reload.tooltip'),
		    	handler : function() {
		    		
		    		var pagingToolbar = me.getPagingToolbar();
		    		pagingToolbar.doRefresh();
		    		
		    	}
		    },
		    
		    ' ',
		    
		    this.setupExport()
			
		];
		
	},
	
	setupSorters : function() {
		
	    var sortersMenu = Ext.create('Yamma.view.mails.SortersMenu', {
	    	itemId : 'sorters-menu',
	        sorters : [
        	   {"property":"", "text":  i18n.t('widget.mailsview.sorter.cancel'), "iconCls" : Yamma.Constants.getIconDefinition('cancel').iconCls},
        	   {"property":"@bluecourrier:reference", "text": i18n.t('widget.mailsview.sorter.reference'), "iconCls" : Yamma.view.mails.SortersMenu.KEY_TYPE_ICON.iconCls},
        	   {"property":"@cm:name", "text":i18n.t('widget.mailsview.sorter.name'), "iconCls" : Yamma.view.mails.SortersMenu.TEXT_TYPE_ICON.iconCls},
        	   {"property":"@bluecourrier:senderOrganizationName", "text":i18n.t('widget.mailsview.sorter.sender'), "iconCls" : Yamma.view.mails.SortersMenu.TEXT_TYPE_ICON.iconCls},
/*
 * Deactivate the sorting on the "object"; SolR DOES NOT support sorting on this field
 * 
 * It fails with a:
 *  java.lang.UnsupportedOperationException: Ordering not supported for @bluecourrier:object
 */
//        	   {"property":"@bluecourrier:object", "text":"Objet", "iconCls" : Yamma.view.mails.SortersMenu.TEXT_TYPE_ICON.iconCls},
//        	   {"property":"@cm:created", "text":"Création", "iconCls" : Yamma.view.mails.SortersMenu.DATE_TYPE_ICON.iconCls},
        	   {"property":"@bluecourrier:writingDate", "text":i18n.t('widget.mailsview.sorter.writing'),, "iconCls" : Yamma.view.mails.SortersMenu.DATE_TYPE_ICON.iconCls},
        	   {"property":"@bluecourrier:sentDate", "text":i18n.t('widget.mailsview.sorter.sent'), "iconCls" : Yamma.view.mails.SortersMenu.DATE_TYPE_ICON.iconCls},
        	   {"property":"@bluecourrier:deliveryDate", "text":i18n.t('widget.mailsview.sorter.delivery'), "iconCls" : Yamma.view.mails.SortersMenu.DATE_TYPE_ICON.iconCls},
        	   {"property":"@bluecourrier:digitizedDate", "text":i18n.t('widget.mailsview.sorter.digitized'), "iconCls" : Yamma.view.mails.SortersMenu.DATE_TYPE_ICON.iconCls},
        	   {"property":"@bluecourrier:dueDate", "text":i18n.t('widget.mailsview.sorter.due'), "iconCls" : Yamma.view.mails.SortersMenu.DATE_TYPE_ICON.iconCls},
        	   {"property":"@cm:modified", "text":i18n.t('widget.mailsview.sorter.modified'), "iconCls" : Yamma.view.mails.SortersMenu.DATE_TYPE_ICON.iconCls},
        	   {"property":"@cm:content.size", "text":i18n.t('widget.mailsview.sorter.size'), "iconCls" : Yamma.Constants.getIconDefinition('database').iconCls},
        	   {"property":"@cm:content.mimetype", "text":i18n.t('widget.mailsview.sorter.mimetype'), "iconCls" : Yamma.Constants.getIconDefinition('package').iconCls},
        	   {"property":"@bluecourrier:processKind", "text":i18n.t('widget.mailsview.sorter.processkind'), "iconCls" : Yamma.Constants.getIconDefinition('cog_email').iconCls},
        	   {"property":"@bluecourrier:status", "text":i18n.t('widget.mailsview.sorter.status'), "iconCls" : Yamma.Constants.getIconDefinition('cog_email').iconCls}
           	],
	    	listeners : {
	    		
	    		'sortby' : this.onSortingChanged,
	    		scope : this
	    		
	    	}
	    });
	    
	    sortersMenu.enableBubble('sortby');
	    
	    return sortersMenu;
	    
	},
	
	onSortingChanged : function(sortProperty, sortAscending) {
		
		var sorters = [{
	    	property : sortProperty,
	    	direction : sortAscending ? 'ASC' : 'DESC'		
		}];
		
		this.updateSorters(sorters);
		
	},	
	
	updateSorters : function(sorters) {
		
		this.storeConfigOptions = Ext.apply(this.storeConfigOptions || {}, {
			sorters : sorters || []
		});
		
	},
	
	/**
	 * Returns a filter button definition
	 * 
	 */
	setupFilters : function() {
		
		function removeFilters() {
			
			var
				menuCheckItems = me.filterButton.query("menucheckitem") || []
			;
			
			Ext.Array.forEach(menuCheckItems, function(menuCheckItem) {
				if (menuCheckItem.isDisabled()) return null;
				menuCheckItem.setChecked(false /* checked */, true /* suppressEvents */);
				me.setDisabledIncompatibleFilters(menuCheckItem);
			});
			
			me.onFilterChange(); // simulate an event
			
		}
		
		var
			me = this,
		
			defaultItemListeners = {
				checkchange : me.onFilterChange,
				scope : me
			},
			
			filterDefinitions = this.getFilterDefinitions(defaultItemListeners),

			buttonDefinition = {
		    	xtype : 'button',
		    	iconCls : Yamma.Constants.getIconDefinition('funnel').iconCls,
		    	tooltip : i18n.t('widget.mailsview.button.filter-button'),
		    	itemId : 'filter-button',
		    	menu : {
		    		defaults : {
						listeners : defaultItemListeners		    			
		    		},
		    		items : [
						{
							text : i18n.t('view.mails.filters.clear.label'), 
							itemId : 'filter-remove',
							iconCls : Yamma.Constants.getIconDefinition('funnel_delete').iconCls,
							handler : removeFilters
						},
						{
							xtype : 'menuseparator'
						}
					].concat(filterDefinitions || [])
		    	}
		    }
		;

		return buttonDefinition;
		
	},
	
	getFilterDefinitions : function(defaultItemListeners) {
		
		return [
			{
				xtype: 'menucheckitem',
				text : i18n.t('widget.mailsview.filters.modified-recently-filter'),
				itemId : 'modified-recently-filter',
				iconCls : Yamma.Constants.getIconDefinition('pencil').iconCls,
				filter : {
					property : 'modifiedXDaysAgo',
					value : 7
				}
			},
			{
				text : i18n.t('widget.mailsview.filters.duedate-filter'),
				itemId : 'duedate-filter',
				iconCls : Yamma.Constants.getIconDefinition('clock').iconCls,
				menu : {
		    		defaults : {
						listeners : defaultItemListeners		    			
		    		},								
					items : [
						{
							xtype: 'menucheckitem',
							text : i18n.t('widget.mailsview.filters.duedate-lessthan7days'),
							itemId : 'duedate-lessthan7days',
							iconCls : Yamma.Constants.getIconDefinition('clock').iconCls,
							filter : {
								property : 'lateInXDays',
								value : 7
							},
							incompatibleFilters : ['duedate-lessthan3days']
						},
						{
							xtype: 'menucheckitem',
							text : i18n.t('widget.mailsview.filters.duedate-lessthan3days'),
							itemId : 'duedate-lessthan3days',
							iconCls : Yamma.Constants.getIconDefinition('clock').iconCls,
							filter : {
								property : 'lateInXDays',
								value : 3
							},
							incompatibleFilters : ['duedate-lessthan7days']
						}
					]
				}
			}
			
        ];
		
	},
	
	onFilterChange : function(item) {
		
		this.setDisabledIncompatibleFilters(item);
		
		var 
			me = this,
			iconCls = null,
			tooltip = null,
			checkedItems = this.getCheckedFilterItems()
		;

		this.updateFilters(checkedItems);
		
		if (Ext.isEmpty(checkedItems)) {
			this._extraFilters = [];
			iconCls = Yamma.Constants.getIconDefinition('funnel').iconCls;
			tooltip = i18n.t('widget.mailsview.button.filter-button');
			this.filter();
		}
		else {
			this.filter();
			iconCls = Yamma.Constants.getIconDefinition('funnel_active').iconCls;
			tooltip = '<i>'+i18n.t('widget.mailsview.filters.selected')+' :</i><br/>' +
				checkedItems.reduce(function(previousValue, item, index, array) {
					return previousValue + '- ' + '<b>' + item.text + '</b><br/>';
				}, '' /* initialValue */)
			;
		}
		
		me.filterButton.setIconCls(iconCls);
		me.filterButton.setTooltip(tooltip);
		
	},
	
	clearStoredFilters : function(suppressEvent) {
		
		this.storeConfigOptions.filters = [];
		
	},
	
	setupExport : function() {
		
		var me = this;
		return Ext.create('Yamma.view.mails.ExportButton', {
			itemId : 'export-csv-button',
			store : function() {
				return me.store;
			}
		});
		
	},

	
	/**
	 * @private
	 */
	setDisabledIncompatibleFilters : function(item, disabled) {
		
		var me = this;
		
		if (!item || !item.incompatibleFilters) return;
		if (undefined === disabled) {
			disabled = item.checked;
		}

		Ext.Array.forEach(item.incompatibleFilters, function(itemId) {
			var filter = me.filterButton.queryById(itemId);
			filter.setDisabled(disabled);
		});
		
	},
	
	/**
	 * @private
	 */
	getCheckedFilterItems : function() {
		
		var
			menuCheckItems = this.filterButton.query("menucheckitem") || [],
			checkedItems = Ext.Array.filter(menuCheckItems, function(menuCheckItem) {
				return (!menuCheckItem.isDisabled() && menuCheckItem.checked);
			})
		;
		
		return checkedItems;
		
	},
	
	/**
	 * @returns The checked filters items
	 */
	updateFilters : function(checkedItems) {
		
		this._extraFilters = Ext.Array.map(checkedItems || [], function(menuCheckItem) {
			return menuCheckItem.filter;
		});
		
		return this._extraFilters;
		
	},
	
	setFilterButtonDisabled : function(disabled) {
		
		this.filterButton.setDisabled(disabled);
		
	},
	
//	initComponent : function() {
//		
//		this.storeConfigOptions = {
//			groupField : Yamma.utils.datasources.Documents.ASSIGNED_SERVICE_QNAME
//		};
//		
//		this.callParent(arguments);
//	},

//	tbar : [
//		{
//			xtype : 'label',
//			text : 'Courrier',
//			itemId : 'toolbarTitle',
//			margins : '0 0 0 5',
//			style : {
//				'font-size' : '1.2em',
//				'font-weight' : 'bold',
//				'color' : '#15498B'
//			},
//			flex : 1
//		}
//	],
	
	// NOT USED YET
//	nextDocument : function() {
//		
//		var selectionModel = this.getSelectionModel();
//		if (!selectionModel) return;
//		
//		var lastSelected = selectionModel.getLastSelected();
//		if (!lastSelected) return;
//
//		var lastIndex = lastSelected.index == null ? -1 : lastSelected.index;
//		selectionModel.select(lastIndex + 1, false /* keepExisting */, false /* suppressEvent */);
//	},
//	
//	refreshSelected : function() {
//		
//		var selectionModel = this.getSelectionModel();
//		if (!selectionModel) return;
//		
//		var lastSelected = selectionModel.getLastSelected();
//		if (!lastSelected) return;
//
//		var lastIndex = lastSelected.index;
//		if (null == lastIndex) return;
//		
//		this.refreshNode(lastIndex);
//		
//	},

	
	getColumns : function() {
		
		return [
		
			this.getStateColumnDefinition(),
		
			this.getDocumentTypeColumnDefinition(),
			
			this.getSubjectColumnDefinition(),
		
			this.getDatesColumnDefinition(),
			
			this.getServiceColumnDefinition(),
			
			this.getActionsColumnDefinition()
		
		];
		
	},	
		
    applyDefaultColumnDefinition : function(columnDefinition) {
    	
    	var defaultConfig = this.callParent([columnDefinition]);
    	defaultConfig.tdCls = (defaultConfig.tdCls ? defaultConfig.tdCls + ' ' : '') + 'cell-align-middle';
    	defaultConfig.sortable = false;
    	
    	return defaultConfig;
    	
    },	
	
	getDocumentNodeRefRecordValue : function(record) {
		
		return record.get(Yamma.utils.datasources.Documents.DOCUMENT_NODEREF_QNAME);
		
	},
	
//	/**
//	 * This method is overloaded in order to set the the label of the toolbar
//	 * and not the title of the panel (which is hidden).
//	 * 
//	 * @param {String}
//	 *            title
//	 */
//	setTitle : function(title) {
//		var label = this.getTitleLabel();
//		if (!label) return;
//		
//		label.setText(title);
//	},
//
//	getTitleLabel : function() {
//		return this.down('#toolbarTitle');
//	},
	
	/**
	 * @private
	 * @returns
	 */
	getStatisticsView : function() {
		
		if (null == this.statisticsView) {
			this.statisticsView = Ext.create('Yamma.view.windows.DocumentStatisticsWindow', {
				closeAction : 'hide'
			}); 
		}
		
		return this.statisticsView;
		
	},
	
	getActionsColumnDefinition : function() {
		
		var definition = this.callParent(arguments);
		
		definition.items = definition.items || [];
		definition.items.push(this.getFollowedByActionDefinition());
		
		return definition;
		
	},
	
	getDerivedFields : function() {
		
//		var 
//			me = this
//			getProperties = Yamma.view.mails.gridactions.SimpleTaskRefGridAction.getTaskProperties
//			distributeAction = Yamma.view.mails.gridactions.Distribute
//		;
		
		return [
		    {
		    	name : 'mytasks_',
		    	convert : function(value, record) {
					return Yamma.utils.DeliveryUtils.sortRecordTasks(record); // sort original record as a side effect
		    	}
		    }
//		    {
//		    	name : 'incomingWorkflowProperties',
//		    	convert : function(value, record) {
//		    		return getProperties(record, ['bcinwf:pendingTask', 'bcwfincoming:Delivering', 'bcwfincoming:Validating'])
//		    	}
//		    
//		    }
//		    
//			{
//				name : 'processType',
//				convert : function(value, record) {
//		
//					var
//						properties = record.get('incomingWorkflowProperties') || getProperties(record, ['bcinwf:pendingTask', 'bcwfincoming:Delivering', 'bcwfincoming:Validating']),
//						processType = Yamma.utils.DeliveryUtils.getProcess(properties)
//					;
//						
//					return processType;
//			
//				}
//			}
		];
	
	},
	
	setError : function(message) {
		
		var
			target = this.getView()
		;
		
		if (null != message) {
			target.addCls('icon-mail-error-large');
		}
		else {
			target.removeCls('icon-mail-error-large');
		}
		
		this.callParent([message, target]);
		
	},
	
	filter : function(filters, keepFiltersOnReload /* = true */, label) {
		
		var storeConfig = Ext.clone(this.storeConfigOptions);
		
		if (false !== keepFiltersOnReload) {
			this.storeConfigOptions.filters = (this.storeConfigOptions.filters || []).concat(filters || []);
		}
		
		storeConfig.filters = (storeConfig.filters || [])
			.concat(this._extraFilters || [])
			.concat(filters || [])
		;
		
		this.load(
				
			/* storeConfig */
			storeConfig,
			
			/* proxyConfig */
			null,
			
			/* extraConfig */
			{
				ref : label ? '^' + label : null
			}
			
		);
		
		
	}
		
	
});

});


