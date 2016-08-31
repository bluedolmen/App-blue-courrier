Ext.define('Yamma.view.mails.TasksView', {
	
	requires : [
//BEGIN-PROTOTYPE
	    'Yamma.view.charts.ChartsStatsView',
//END-PROTOTYPE	    
		'Yamma.utils.grid.MailsViewGrouping',
		'Yamma.view.mails.BatchActionable',
		'Yamma.view.mails.gridactions.SimpleTaskRefGridAction',
		'Yamma.view.mails.gridactions.Distribute',
		'Yamma.view.mails.SortersMenu',
		'Yamma.view.mails.GroupersMenu',
		'Yamma.view.mails.sorters.StatusSorter',
		'Yamma.view.mails.sorters.ProcessKindSorter'
	],
	
	extend : 'Yamma.view.mails.MailsView',
	alias : 'widget.tasksview',
	
	mixins : {
		batchactionable : 'Yamma.view.mails.BatchActionable'
	},
	
	storeId : 'MailTasks',
	hasPaging : false,
	
	gridactions : [
	    'Yamma.view.mails.gridactions.PreDistribute',
	    'Yamma.view.mails.gridactions.StartDistribution',
	    'Yamma.view.mails.gridactions.Remove',
 		'Yamma.view.mails.gridactions.Distribute',
 		'Yamma.view.mails.gridactions.ValidateDistribution',
 		'Yamma.view.mails.gridactions.AssignInstructor',
  		'Yamma.view.mails.gridactions.StartProcessing',
  		'Yamma.view.mails.gridactions.CloseDelivering',
		'Yamma.view.mails.gridactions.AddReply',
		'Yamma.view.mails.gridactions.RemoveReply',
  		'Yamma.view.mails.gridactions.CloseProcessing',
  		'Yamma.view.mails.gridactions.RefuseProcessing',
  		'Yamma.view.mails.gridactions.EndOutgoingProcessing',
		'Yamma.view.mails.gridactions.ValidateStep',
		'Yamma.view.mails.gridactions.CertifyDocument',
		'Yamma.view.mails.gridactions.ApproveDocument',
		'Yamma.view.mails.gridactions.PrintAsPdf',
		'Yamma.view.mails.gridactions.MarkAsSent'
	],
	
	maxAvailableActions : 4,
	
	initComponent : function() {
		
		// Load on view ready
		this.on('viewready',function(){
			this.load();
		});
		
		this.proxyConfigOptions = Ext.merge( (this.proxyConfigOptions || {}) , {
			extraParams : {
				'@includeFollowed' : false,
				'mixins' : 'Signed'
			}			
		});
		
		this.setupGrouping();
		this.setupSorting();
		
		this.callParent();
		
		this.mixins.batchactionable.init.call(this);
		
	},
	
	setupToolbar : function() {
		
		var 
			me = this
		;
		
		this.tbar = [
//BEGIN-PROTOTYPE
 		    {
		    	xtype : 'button',
		    	itemId : 'show-charts-button',
		    	iconCls : Yamma.Constants.getIconDefinition('chart_curve').iconCls,
		    	tooltip : i18n.t('view.mails.taskview.buttons.show-charts'),//'Visualiser les rapports graphiques',
		    	disabled : true,
		    	hidden : true !== Yamma.config.stats.active,
		    	handler : function() {
		    		me.showChartsView();
		    	}
		    },
		    
		    '   ',		    
//END-PROTOTYPE
		    
		    this.setupGroupers(),
		    
		    '   ',
		    
		    this.setupSorters(),
		    
		    '   ',
		    
		    this.setupFilters(),
		    
		    '->',
		    
		    '   ',
		    
		    {
		    	xtype : 'button',
		    	iconCls : Yamma.Constants.getIconDefinition('feed').iconCls,
		    	tooltip : i18n.t('view.mails.taskview.buttons.include-followed'),//'Inclure les courriers suivis',
		    	enableToggle : true,
		    	listeners : {
		    		'toggle' : function(button, pressed) {
		    			
			    		me.proxyConfigOptions.extraParams['@includeFollowed'] = pressed;
			    		
		    			var filterFollowed = me.queryById("filter-followed");
		    			if (null != filterFollowed) {
		    				filterFollowed.setDisabled(!pressed);
		    				me.updateFilters();
		    			}
		    			
			    		me.load();
			    		
		    		}
		    	}
		    },
		    
		    ' ',
		    
		    {
		    	xtype : 'button',
		    	iconCls : Ext.baseCSSPrefix + 'tbar-loading',
		    	tooltip : i18n.t('view.mails.taskview.buttons.reload'),//'Recharger',
		    	handler : function() {
		    		me.load();
		    	}
		    },
		    
			Yamma.view.mails.BatchActionable.actionsButton
		];
		
		this.on('beforeload', function(store) {
			
			var showChartsButton = me.getChartsButton();
			if (showChartsButton) {
				showChartsButton.setDisabled(true);
			}
			
		});
		
		this.on('storeloaded', function(store) {
			
			var showChartsButton = me.getChartsButton();
			if (showChartsButton) {
				showChartsButton.setDisabled(false);
			}
			
		});
		
	},
	
	getFilterDefinitions : function(defaultItemListeners) {
		
		var
			getTaskProperties = Yamma.view.mails.gridactions.SimpleTaskRefGridAction.getTaskProperties,
			distributeAction = Yamma.view.mails.gridactions.Distribute
		;

		
		function followedMailsFilter(record) {
			
			var followed = record.get(Yamma.utils.datasources.Documents.IS_FOLLOWED_QNAME);
			return true === followed;
			
		}
		
		function incomingMailsFilter(record) {
			
			var type = record.get(Yamma.utils.datasources.Documents.MAIL_KIND_QNAME);
			return (Yamma.utils.datasources.Documents.INCOMING_MAIL_KIND == type);
			
		}
		
		function withValidationIncomingMailsFilter(record) {
			
			if (!incomingMailsFilter(record)) return false;
			
			var
				taskProperties = getTaskProperties(record,['bcinwf:pendingTask', 'bcwfincoming:Delivering', 'bcwfincoming:Validating']),
				processType = distributeAction.getProcess(taskProperties)
			;
			
			return 'with-validation' == processType;
			
		}
		
		function withoutValidationIncomingMailsFilter(record) {
			
			if (!incomingMailsFilter(record)) return false;
			
			var
				taskProperties = getTaskProperties(record,['bcinwf:pendingTask', 'bcwfincoming:Delivering', 'bcwfincoming:Validating']),
				processType = distributeAction.getProcess(taskProperties)
			;
			
			return 'with-validation' != processType;
			
		}
		
		return [
			{
				xtype: 'menucheckitem',
				text : i18n.t('view.mails.taskview.filter.followed'),//'Courriers suivis',
				itemId : 'filter-followed',
				disabled : true,
				iconCls : Yamma.Constants.getIconDefinition('feed').iconCls,
				filter : followedMailsFilter
			}
//			{
//				text : 'Courriers entrants',
//				itemId : 'incoming-mails-filter',
//				iconCls : Yamma.Constants.INBOUND_MAIL_TYPE_DEFINITION.iconCls,
//				filter : incomingMailsFilter,
//				menu : {
//		    		defaults : {
//						listeners : defaultItemListeners		    			
//		    		},								
//					items : [
//						{
//							xtype: 'menucheckitem',
//							text : 'Avec validation',
//							itemId : 'incoming-with-validation',
//							iconCls : Yamma.Constants.getIconDefinition('accept').iconCls,
//							filter : withValidationIncomingMailsFilter,
//							incompatibleFilters : ['incoming-without-validation']
//						},
//						{
//							xtype: 'menucheckitem',
//							text : 'Sans validation',
//							itemId : 'incoming-without-validation',
//							iconCls : Yamma.Constants.getIconDefinition('accept_nb').iconCls,
//							filter : withoutValidationIncomingMailsFilter,
//							incompatibleFilters : ['incoming-with-validation']
//						}
//					]
//				}
//			}
		];
		
	},
	
	getChartsButton : function() {
		
		var showChartsButton = this.queryById('show-charts-button');
		if (showChartsButton && showChartsButton.isVisible()) return showChartsButton;
		
		return null;
		
	},
	
	setupGroupers : function() {
		
	    this._groupersMenu = Ext.create('Yamma.view.mails.GroupersMenu', {
	    	itemId : 'groupers-menu',
	        groupers : [
        	   Ext.create('Yamma.view.mails.sorters.ProcessKindSorter'),
        	   Ext.create('Yamma.view.mails.sorters.StatusSorter')
           	],
	    	listeners : {
	    		'groupby' : this.onGroupingChanged,
	    		scope : this
	    	}
	    });
		
	    return this._groupersMenu;
	    
	},
	
	onGroupingChanged : function(groupProperty, groupAscending, grouper) {
		
		this.storeConfigOptions.groupers = [grouper];
		
		if (!groupProperty) {
			// Grouping removal
			this._mailsViewGroupingFeature.disable();
			this.store.clearGrouping();
			return;
		}
		else {
			this._mailsViewGroupingFeature.enable();
		}
		
		var groupers = [{
	    	property : groupProperty,
	    	direction : groupAscending ? 'ASC' : 'DESC'
		}];
		
		this.store.group(groupers);
		
	},
	
	setupGrouping : function() {
		
		var 
			me = this,
			defaultGrouping
		;
		
		defaultGrouping = setupDefaultGrouping();
		
		this._mailsViewGroupingFeature = Ext.create('Yamma.utils.grid.MailsViewGrouping', {
			
				ftype : 'mailsviewgrouping',
				groupHeaderTpl : new Ext.XTemplate(
					'{[this.renderGroup(values.name)]}',
					{
						renderGroup : function() {
							
							var currentGrouper = me.storeConfigOptions && !Ext.isEmpty(me.storeConfigOptions.groupers) ? me.storeConfigOptions.groupers[0] : null; 
							
							if (currentGrouper && Ext.isFunction(currentGrouper.renderGroup)) {
								return currentGrouper.renderGroup.apply(this, arguments);
							}
							
							return arguments[0]; // supposed value
							
						}
					}
				), 
		
			enableGroupingMenu : false,
			isGrouping : null != defaultGrouping
	    });
			
		this.features = (this.features || []).concat(this._mailsViewGroupingFeature);		
			
		function setupDefaultGrouping() {
			
			var 
				defaultGrouping = Yamma.config.client['grouping.default.tasks'],
				sortingDefinition = me.getSortingDefinition(defaultGrouping)
			;
			
			me.storeConfigOptions = Ext.apply(me.storeConfigOptions || {}, {
				
				groupers : sortingDefinition ? [ sortingDefinition ] : [],
				
			remoteGroup : false,
			remoteFilter : false,
			remoteSort : false,
			sortOnLoad : true
			
		});
		
			me.on('afterrender', function() {
				this._groupersMenu.select(
						sortingDefinition ? sortingDefinition.property : '', 
						sortingDefinition ? 'ASC' == sortingDefinition.direction : null/* sortAscending */, 
						true /* silent */
					);				
			}, me);
		
		}
		
		
	},
	
	setupSorters : function() {
		
		this._sortersMenu =  Ext.create('Yamma.view.mails.SortersMenu', {
	    	itemId : 'sorters-menu',
	        sorters : [
               {"property":"bluecourrier:reference", "text": i18n.t('view.mails.taskview.sorter.reference'), "iconCls" : Yamma.view.mails.SortersMenu.KEY_TYPE_ICON.iconCls},
        	   {"property":"cm:name", "text": i18n.t('view.mails.taskview.sorter.name'), "iconCls" : Yamma.view.mails.SortersMenu.TEXT_TYPE_ICON.iconCls},
        	   {"property":"bluecourrier:object", "text":i18n.t('view.mails.taskview.sorter.object'), "iconCls" : Yamma.view.mails.SortersMenu.TEXT_TYPE_ICON.iconCls},
        	   {"property":"bluecourrier:senderOrganizationName", "text":i18n.t('view.mails.taskview.sorter.sender'), "iconCls" : Yamma.view.mails.SortersMenu.TEXT_TYPE_ICON.iconCls},
        	   {"property":"enclosingService", "text":i18n.t('view.mails.taskview.sorter.enclosingservice'), "iconCls" : Yamma.Constants.getIconDefinition('group_location').iconCls},
//        	   {"property":"cm:created", "text":"Création", "iconCls" : Yamma.view.mails.SortersMenu.DATE_TYPE_ICON.iconCls},
        	   {"property":"bluecourrier:writingDate", "text":i18n.t('view.mails.taskview.sorter.writing'), "iconCls" : Yamma.view.mails.SortersMenu.DATE_TYPE_ICON.iconCls},
        	   {"property":"bluecourrier:sentDate", "text":i18n.t('view.mails.taskview.sorter.sent'), "iconCls" : Yamma.view.mails.SortersMenu.DATE_TYPE_ICON.iconCls},
        	   {"property":"bluecourrier:deliveryDate", "text":i18n.t('view.mails.taskview.sorter.delivery'), "iconCls" : Yamma.view.mails.SortersMenu.DATE_TYPE_ICON.iconCls},
        	   {"property":"bluecourrier:digitizedDate", "text":i18n.t('view.mails.taskview.sorter.digitized'), "iconCls" : Yamma.view.mails.SortersMenu.DATE_TYPE_ICON.iconCls},
        	   {"property":"bluecourrier:dueDate", "text":i18n.t('view.mails.taskview.sorter.due'), "iconCls" : Yamma.view.mails.SortersMenu.DATE_TYPE_ICON.iconCls},
        	   {"property":"cm:modified", "text":i18n.t('view.mails.taskview.sorter.modified'), "iconCls" : Yamma.view.mails.SortersMenu.DATE_TYPE_ICON.iconCls},
        	   Ext.create('Yamma.view.mails.sorters.ProcessKindSorter'),
        	   Ext.create('Yamma.view.mails.sorters.StatusSorter')
           	],
	    	listeners : {
	    		'sortby' : this.onSortingChanged,
	    		scope : this
	    	}
	    });
	    
		return this._sortersMenu;

	},
	
	onSortingChanged : function(sortProperty, sortAscending) {
		
		this.callParent(arguments);
		this.store.sort(this.storeConfigOptions.sorters);
		
	},
	
	setupSorting : function() {

		var me = this;
		setupDefaultSorting();
		
		function setupDefaultSorting() {
			
		var 
			defaultSorting = Yamma.config.client['sorting.default.tasks'],
				sortingDefinition = me.getSortingDefinition(defaultSorting)
			;
			
			if (!sortingDefinition) return;
			me.storeConfigOptions.sorters = (me.storeConfigOptions.sorters || []).concat(sortingDefinition);
			
			me.on('afterrender', function() {
				this._sortersMenu.select(
						sortingDefinition.property, 
						'ASC' == sortingDefinition.direction /* sortAscending */, 
						true /* silent */
				);
			}, me);
				
		}
		
	},
	
	/**
	 * Builds an ExtJS definition from a compact sorting definition.
	 * Also works for groups.
	 * 
	 * @returns A valid definition if can be build, null otherwise
	 * @private
	 */ 
	getSortingDefinition : function(sortingDefinition) {
		
		var 
			sortingProperty, sortingDirection
		;
		
		if (!sortingDefinition) return null;
			
		sortingDefinition = sortingDefinition.split('|');
		sortingProperty = sortingDefinition[0];
		
		if (!sortingProperty || 'none' == sortingProperty.toLowerCase()) return null;
		
		sortingDirection = sortingDefinition[1] || 'ASC';
		
		switch(sortingProperty) {
		case "status":
		case "Status":
			return Ext.create('Yamma.view.mails.sorters.StatusSorter', {
					direction : sortingDirection
				});
		case "processKind":
		case "process-kind":
		case "ProcessKind":
			return Ext.create('Yamma.view.mails.sorters.ProcessKindSorter', {
				direction : sortingDirection
			});
			}
		
		return {
			property : sortingProperty,
			direction : sortingDirection
		}; 
		
	},
	
	getColumns : function() {
		
		return [
		
			this.getTickColumnDefinition(),
		
			this.getDocumentTypeColumnDefinition(),
			
			this.getSubjectColumnDefinition(),
		
			this.getPriorityColumnDefinition(),
			
			this.getDatesColumnDefinition(),
			
			this.getServiceColumnDefinition(),
			
			this.getActionsColumnDefinition()
		
		];
		
	},	
	
	getDerivedFields : function() {
		
		var 
			me = this,
			fields = this.mixins.batchactionable.getDerivedFields()
		;
		
		return fields.concat(this.callParent() || []);
		
	},
	
	showChartsView : function() {
		
		var 
			store = this.getStore(),
			records = store.getRange(), // retrieve the current selection
			clonedStore = Ext.create('Ext.data.ArrayStore', {
				fields : store.model.getFields(),
				data : records
			})
		;
		
		Ext.create('Ext.window.Window', {
			
			title : i18n.t('view.mails.taskview.window.title'),//'Rapports graphiques',
			iconCls : Yamma.Constants.getIconDefinition('chart_curve').iconCls,			
			height : (window.innerHeight || 600/0.9) * 0.9,
			width : (window.innerWidth || 1000/0.8) * 0.8 ,
			layout : 'fit',
			items : {
				xtype : 'chartsstatsview',
				title : '',
				border : false,
				store : clonedStore
			},
			modal : true
			
		}).show();
		
	},
	
	clearFilters : function(suppressEvent) {
		
		var store = this.getStore();
		store.clearFilter(suppressEvent);
		
	},
	
	filter : function(filters, label) {
		
		var 
			store = this.getStore(),
			filters = Ext.Array.merge(filters || [], this.storeConfigOptions.filters)
		;
		
		store.clearFilter(true /* suppressEvent */);
		store.filter(filters);
		
	    	}
	    

});