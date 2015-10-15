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
		'Yamma.view.mails.gridactions.ForwardForValidation',
		'Yamma.view.mails.gridactions.SendOutbound',
		'Yamma.view.mails.gridactions.ValidateStep',
		'Yamma.view.mails.gridactions.CertifyDocument',
		'Yamma.view.mails.gridactions.PrintAsPdf',
		'Yamma.view.mails.gridactions.MarkAsSent'
	],
	
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
		    	tooltip : 'Visualiser les rapports graphiques',
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
		    	tooltip : 'Inclure les courriers suivis',
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
		    	iconCls : 'x-tbar-loading',
		    	tooltip : 'Recharger',
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
				text : 'Courriers suivis',
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
	
	setupGrouping : function() {
		
		var me = this;
		
		this.features = (this.features || []).concat(
		    {
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
				collapsible : true,
				enableGroupingMenu : false
		    }
		);
		
		this.storeConfigOptions = Ext.apply(this.storeConfigOptions || {}, {
			
			groupers : [Ext.create('Yamma.view.mails.sorters.StatusSorter')],
			
			remoteGroup : false,
			remoteFilter : false,
			remoteSort : false,
			sortOnLoad : true
			
		});
		
		
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
			
			title : 'Rapports graphiques',
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
		
	},
	
	setupSorters : function() {
		
	    return Ext.create('Yamma.view.mails.SortersMenu', {
	    	itemId : 'sorters-menu',
	        sorters : [
        	   {"property":"cm:name", "text":"Nom", "iconCls" : Yamma.view.mails.SortersMenu.TEXT_TYPE_ICON.iconCls},
        	   {"property":"cm:title", "text":"Titre", "iconCls" : Yamma.view.mails.SortersMenu.TEXT_TYPE_ICON.iconCls},
        	   {"property":"cm:created", "text":"Création", "iconCls" : Yamma.view.mails.SortersMenu.DATE_TYPE_ICON.iconCls},
        	   {"property":"cm:modified", "text":"Modification", "iconCls" : Yamma.view.mails.SortersMenu.DATE_TYPE_ICON.iconCls},
        	   {"property":"bluecourrier:deliveryDate", "text":"Arrivée", "iconCls" : Yamma.view.mails.SortersMenu.DATE_TYPE_ICON.iconCls},
        	   {"property":"bluecourrier:sentDate", "text":"Envoi", "iconCls" : Yamma.view.mails.SortersMenu.DATE_TYPE_ICON.iconCls},
        	   {"property":"bluecourrier:dueDate", "text":"Echéance", "iconCls" : Yamma.view.mails.SortersMenu.DATE_TYPE_ICON.iconCls},
        	   Ext.create('Yamma.view.mails.sorters.ProcessKindSorter'),
        	   Ext.create('Yamma.view.mails.sorters.StatusSorter')
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
		
		this.store.sort(sorters);
		
	},
	
	setupGroupers : function() {
		
	    return Ext.create('Yamma.view.mails.GroupersMenu', {
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
		
	},
	
	onGroupingChanged : function(grouper, groupProperty, groupAscending) {
		
		this.storeConfigOptions.groupers = [grouper];
		
		if (!groupProperty) {
			// Grouping removal
			this.store.clearGrouping();
			return;
		}
		
		var groupers = [{
	    	property : groupProperty,
	    	direction : groupAscending ? 'ASC' : 'DESC'
		}];
		
		this.store.group(groupers);
		
	}

});