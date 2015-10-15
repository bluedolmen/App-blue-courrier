Ext.require([
             
	'Yamma.utils.datasources.Documents',
	'Yamma.utils.grid.MailsViewGrouping',
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
	
//	gridactions : [
//  		'Yamma.view.mails.gridactions.Distribute',
//  		'Yamma.view.mails.gridactions.AssignInstructor',
//  		'Yamma.view.mails.gridactions.StartProcessing',
//  		'Yamma.view.mails.gridactions.RefuseProcessing',
//  		'Yamma.view.mails.gridactions.CloseDelivering',
//  		'Yamma.view.mails.gridactions.PrintAsPdf'
//  	],
  	
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
		
		this.tbar = [
		    '->',
		    
		    this.setupSorters(),
		    
		    this.setupFilters(),
		    
		    ' ',
		    
		    this.setupExport()
			
		];
		
	},
	
	setupSorters : function() {
		
	    return Ext.create('Yamma.view.mails.SortersMenu', {
	    	itemId : 'sorters-menu',
	        sorters : [
        	   {"property":"", "text": "Aucun", "iconCls" : Yamma.Constants.getIconDefinition('cancel').iconCls},
        	   {"property":"@cm:name", "text":"Nom", "iconCls" : Yamma.view.mails.SortersMenu.TEXT_TYPE_ICON.iconCls},
        	   {"property":"@cm:title", "text":"Titre", "iconCls" : Yamma.view.mails.SortersMenu.TEXT_TYPE_ICON.iconCls},
        	   {"property":"@cm:created", "text":"Création", "iconCls" : Yamma.view.mails.SortersMenu.DATE_TYPE_ICON.iconCls},
        	   {"property":"@cm:modified", "text":"Modification", "iconCls" : Yamma.view.mails.SortersMenu.DATE_TYPE_ICON.iconCls},
        	   {"property":"@bluecourrier:deliveryDate", "text":"Arrivée", "iconCls" : Yamma.view.mails.SortersMenu.DATE_TYPE_ICON.iconCls},
        	   {"property":"@bluecourrier:sentDate", "text":"Envoi", "iconCls" : Yamma.view.mails.SortersMenu.DATE_TYPE_ICON.iconCls},
        	   {"property":"@bluecourrier:dueDate", "text":"Echéance", "iconCls" : Yamma.view.mails.SortersMenu.DATE_TYPE_ICON.iconCls},
        	   {"property":"@cm:content.size", "text":"Taille", "iconCls" : Yamma.Constants.getIconDefinition('database').iconCls},
        	   {"property":"@cm:content.mimetype", "text":"Type MIME", "iconCls" : Yamma.Constants.getIconDefinition('package').iconCls},
        	   {"property":"@bluecourrier:processKind", "text":"Processus", "iconCls" : Yamma.Constants.getIconDefinition('cog_email').iconCls},
        	   {"property":"@bluecourrier:status", "text":"Statut", "iconCls" : Yamma.Constants.getIconDefinition('cog_email').iconCls}
           	],
	    	listeners : {
	    		
	    		'sortby' : this.onSortingChanged,
	    		scope : this
	    		
	    	}
	    });
	    
	},
	
	onSortingChanged : function(sortProperty, sortAscending) {
		
		var sorters = [{
	    	property : sortProperty,
	    	direction : sortAscending ? 'ASC' : 'DESC'		
		}];
		
		this.storeConfigOptions = Ext.apply(this.storeConfigOptions || {}, {
			sorters : sortProperty ? sorters : []
		});
		
		this.displayFilterBasedContent(this.currentContext); //, { sorters : sorters } /* storeExtraConfig */);
		
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
		    	tooltip : 'Filtrer',
		    	itemId : 'filter-button',
		    	menu : {
		    		defaults : {
						listeners : defaultItemListeners		    			
		    		},
		    		items : [
						{
							text : 'Supprimer les filtres',
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
				text : 'Modifiés récemment (7j)',
				itemId : 'modified-recently-filter',
				iconCls : Yamma.Constants.getIconDefinition('pencil').iconCls,
				filter : {
					property : 'modifiedXDaysAgo',
					value : 7
				}
			},
			{
				text : 'Echéance',
				itemId : 'duedate-filter',
				iconCls : Yamma.Constants.getIconDefinition('clock').iconCls,
				menu : {
		    		defaults : {
						listeners : defaultItemListeners		    			
		    		},								
					items : [
						{
							xtype: 'menucheckitem',
							text : 'Moins de 7 jours',
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
							text : 'Moins de 3 jours',
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
			this.clearFilters();
			iconCls = Yamma.Constants.getIconDefinition('funnel').iconCls;
			tooltip = 'Filtrer';
		}
		else {
			this.filter();
			iconCls = Yamma.Constants.getIconDefinition('funnel_active').iconCls;
			tooltip = '<i>Filtres sélectionnés :</i><br/>' + 
				checkedItems.reduce(function(previousValue, item, index, array) {
					return previousValue + '- ' + '<b>' + item.text + '</b><br/>';
				}, '' /* initialValue */)
			;
		}
		
		me.filterButton.setIconCls(iconCls);
		me.filterButton.setTooltip(tooltip);
		
	},
	
	clearFilters : function(suppressEvent) {
		
		this.storeConfigOptions = Ext.apply( (this.storeConfigOptions || {}), {
			filters : []
		});
		
		this.filter();
		
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
		
		this.storeConfigOptions.filters = Ext.Array.map(checkedItems || [], function(menuCheckItem) {
			return menuCheckItem.filter;
		});
		
		return this.storeConfigOptions.filters;
		
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
			
			this.getActionsColumnDefinition()
		
		];
		
	},	
		
    applyDefaultColumnDefinition : function(columnDefinition) {
    	
    	var defaultConfig = this.callParent([columnDefinition]);
    	defaultConfig.tdCls = 'cell-align-middle';
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
	
	displayFilterBasedContent : function(context, storeExtraConfig) {
		
		if (!context) return;
		
		var 
			filters = context.getDocumentDatasourceFilters(),
			label = context.getLabel()
		;
		
		this.currentContext = context; // save the current context for future use
		
		this.filter(filters, label);
		
	},
	
	filter : function(filters, label) {
		
		var storeConfig = Ext.clone(this.storeConfigOptions);
		storeConfig.filters = (storeConfig.filters || []).concat(filters || []);
		
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
		
		
	},
	
	resetMailsView : function() {

		this.currentContext = null;
		
		this.resetTitleToDefault();
		this.clearStore();
		
	},
	
	displaySearchResult : function(context) {
		
		var 
			query = context.getQuery(),
			term = context.getTerm(),
			label,
			encodedQuery
		;
		if (!query && !term) return;
		
		label = context.getLabel();
		encodedQuery = Ext.JSON.encode(query);
		
		this.load(
			null, /* storeConfig */
			
			{
				extraParams : {
					query : encodedQuery,
					term : term
				}
			}, /* proxyConfig */
			
			{
				ref : '^' + label
			} /* extraConfig */
		);		
		
	},
	
	onGroupingChanged : function(groupProperty, groupAscending) {
		
		var groupers = [{
	    	property : groupProperty,
	    	direction : groupAscending ? 'ASC' : 'DESC'		
		}];
		
		this.displayFilterBasedContent(this.currentContext, { groupers : groupers } /* storeExtraConfig */);
		
	}

	
});

});


