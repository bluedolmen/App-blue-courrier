Ext.define('Yamma.view.dialogs.MainDeliveryDialog', {

	extend : 'Ext.window.Window',
	alias : 'widget.maindeliverydialog',
	
	requires : [
		'Yamma.view.services.ServicesView',
		'Ext.grid.plugin.CellEditing'
	],
	
	uses : [
	    'Yamma.utils.DeliveryUtils'
	],
	
	statics : {
		
		ROLE_PARAMS : {
			
			'procg' : {
				title : 'Service de traitement destination',
				iconCls : Yamma.Constants.getIconDefinition(Yamma.utils.DeliveryUtils.ICON_CLS_BASENAME['procg']).iconCls
			},
			'procg/from' : {
				title : 'Service de traitement actuel',
				iconCls : Yamma.Constants.getIconDefinition(Yamma.utils.DeliveryUtils.ICON_CLS_BASENAME['procg'] + '_location').iconCls
			},
			'procg/to' : {
				title : 'Service de traitement destination',
				iconCls : Yamma.Constants.getIconDefinition(Yamma.utils.DeliveryUtils.ICON_CLS_BASENAME['procg'] + '_go').iconCls
			},
			'col' : {
				title : 'Service en collaboration',
				iconCls : Yamma.Constants.getIconDefinition(Yamma.utils.DeliveryUtils.ICON_CLS_BASENAME['col']).iconCls
			},
			'col/from' : {
				title : 'Service en collaboration actuel',
				iconCls : Yamma.Constants.getIconDefinition(Yamma.utils.DeliveryUtils.ICON_CLS_BASENAME['col'] + '_location').iconCls
			},
			'col/to' : {
				title : 'Service en collaboration destination',
				iconCls : Yamma.Constants.getIconDefinition(Yamma.utils.DeliveryUtils.ICON_CLS_BASENAME['col'] + '_go').iconCls
			},
			'inf' : {
				title : 'Service en information',
				iconCls : Yamma.Constants.getIconDefinition(Yamma.utils.DeliveryUtils.ICON_CLS_BASENAME['inf']).iconCls
			},
			'inf/from' : {
				title : 'Service en information actuel',
				iconCls : Yamma.Constants.getIconDefinition(Yamma.utils.DeliveryUtils.ICON_CLS_BASENAME['inf'] + '_location').iconCls
			},
			'none' : {
				title : 'Service non affecté',
				iconCls : 'unaffected-service'
//				iconCls : Yamma.Constants.getIconDefinition('bullet_white').iconCls
			}
			
		},
		
		ROLE_ORDERS : {
			
			'procg' : ['inf', 'procg/to', 'col', 'none'],
			'col' : ['inf', 'col/to', 'col', 'none'],
			'inf' : ['inf', 'none']
			
		},
		
		STATUS_PARAMS : {
			'pending' : {
				title : 'Enregistré mais non appliqué',
				iconCls : Yamma.Constants.getIconDefinition('hourglass').iconCls
			},
			'edited' : {
				title : 'Edité, mais non enregistré',
				iconCls : Yamma.Constants.getIconDefinition('pencil').iconCls
			},
			'ongoing' : {
				title : 'En cours',
				iconCls : Yamma.Constants.getIconDefinition('group_gear').iconCls
			},
			'done' : {
				title : 'Terminé',
				iconCls : Yamma.Constants.getIconDefinition('tick').iconCls
			},
			'procg/done' : {
				title : 'Service de traitement destination traité',
				iconCls : Yamma.Constants.getIconDefinition(Yamma.utils.DeliveryUtils.ICON_CLS_BASENAME['procg'] + '_tick').iconCls
			},
			'col/done' : {
				title : 'Service en collaboration traité',
				iconCls : Yamma.Constants.getIconDefinition(Yamma.utils.DeliveryUtils.ICON_CLS_BASENAME['col'] + '_tick').iconCls
			},
			'inf/done' : {
				title : 'Service en information traité',
				iconCls : Yamma.Constants.getIconDefinition(Yamma.utils.DeliveryUtils.ICON_CLS_BASENAME['inf'] + '_tick').iconCls
			},
			'none' : {
				title : '',
				iconCls : ''
			}
			
		}
		
	},
	
	title : 'Distribuer',
	height : 500,
	width : 500,
	
	modal : true,
	
	headerPosition : Yamma.utils.Preferences.getPV(Yamma.utils.Preferences.PREFERED_HEADER_POSITION),
	
	renderTo : Ext.getBody(),
	
	/**
	 * @cfg {String} nodeRef
	 * The node which is processed
	 */
	nodeRef : null,
	
	/**
	 * @cfg {String} taskRef
	 * The particular task on which we are working on
	 */
	taskRef : null,
	
	enableSave : true,
	enableProcessSelection : 'false' != Yamma.config.client['wf.incoming.supervisor-validation'],
	enableMainRoleSelection : true,
	
	initComponent : function() {
		
		var
			me = this,
			MDD = Yamma.view.dialogs.MainDeliveryDialog,
			
	 		workflowStore = Ext.create('Ext.data.Store', {
	 			fields : ['id','label'],
	 			data : [
					{ 'id' : 'with-validation', 'label' : 'Avec validation'},
					{ 'id' : 'without-validation', 'label' : 'Sans validation'}
				]
	 		}),
	 		
	 		deliveryRolesManager = Yamma.store.DeliveryRoles.INSTANCE,
	 		
	 		processKindStore = Ext.create('Ext.data.Store', {
	 			fields : ['id','label'],
	 			data : Ext.Array.map(Ext.Object.getValues(Yamma.utils.DeliveryUtils.getProcessKinds()), function(processKind) {
		 			
		 			return {
		 				'id' : processKind.id,
		 				'label' : processKind.label,
		 				'iconCls' : processKind.iconCls || ''
		 			};
		 			
		 		})
	 		})
		;
		
		me._initTaskProperties();
		
		Ext.define('Yamma.view.dialogs.MainDeliveryDialog.ServicesView', {
			
			extend : 'Yamma.view.services.ServicesView',
			
			title : 'Services',
			allowDeselect : true,
			headerPosition : 'top',
			initialSelection : this.initialService,
			
			showDisabled : true,
			storeConfig : {
				groupIconCls : function(value, record) {
					
					var name = record.get('name');
					return MDD.KIND_COLUMN[(me.initialService == name) ? 'initial-service' : 'service'].iconCls;
					
				}
			},
			
//		    viewConfig : {
//				getRowClass : function(record) {
//					
//					return record.get('status') ? 'status-' + record.get('status') : '';
//					
//				}
//		    },			

			getColumns : function() {
				
				var
					columns = this.callParent()
				;
				
				function isOngoing(record) {
					return 'ongoing' == record.get('status');
				}
				
				function isModifiable(record) {
					return !isOngoing(record);
				}
				
				columns.push({
					text: 'Action',
					width : 30,
					xtype: 'alfrescoactioncolumn',
					
					items : [
						{
							
							handler: function(grid, rowIndex, colIndex, actionItem, event, record, row) {
								
								if (!isModifiable(record)) return; // cannot change an operation in progress
								
								var
									role = record.get('role'),
									status = record.get('status')
								;
								
								function getNewRole() {
									
									var 
										roleIndex = 'done' == status ? me.roleOrder.indexOf('none') : me.roleOrder.indexOf(role)
									;
									
									roleIndex = getNextRoleIndex(roleIndex);
									
									if (Ext.String.endsWith(me.roleOrder[roleIndex], '/to') && isTargetRoleAssigned()) {
										if (1 == me.roleOrder.length) return null;
										roleIndex = getNextRoleIndex(roleIndex);
									}
									
									return me.roleOrder[roleIndex];
									
									function getNextRoleIndex(index) {
										
										if (-1 == roleIndex) return me.roleOrder.indexOf('none'); // not null else we would be stuck in some cases
										return (index + 1) % me.roleOrder.length;
										
									}
									
									function isTargetRoleAssigned() {
										var store = grid.getStore();
										return -1 != store.findBy(function(record) {return Ext.String.endsWith(record.get('role'), '/to'); });
									}
									
								}
									
								role = getNewRole();
								if (null == role) return;
								
								record.set('role', role);
								if ('none' == role && 'done' == record.modified['status']) {
									record.reject();
								}
								else if (record.isModified('role') || 'done' == record.modified['status']) {
									record.set('status', 'edited');
								}
								else {
									record.reject();
								}
								
								me.validateOperation();

							},
							
							getClass : function(value, meta, record) {
								
								var
									name = record.get('name'),
									status = record.get('status'),
									role = 'done' == status && (me._getCurrentServiceName() != name) ? 'none' : (record.get('role') || 'none'),
									roleParams = MDD.ROLE_PARAMS[role] || MDD.ROLE_PARAMS['none'], 
									iconCls = roleParams.iconCls
								;

								return iconCls + (isModifiable(record) ? '' : ' status-unmodifiable');

							},
							
							getTip : function(value, meta, record) {
								
								var
									name = record.get('name'),
									role = record.get('role') || 'none',
									roleParams = Yamma.view.dialogs.MainDeliveryDialog.ROLE_PARAMS[role] || Yamma.view.dialogs.MainDeliveryDialog.ROLE_PARAMS['none'] 
								;
								
								return roleParams.title;
								
							}
							
						},
						{
							getClass : function(value, meta, record) {
								
								var
									status = record.get('status') || 'none',
									statusParams, 
									iconCls
								;
								
								if ('done' == status) {
									status = record.get('role') + '/done';
								}
								
								statusParams = Yamma.view.dialogs.MainDeliveryDialog.STATUS_PARAMS[status] || Yamma.view.dialogs.MainDeliveryDialog.STATUS_PARAMS['none'];
								iconCls = statusParams.iconCls;
								
								return iconCls + ' status-unmodifiable';
								
							},
							
							getTip : function(value, meta, record) {
								
								var
									status = record.get('status') || 'none',
									statusParams = Yamma.view.dialogs.MainDeliveryDialog.STATUS_PARAMS[status] || Yamma.view.dialogs.MainDeliveryDialog.STATUS_PARAMS['none'] 
								;
								
								return statusParams.title;
								
							}
							
						}
						
					]
				});
				
				
				return columns;
				
			},
			
			storeConfig : {
				
				additionalFields : [
				    {
				    	name : 'role',
				    	defaultValue : 'none',
				    	convert : function(value, record) {
				    		if (me.initialService == record.get('name')) return (me.initialRole || 'procg') + '/from';
				    		return value;
				    	}
				    },
				    'status'
				]
				
			}
			
		}, function() {
			
			me.servicesView = new this({
				itemId : 'services-tree',
				region : 'center',
				flex : 1
			});
			
			me.servicesStore = me.servicesView.getStore();
			
		});
		
		this.validationCombo = Ext.create('Ext.form.field.ComboBox', {
			xtype : 'combobox',
			itemId : 'process-combo',
			fieldLabel : 'Circuit',
			store : workflowStore,
			queryMode : 'local',
			displayField : 'label',
			valueField : 'id',
			value : me.initialProcess,
			labelWidth : 150,
			disabled : !me.enableProcessSelection,
			listeners : {
				'change' : function() {
					me.validateOperation();
				}
			}			
		});
		
		this.processKindCombo = Ext.create('Ext.form.field.ComboBox', {
			xtype : 'combobox',
			itemId : 'processing-roles-combo',
			fieldLabel : 'Type de traitement',
			store : processKindStore,
			queryMode : 'local',
			displayField : 'label',
			valueField : 'id',
			value : me.mainRole,
			labelWidth : 150,
			disabled : !me.enableMainRoleSelection,
			listeners : {
				'change' : function(combo, newvalue, oldvalue) {
					me.validateOperation();
					filterAvailableRoles(newvalue);
				}
			}			
		});
		
		function filterAvailableRoles(processKind) {
			
			var 
				activeRoles = Yamma.utils.DeliveryUtils.getRolesForProcessKind(processKind),
				serviceRole = me.initialRole
			;
			
			if (!Ext.Array.contains(activeRoles, serviceRole)) {
				// The process-kind changed, but the new active-roles does not contain the previous-role, fallback on the first value
				serviceRole = activeRoles[0];
			}
			
			me.roleOrder = Yamma.view.dialogs.MainDeliveryDialog.ROLE_ORDERS[serviceRole];
			
			// TODO: Should also fix the previously set values
			
		}
		
		this.layout = 'vbox';
		this.defaults = {
			width : '100%',
			border : 1,
			margin : 5
		};
		
		this.items = [
		    
			{
				xtype : 'container',
				layout : 'vbox',
				flex : 0,
				defaults : {
					margin : 5,
					flex : 1,
					width : '100%',
					fieldStyle : {
						'font-size' : '1em',
						'font-weight' : 'bold',
						'color' : '#15498B'
					}
				},
				items : [
				    this.processKindCombo,
				    this.validationCombo
				]
			},
			
		    me.servicesView,
		    
			{
				xtype : 'container',
				itemId : 'error-message',
				hidden : true,
				region : 'north',
				height : 40,
				flex : 0,
				defaults : {
					margin : 3
				},
				cls : 'error',
				tpl : new Ext.XTemplate('<p>{message}</p>')
			}
		];
		
		this.dockedItems = [{
		    xtype: 'toolbar',
		    dock: 'bottom',
		    ui: 'footer',
		    defaults: { minWidth: Ext.panel.Panel.minButtonWidth },
		    items: [
		        { xtype: 'component', flex: 1 }
		    ].concat(this.getButtons() || [])
		}];
		
		me.mon(me.servicesStore, 'load', me._initialValues, me);
		
		this.callParent();
		
	},
	
	_getCurrentServiceName : function() {
		
		return this.taskProperties['serviceName'];
		
	},
	
	_getCurrentServiceRole : function() {
		
		return this.taskProperties['serviceRole'];
		
	},
	
	_getCurrentShares : function() {
		
		return this.taskProperties['shares'];
		
	},
	
	getButtons : function() {
		
		var me = this;
		
		return [
	        { 
	        	xtype: 'button',
	        	itemId : 'save-button',
	        	text: 'Enregistrer',
	        	icon : Yamma.Constants.getIconDefinition('disk').icon,
	        	hidden : !this.enableSave,
	        	disabled : true,
	        	handler : function() {
					me.save();
	        	}
	        },
	        { 
	        	xtype: 'button', 
	        	itemId : 'cancel-button',
	        	text: 'Annuler',
	        	icon : Yamma.Constants.getIconDefinition('cancel').icon,
	        	handler : function() {
	        		me.close();
	        	}
	        }
        ];
		
	},
	
	_initTaskProperties : function() {
		
		if (!this.task) return;
		var 
			properties = Ext.apply({}, this.task.properties),
			index,
			propertyName,
			serviceRole
		;
		
		for (var key in this.task.properties) {
			
			// copy properties without the namespace
			index = key.indexOf('}');
			propertyName = (-1 != index) ? key.substring(index + 1) : key;
			properties[propertyName] = this.task.properties[key];
			
		}
		
		this.taskProperties = properties;
		
		serviceRole = this._getCurrentServiceRole() 
			|| this.taskProperties[Yamma.utils.DeliveryUtils.PROP_SERVICE_ROLE] 
			|| ( 'Start' == this.taskProperties.pendingOutcome ? 'procg' : null);
		
		this.roleOrder = Yamma.view.dialogs.MainDeliveryDialog.ROLE_ORDERS[serviceRole];
		if (undefined === this.roleOrder) {
			Ext.Error.raise('Cannot find a valid role-order for the provided role ' + serviceRole);
		}
		
//		this.baseRoleOrder = Ext.Array.map(this.roleOrder, function(roleOrder) {return roleOrder.replace(/\/to/,'');});
		
		this.initialService = this.taskProperties[Yamma.utils.DeliveryUtils.PROP_SERVICE_NAME];
		this.initialRole = serviceRole;
		
	},
	
	_initialValues : function() {
		
		var me = this;

		if (null == me.task) return;
		
		this._initProcess();
		this._addCurrentShares();
		
	},
	
	_initProcess : function(task) {
		
		task = task || this.task;
		
		var
			me = this,
			properties = task.properties || {},
			validateDelivering = properties[Yamma.utils.DeliveryUtils.PROP_VALIDATE_DELIVERING],
			processKind = properties[Yamma.utils.DeliveryUtils.PROP_PROCESS_KIND]
		;
		
		if (null != processKind) {
			me.processKindCombo.setValue(processKind);
		}
		
		if (null != validateDelivering) {
			me.validationCombo.setValue('true' === validateDelivering || true === validateDelivering ? 'with-validation' : 'without-validation');
		}
		
	},
	
	_addCurrentShares : function(currentShares, pendingShares) {
		
		var me = this;
		
		currentShares = currentShares || me.currentShares;
		setServices(currentShares.services, 'none');
		
		pendingShares = pendingShares || me.task ? Yamma.utils.DeliveryUtils.getTaskShares(me.task) : []
		if (pendingShares) {
			setServices(pendingShares.services, 'pending');
		}
		
		function setServices(services, defaultStatus) {
			
			Ext.Array.forEach(services || [], function(service) {
				
				var 
					serviceName = service.serviceName,
					role = service.role || 'inf',
					status = (!service.status || 'none' == service.status) ? defaultStatus : service.status
				;
				
				setServiceRole(serviceName, role, status);
				
			});
			
		}
		
		function setServiceRole(serviceId, role, status) {
			
			var record = me.servicesStore.getRootNode().findChild('id', serviceId, true /* deep */);
			if (!record) return;
			
			record.set('role', role);
			record.set('status', status);
			
			record.commit(true /* silent */);
			
		}
		
	},
	
	/**
	 * @returns: true if valid, false or an error message if not
	 */
	isValid : function() {
		
		return true;
		
	},	
	
	validateOperation : function() {
		
		var isValid = this.isValid();
		this.onStateChanged(this.somethingHasChanged(), isValid);
		this._setErrorMessage(Ext.isString(isValid) ? isValid : null);
		
	},
	
	onStateChanged : function(hasChanged, isValid) {

		this._setCanSave(hasChanged && true === isValid);
		
		
	},
	
	onSharesChanged : function() {
		
	},
	
	save : function() {
		
	},
	
	getAddedShares : function() {
		
		function filterFunc(node) {
			return 'none' != node.get('role') && ( node.isModified('role') || 'pending' == node.get('status') );
		}
		
		return this.getShares(filterFunc);
		
	},
	
	/**
	 * This is actually limited to services for the moment
	 */
	getShares : function(filterFunc) {
		
		var
			shares = []
		;
		
		if (!Ext.isFunction(filterFunc)) {
			filterFunc = function(){return true;}
		}
		
		this.servicesStore.getRootNode().cascadeBy(function(node){
			
			if (!filterFunc(node)) return;
			
			var serviceName = node.get('name');
			if (!serviceName) return; // root-node
			
			shares.push({
				serviceName : node.get('name'),
				role : node.get('role'),
				status : node.get('status')
			})
			
		});
		
		return {
			services : shares
		};
		
	},
	
	getProcess : function() {
		
		return {
			validation : 'with-validation' == this.validationCombo.getValue(),
			kind : this.processKindCombo.getValue()
		}
		
	},
	
	somethingHasChanged : function() {
		
		return (
			this.enableProcessSelection && (this.initialProcess != this.validationCombo.getValue())
			|| this.enableMainRoleSelection && (this.mainRole != this.processKindCombo.getValue())
			|| null != this.servicesStore.getRootNode().findChildBy(function(node) {
				return node.isModified('role');
			}, this /* scope */, true /* deep */)
		);
		
	},
	
	_setCanSave : function(canSave) {
		
		var saveButton = this.queryById('save-button');
		saveButton.setDisabled(!canSave);
		
	},
	
	_setErrorMessage : function(message) {
		
		var errorContainer = this.queryById('error-message');
		if (null == errorContainer) return;
		
		errorContainer.update({
			message : message
		});
		
		errorContainer.setVisible(null != message);
		
	}
	
});
