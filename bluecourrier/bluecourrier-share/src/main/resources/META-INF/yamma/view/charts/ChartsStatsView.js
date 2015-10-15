Ext.define('Yamma.view.charts.ChartsStatsView', {

	extend : 'Ext.panel.Panel',
	alias : 'widget.chartsstatsview',
	
	requires : [
        'Yamma.view.charts.byservice.*',
        'Yamma.view.charts.byuser.*',
        'Yamma.view.charts.ByTask'
	],
	
	store : null,
	
	title : 'Rapports statistiques des tâches en cours',
	
	layout : {
		type : 'hbox',
		align : 'stretch'
	},
	
	store : null, // main store used to collect and display data
	chartsMenuStore : null,
	
	availableCharts : [
		'Yamma.view.charts.ByTask',
		'Yamma.view.charts.byservice.ByLateState',
		'Yamma.view.charts.byservice.ByState',
		'Yamma.view.charts.byservice.ByPriority',
		'Yamma.view.charts.byservice.ByPrivacy',
		'Yamma.view.charts.byservice.ByTask',
		'Yamma.view.charts.byuser.ByDocumentNumber',
		'Yamma.view.charts.byuser.ByTask'
	],
		
	initComponent : function() {
		
		var me = this;
		
		this._installToolBar();
		
		if (null == this.store) {
			Ext.Error.raise("IllegalStateException! The store has to be provided");
		}
		
		this._buildChartsMenuStore();
		
		this.items = [
			{
				xtype : 'fieldset',
				title : 'Rapports',
				layout : {
					type : 'vbox',
					align : 'stretch'
				},
				width : 200,
				margin : 5,
				padding : 5,
				items : [
					{
						xtype : 'gridpanel',
						itemId : 'reportsGrid',
						store : this.chartsMenuStore,
						hideHeaders : true,
						columns : [
							{ text : 'Rapports', dataIndex : 'label', flex : 1 }
						],
						border : false,
						flex : 1,
						listeners : {
							selectionchange : me.onSelectChart,
							scope : this
						}
					}
				]
			},
			{
				xtype : 'container',
				itemId : 'displayView',
				flex : 1,
				layout : 'fit'
			
			},
			{
				xtype : 'fieldset',
				title : 'Filtres',
				width : 150,
				margin : 5,
				padding : 5,
				border : 1,
		        layout: {
		        	type : 'vbox',
		        	align : 'center'
		        },
		        defaults: {
		            layout: '100%',
		        	padding : 5,
		        	margin : 5
		        
		        },
		        items : [
					this._getDocumentTypeFilterButtonDefinition(),
					this._getDocumentLateStateFilterButtonDefinition()
				]
			}
		];
		
		this.callParent();
		
		this._filterAvailableCharts();
		
	},
	
	/**
	 * @private
	 */
	_installToolBar : function() {
		
		var
			me = this,
			managedServices = this._getManagedServices()
		;
		
		this.tbar = [
			'->',
			{
				xtype : 'button',
				text : 'Manager',
				iconCls : Yamma.Constants.getIconDefinition('user_suit').iconCls,
				tooltip : 'Basculer en mode Manager',
				iconAlign : 'bottom',
				enableToggle : true,
				listeners : {
					'toggle' : this.onToggleManagerMode,
					scope : this
				},
				disabled : Ext.isEmpty(managedServices)
			},
			{
				xtype : 'button',
				text : 'Exporter',
				iconCls : Yamma.Constants.getIconDefinition('chart_curve').iconCls,
				tooltip : 'Exporter le diagramme',
				iconAlign : 'bottom',
	            handler: function() {
	            	
	            	var chart = me._getCurrentChart();
	            	if (!chart) return;
	            	
	                Ext.MessageBox.confirm('Confirmer l\'export', 'Voulez-vous télécharger le diagramme comme une image ?', function(choice) {
	                    if(choice == 'yes'){
	                        chart.save({
	                            type: 'image/png'
	                        });
	                    }
	                });
	                
	            }				
			},
			'->'
		];
		
	},
	
	/**
	 * @private
	 */
	_buildChartsMenuStore : function() {
		
		if (null != this.chartsMenuStore) return;
			
		var data = Ext.Array.map(this.availableCharts, function(chartDef) {
			
			if (Ext.isString(chartDef)) {
				Ext.syncRequire(chartDef);
				chartDef = Ext.create(chartDef);
			}
			
			return ({
				id : Ext.getClassName(chartDef),
				label : chartDef.title,
				chartDefinition : chartDef 
			});
		});
		
		this.chartsMenuStore = Ext.create("Ext.data.JsonStore", {
			storeId : 'chartsmenustore',
			fields : ['id', 'label', 'chartDefinition'],
			data : data
		});
		
	},
	
	_getDocumentTypeFilterButtonDefinition : function() {
		
 		return ({ 
			xtype : 'button',
			text : 'Entrant/Sortant',
			iconCls : Yamma.Constants.MAIL_TYPE_DEFINITION.iconCls,
			itemId : 'mailtype-filter',
			menu : {
				listeners : {
					'click' : this.onMailTypeFilterChange,
					scope : this
				},
				items : [
					{
						text : 'Entrant/Sortant',
						iconCls : Yamma.Constants.MAIL_TYPE_DEFINITION.iconCls
					},
					{
						text : 'Entrant',
						iconCls : Yamma.Constants.INBOUND_MAIL_TYPE_DEFINITION.iconCls,
						filter : Ext.create('Ext.util.Filter', {
							property : Yamma.utils.datasources.Documents.MAIL_KIND_QNAME, 
							value : Yamma.utils.datasources.Documents.INCOMING_MAIL_KIND,
							root : 'data'
						})
					},
					{
						text : 'Sortant',
						iconCls : Yamma.Constants.OUTBOUND_MAIL_TYPE_DEFINITION.iconCls,
						filter : Ext.create('Ext.util.Filter', {
							property : Yamma.utils.datasources.Documents.MAIL_KIND_QNAME, 
							value : Yamma.utils.datasources.Documents.OUTGOING_MAIL_KIND,
							root : 'data'
						})
					}
				]
			} 
		});
		
	},
	
	_getDocumentLateStateFilterButtonDefinition : function() {
		
 		return ({ 
			xtype : 'button',
			text : 'Tous',
			iconCls : Yamma.Constants.getIconDefinition('clock').iconCls,
			itemId : 'latestate-filter',
			menu : {
				listeners : {
					'click' : this.onLateStateFilterChange,
					scope : this
				},
				items : [
					{
						text : 'Tous',
						iconCls : Yamma.Constants.getIconDefinition('clock').iconCls
					},
					{
						text : 'Urgent',
						iconCls : Yamma.Constants.getIconDefinition('clock_error').iconCls,
						filter : Ext.create('Ext.util.Filter', {
							filterFn : function(item) {
								var lateState = item.get(Yamma.utils.datasources.Documents.DOCUMENT_LATE_STATE_QNAME);
								return (lateState == Yamma.utils.datasources.Documents.LATE_STATE_HURRY_VALUE) 
									|| (lateState == Yamma.utils.datasources.Documents.LATE_STATE_LATE_VALUE);
							},
							root : 'data'
						})
					},
					{
						text : 'En retard',
						iconCls : Yamma.Constants.getIconDefinition('clock_red').iconCls,
						filter : Ext.create('Ext.util.Filter', {
							property : Yamma.utils.datasources.Documents.DOCUMENT_LATE_STATE_QNAME, 
							value : Yamma.utils.datasources.Documents.LATE_STATE_LATE_VALUE,
							root : 'data'
						})
					}
				]
			} 
		});
		
	},
	
	/**
	 * @private
	 */
	_getDisplayView : function() {
		
		if (null == this._displayView) {
			this._displayView = this.queryById('displayView');
		}
	
		return this._displayView;
		
	},
	
	/**
	 * @private
	 */
	_getCurrentChart : function() {
		
		var 
			displayView = this._getDisplayView(),
			chart = (displayView.query('chart') || [null])[0]
		;
		
		return chart;
		
	},
	
	/**
	 * @private
	 */
	_getReportsGrid : function() {
		
		if (null == this._reportsGrid) {
			this._reportsGrid = this.queryById('reportsGrid');
		}
		
		return this._reportsGrid;
		
	},
	
	clearChartsView : function() {
		
		var displayView = this._getDisplayView();
		displayView.removeAll();
		
	},
	
	onSelectChart : function(grid, selectedRecords) {
		
		var 
			displayView = this._getDisplayView(),
			firstSelectedRecord = selectedRecords[0],
			def = firstSelectedRecord ? firstSelectedRecord.get('chartDefinition') : null,
			chart
		;
			
		if (!firstSelectedRecord) return;
		
		this.clearChartsView();
		
		chart = def ? def.buildChart(this.store) : null;
		displayView.add(chart).show();
		
	},
	
	onMailTypeFilterChange : function(menu, item) {
		
		var
			mailTypeFilterButton = this.queryById('mailtype-filter'),
			filter = item.filter,
			currentMailTypeFilter = mailTypeFilterButton.filter;
		;
		
		if (currentMailTypeFilter) {
			this.store.removeFilter(currentMailTypeFilter, null == filter /* applyFilters */);
		}
		
		mailTypeFilterButton.setText(item.text);
		mailTypeFilterButton.setIconCls(item.iconCls);
		mailTypeFilterButton.filter = filter;
		
		this.store.filter(filter);
		
	},
	
	onLateStateFilterChange : function(menu, item) {
		
		var
			lateStateFilterButton = this.queryById('latestate-filter'),
			filter = item.filter,
			currentLateStateFilter = lateStateFilterButton.filter;
		;
		
		if (currentLateStateFilter) {
			this.store.removeFilter(currentLateStateFilter, null == filter /* applyFilters */);
		}
		
		lateStateFilterButton.setText(item.text);
		lateStateFilterButton.setIconCls(item.iconCls);
		lateStateFilterButton.filter = filter;
		
		this.store.filter(filter);
		
	},
	
	onToggleManagerMode : function(button, pressed) {
		
		var
			me = this,
			isManagerMode = true === pressed
		;
		
		if (isManagerMode && !this.initialStore) {
			this.initialStore = this.store;
		}
		
		this.clearChartsView();
		
		this._filterAvailableCharts(isManagerMode);
		
		if (isManagerMode) {
			this._switchToManagerMode();
		}
		else {
			this._switchToUserMode();
		}
		
	},
	
	_filterAvailableCharts : function(isManagerMode /* boolean */) {
		
		var
			reportsGrid = this._getReportsGrid(),
			gridStore = reportsGrid.getStore()
		;
		
		// Also clear selection of the reports grid
		reportsGrid.getSelectionModel().deselectAll();

		gridStore.clearFilter();
		gridStore.filter([
			{
				filterFn : function(item) {
					var
						chartDefinition = item.get('chartDefinition') || {},
						manager = chartDefinition.manager
					;
					
					return isManagerMode || (true !== manager);
				}
			}
		]);
		
	},
	
	/**
	 * @private
	 */
	_switchToManagerMode : function() {
		
		if (this.managerStore) {
			this.store = this.managerStore;
			return;
		}

		this._retrieveManagerStore();
		
	},
	
	/**
	 * @private
	 */
	_retrieveManagerStore : function() {
		
		var me = this;
		
		function onStoreCreated(store) {
			
			me.managerStore = store;
			me.store = store;
			
			store.load(function callback(){
				me.setLoading(false);
			});
			
		}
		
		function onFailure() {
			
			me.setLoading(false);
			
		}
		
		// Retrieve the store from the server
		
		me.setLoading("Chargement des données");
		
		Yamma.store.YammaStoreFactory.requestNew({
			storeId : 'SubrogatesMailTasks',
			storeConfig : {
				remoteSort : false,
				remoteGroup : false,
				remoteFilter : false
			},
			onStoreCreated : onStoreCreated,
			onFailure : onFailure
		});
		
	},
	
	/**
	 * @private
	 */
	_switchToUserMode : function() {

		this.store = this.initialStore;
		
	},
	
	/**
	 * @private
	 */
	_getManagedServices : function() {
		
		if (!this._managedServices) {
			this._managedServices = Ext.Array.map(
				Yamma.utils.ServicesManager.getServicesList(Yamma.utils.ServicesManager.HAS_ROLE_FILTER('ServiceManager')),
				function(serviceDescription) {
					return serviceDescription.get('name');
				}
			);
		}
		
		return this._managedServices;
		
	}
	
});
