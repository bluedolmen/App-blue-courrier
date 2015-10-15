Ext.define('Yamma.admin.modules.init.InitAdminPanel',{
	
	alias : 'widget.initadminpanel',
	
	requires : [
		'Yamma.admin.modules.init.InitAction'
	],
	
	extend : 'Ext.grid.Panel',
	
	hideHeaders : true,
	
	cls : 'init-action-grid',
	
	initActions : [
   		'Yamma.admin.modules.init.actions.ConfigSite',
   		'Yamma.admin.modules.init.actions.Authorities',
   		'Yamma.admin.modules.init.actions.ConfigSiteDatalists',
		'Yamma.admin.modules.init.actions.Categories',
		'Yamma.admin.modules.init.actions.EmailTemplates',
		'Yamma.admin.modules.init.actions.SynchronizeContacts',
		'Yamma.admin.modules.init.actions.ImapTransfer'
//		'Yamma.admin.modules.init.actions.Test'
	],
	
	initComponent : function() {
		
		this.columns = this.getColumns();
		this.store = this._getStore();
		
		this.callParent(arguments);
		
	},
	
	_getStore : function() {
		
		var 
			me = this,
			actions = [],
			store = Ext.create('Ext.data.ArrayStore', {
			
				storeId : 'adminActions',
				
				fields : [
				    'id',
					'action',
					'title',
					{
						name : 'state',
						defaultValue : Yamma.admin.modules.init.InitAction.INSTALLATION_STATES.UNDETERMINED
					}
				],
				
				data : []
			
			})
		;
		
		Ext.require(this.initActions, function() {
			
			Ext.Array.forEach(me.initActions, function(actionName) {
				createAction(actionName);
			});
			
			store.loadRawData(actions);
			Ext.defer(me.updateState, 100, me);
			
		});
		
		
		function createAction(actionName) {
			
			var action = Ext.create(actionName);
			if (!Ext.isFunction(action.install)) return;
			
			if (!Ext.isFunction(action.getState)) {
				Ext.Error.raise('Illegal action declaration');
			}
				
			actions.push([
			    action.id,
				action,
				action.title
			]);				
			
		}
		
		return store;
		
	},
	
	updateState : function(actionId) {
		
		var
			store = this.store,
			records = []
		;
		
		if (null == store) return;
		
		if (null == actionId) {
			records = store.getRange();
		} 
		else {
			var record = store.findRecord('id', actionId);
			if (null != record) {
				records = [record];
			}
		}
		
		Ext.Array.forEach(records, function(record) {
			
			record.set('state', Yamma.admin.modules.init.InitAction.INSTALLATION_STATES.BUSY);
			
			var action = record.get('action'); 
			action.getState(onStateAvailable);
			
			function onStateAvailable(state) {
				record.set('state', state);
			}
			
		});			
		
	},
	
	getColumns : function() {
		
		return ([
	
			this.getStateColumnDefinition(),
			{ 
				text : 'Nom', 
				dataIndex : 'title', 
				flex : 1
			},
			this.getActionsColumnDefinition()
			
		]);
		
	},
	
//	STATE_TEMPLATE : new Ext.XTemplate(
//		'<div class="installation-state" width="16px" height="16px" border=0 >',
//			'<img class="installation-state-icon state-undetermined icon-bullet_black"></img>',
//			'<img class="installation-state-icon state-no icon-bullet_red x-hide-display"></img>',
//			'<img class="installation-state-icon state-full icon-bullet_green x-hide-display"></img>',
//			'<img class="installation-state-icon state-partial icon-bullet_orange x-hide-display"></img>',
//		'</div>'
//	),
	
	STATE_ICON_MAPPING : {
		'state-busy' : {
			icon : 'bullet_busy.gif',
			tooltip : 'En cours'
		},
		'state-undetermined' : {
			icon : 'bullet_black',
			tooltip : 'Indéterminé'
		},
		'state-full' : {
			icon : 'bullet_green',
			tooltip : 'Complet'
		},
		'state-partial' : {
			icon : 'bullet_orange',
			tooltip : 'Partiel'
		},
		'state-modified' : {
			icon : 'bullet_orange',
			tooltip : 'Modifié'
		},
		'state-no' : {
			icon : 'bullet_red',
			tooltip : 'Non installé'
		}
	},
	
	getStateColumnDefinition : function() {
		
		var me = this;

		return {
			xtype : 'actioncolumn',
			dataIndex : 'state',
			width : 25,
			text : 'Etat',
			
			items : [
				{
					getClass : function(value, meta, record) {
						
						var
							state = record.get('state'),
							stateDefinition = me.STATE_ICON_MAPPING[state],
							iconCls = Yamma.Constants.getIconDefinition(stateDefinition.icon).iconCls,
							tooltip = stateDefinition.tooltip
						;
						
						return (
							iconCls
							+ ' state-icon data-qtip="' + tooltip + '"'
						);
					}
				}
			]
			
		};
		
		
	},
	
	getActionsColumnDefinition : function() {
		
		var me = this;
		
		function bindNewState(record) {
			return function(newState) {
				record.set('state', newState);
			};
		};
		
		function bindUpdateState(record) {
			var actionId = record.get('id');
			return function() {
				me.updateState(actionId);
			};
		};

		function canInstall(state) {
			return (
				'state-no' == state ||
				'state-partial' == state ||
				'state-modified' == state
			);
		}
		
		function canDelete(state) {
			return (
				'state-full' == state ||
				'state-partial' == state ||
				'state-modified' == state
			);
		}
		
		return ({ 
			text : 'Action',
			xtype : 'actioncolumn',
			dataIndex : 'state',
			width : 65,
			items: [
				{
					icon: Yamma.Constants.getIconDefinition('add').icon,
					tooltip: 'Installer',
					handler: function(view, row, col, item, e, record, row) {
						
						var
							action = record.get('action') || Ext.Error.raise('Cannot get action definition'),
							installFunction = action.install,
							onNewStateAvailable = bindUpdateState(record)
						;
						
						record.set('state', Yamma.admin.modules.init.InitAction.INSTALLATION_STATES.BUSY);
						Ext.Function.defer(installFunction, 10, action, [onNewStateAvailable]);
						
					},
					
					getClass : function(value, meta, record) {
						
						var state = record.get('state');
						return canInstall(state) ? '' : 'x-hide-display';
						
					}
				},
				{
					icon: Yamma.Constants.getIconDefinition('delete').icon,
					tooltip: 'Désinstaller',
					handler: function(view, row, col, item, e, record, row) {
						
						var
							action = record.get('action') || Ext.Error.raise('Cannot get action definition'),
							uninstallFunction = action.uninstall,
							onNewStateAvailable = bindUpdateState(record)
						;
						
						record.set('state', Yamma.admin.modules.init.InitAction.INSTALLATION_STATES.BUSY);
						Ext.Function.defer(uninstallFunction, 10, action, [onNewStateAvailable]);
						
					},
					getClass : function(value, meta, record) {
						
						var
							action = record.get('action'),
							uninstall = action.uninstall,
							state = record.get('state')
						;
						
						return Ext.isFunction(uninstall) && canDelete(state) ? '' : 'x-hide-display';
						
					}
				}
				
			]
		});
		
	}
	
	
	
	
	
});