Ext.define('Yamma.view.dialogs.CirculateDialog', {

	extend : 'Ext.window.Window',
	alias : 'widget.circulatedialog',
	
	requires : [
		'Bluedolmen.store.PersonStore',
		'Ext.grid.plugin.CellEditing'
	],
	
	uses : [
	    'Yamma.utils.DeliveryUtils',
	    'Yamma.utils.ServicesManager'
	],
	
	statics : {
		
		KIND_COLUMN : {
			
			'user' : {
				iconCls : Yamma.Constants.getIconDefinition('user').iconCls,
				title : 'Utilisateur',
				prefix : 'loc'
			},
			
			'group' : {
				iconCls : Yamma.Constants.getIconDefinition('group').iconCls,
				title : 'Groupe',
				prefix : 'grp'
			},
			
			'service' : {
				iconCls : Yamma.Constants.getIconDefinition('group_mail').iconCls,
				title : 'Service',
				prefix : 'ser'
			}
			
		},
		
		ICON_APPLY : Yamma.Constants.getIconDefinition('transmit').icon,
		
		ICON_CANCEL : Yamma.Constants.getIconDefinition('cancel').icon,
		
		PERMISSIONS_GET_URL : 'alfresco://bluedolmen/yamma/permissions?nodeRef={nodeRef}&includeDisplayNames=true'
		
	},
	
	title : 'Diffuser',
	height : 400,
	width : 600,
	
	modal : true,
	
	headerPosition : Yamma.utils.Preferences.getPV(Yamma.utils.Preferences.PREFERED_HEADER_POSITION),
	
	renderTo : Ext.getBody(),
	url : 'alfresco://bluedolmen/yamma/circulate',
	
	/**
	 * @cfg {String} nodeRef
	 * The node which is processed
	 */
	nodeRef : null,
	
	/**
	 * @cfg {Boolean} true/false
	 * Whether to provide or no the selection of services
	 */
	enableServicesSelection : true,
	
	initComponent : function() {
		
		var
			me = this
		;
		
		me.sharesStore = Ext.create('Ext.data.Store', {
		    storeId:'sharesStore',
 			fields : ['id', 'label', 'kind', 'state'],
		    data: [],
		    proxy: {
		        type: 'memory',
		        reader: {
		            type: 'json'
		        }
		    },
		    
		    groupers : [
		        {
		        	direction : 'ASC',
		        	property : 'kind'
		        }
		    ],
		    
		    listeners : {
		    	
		    	'update' : function(store, record, operation, modifiedFieldNames) {
		    		
		    	}
		    
		    }
		    
 		});		
		
		

		me.sharesGrid = Ext.create('Ext.grid.Panel', {
			
		    title: 'Diffuser à',
		    cls : 'shares-grid',
		    header : false,
		    hideHeaders : true,
		    store: me.sharesStore,
		    region : 'center',
//		    flex : 1,
//		    width : '100%',
		    border : 1,
		    
		    features: [{
		    	groupField : 'kind', 
		        groupHeaderTpl: new Ext.XTemplate('{name:this.formatRole}', {
		        	
		        	formatRole : function(kind) {
		        		var name = ( Yamma.view.dialogs.CirculateDialog.KIND_COLUMN[kind] || {} ).title;
		        		return name ? name + 's' : 'Pas de type';
		        	}
		        
		        }),
		        ftype: 'grouping',
		        collapsible : false
		    }],		    
		    
		    columns: [
		        {
		        	text : 'Kind',
		        	xtype : 'actioncolumn',
		        	dataIndex : 'kind',
		        	width : 50,
					getClass : function(kind, meta, record) {
						
						var
							columnDef = Yamma.view.dialogs.CirculateDialog.KIND_COLUMN[kind],
							iconCls = columnDef ? columnDef.iconCls : ''
						;
						
						return iconCls;
						
					},	
					getTip : function(kind, meta, record) {
						return (Yamma.view.dialogs.CirculateDialog.KIND_COLUMN[kind] || {}).title || '(inconnu)';
					}
		        },
		        
		        { 
		        	text: 'Nom', 
		        	dataIndex: 'label', 
		        	flex: 1 
		        },
		        
		        {
		        	text : 'Actions',
		        	xtype : 'actioncolumn',
		        	width : 30,
		        	items: [
						{
			                icon: Yamma.Constants.getIconDefinition('cross').icon,
			                tooltip: 'Enlever',
			                handler: function(grid, rowIndex, colIndex) {
			                	
			                    var record = grid.getStore().getAt(rowIndex);
			                    record.store.remove(record);
			                	
			                },
							getClass : function(value, meta, record) {
								
								return !canDelete(record) ? Ext.baseCSSPrefix + 'hide-display' : '';
								
							}			                
			            }
		        	]
		        	
		        }
		        
		    ]
		
		});
		
		function canDelete(record) {
			
			return 'new' == record.get('state');
			
		}
		
		me.personCombo = Ext.create('Ext.form.field.ComboBox', {
			
			minChars : 3,
		    labelWidth : 30,
		    queryMode: 'remote',
		    queryParam: 'filter',
		    displayField : 'displayName',
		    valueField: 'userName',
		    hideTrigger : true,
		    grow : true,
		    fieldLabel: '&nbsp',
		    labelSeparator : '',
		    labelClsExtra : Yamma.Constants.getIconDefinition('user_add').iconCls,
		    labelStyle : 'background-repeat:no-repeat ; background-position:center',
		    
		    listConfig: {
				loadingText: 'Recherche...',
				emptyText: 'Aucun utilisateur trouvé.'		
			},
			
			store : Ext.create('Bluedolmen.store.PersonStore'),
			
			listeners : {
				
				select : function(combo, records, e) {
					if (records.length == 0) return;
					
					var 
						firstRecord = records[0],
						userName = firstRecord.get('userName'),
						displayName = firstRecord.get('displayName')
					;
					
					combo.clearValue();
					me._addShare(userName, displayName, 'user');
					
				}
				
//				specialkey: function(field, e) {
//					if (e.getKey() != e.ENTER) return;
//					
//					var email = field.getValue();
//					if (!Ext.data.validations.email({}, email)) return;
//					
//					field.clearValue();
//					
//				}
				
			}
			
		});

		me.groupCombo = Ext.create('Ext.form.field.ComboBox', {
			
			minChars : 3,
		    labelWidth : 30,
		    queryMode: 'remote',
		    queryParam: 'shortNameFilter',
		    displayField : 'displayName',
		    valueField: 'shortName',
		    hideTrigger : true,
		    grow : true,
		    fieldLabel: '&nbsp',
		    labelSeparator : '',
		    labelClsExtra : Yamma.Constants.getIconDefinition('group_add').iconCls,
		    labelStyle : 'background-repeat:no-repeat ; background-position:center',
		    
		    listConfig: {
				loadingText: 'Recherche...',
				emptyText: 'Aucun groupe trouvé.'		
			},
			
			store : Ext.create('Bluedolmen.store.GroupStore'),
			
			listeners : {
				
				select : function(combo, records, e) {
					if (records.length == 0) return;
					
					var 
						firstRecord = records[0],
						shortName = firstRecord.get('shortName'),
						displayName = firstRecord.get('displayName')
					;
					
					combo.clearValue();
					me._addShare(shortName, displayName, 'group');
					
				}
				
			}
		    
		});
		
		Ext.define('Yamma.view.dialogs.CirculateDialog.ServicesView', {
			
			extend : 'Yamma.view.services.ServicesView',
			
			title : 'Services',
			
			showDisabled : true,
			
			viewConfig : {
				toggleOnDblClick : false
			},
			
			listeners : {
				
				'itemdblclick' : function(tree, record, item) {
					
					var 
						id = record.get('name'),
						label = record.get('text'),
						disabled = record.get('disabled')
					;
					
					if (disabled) return;
					
					me._addShare(id, label, 'service' /* kind */);
											
				}
				
			}			
			
		}, function() {
			
			me.servicesView = new this({
				itemId : 'services-tree',
				region : 'east',
				flex : 1,
		    	collapsible : true,
		    	collapsed : true,
		    	margin : '2px'
			});
			
		});

		me.layout = 'border';
		
		me.sharesGrid.flex = 1;
		
		me.items = Ext.Array.clean([
		              
		    {
		    	xtype : 'container',
		    	region : 'center',
		    	width : '100%',
		    	layout : 'vbox',
		    	defaults : {
		    		width : '100%',
		    		margin : '2px'
		    	},
		    	items : [
    			    me.personCombo,
    			    me.groupCombo,
    			    me.sharesGrid
		    	]
		    
		    },
		    
		    me.enableServicesSelection ? me.servicesView : null,
		    
			{
				xtype : 'container',
				itemId : 'error-message',
				hidden : true,
				region : 'south',
				height : 40,
				flex : 0,
				defaults : {
					margin : 3
				},
				cls : 'error',
				tpl : new Ext.XTemplate('<p>{message}</p>')
			}
		    
		]);
		
		this.dockedItems = [{
		    xtype: 'toolbar',
		    dock: 'bottom',
		    ui: 'footer',
		    defaults: { minWidth: Ext.panel.Panel.minButtonWidth },
		    items: [
		        { xtype: 'component', flex: 1 }
		    ].concat(this.getButtons() || [])
		}];
		
		
		me.on('render', me._retrieveCurrentShares, me);
		
		this.callParent();
		
	},
	
	getButtons : function() {
		
		var me = this;
		
		return [
	        { 
	        	xtype: 'button',
	        	itemId : 'apply-button',
	        	text: 'Diffuser',
	        	icon : Yamma.view.dialogs.CirculateDialog.ICON_APPLY,
	        	disabled : true,
	        	handler : function() {
					me.apply();
	        	}
	        },
	        { 
	        	xtype: 'button', 
	        	itemId : 'cancel-button',
	        	text: 'Annuler',
	        	icon : Yamma.view.dialogs.CirculateDialog.ICON_CANCEL,
	        	handler : function() {
	        		me.close();
	        	}
	        }
        ];
		
	},
	
	_addShare : function(configOrId, label, kind) {
		
		var
			config = Ext.isObject(configOrId) ? configOrId : { id : configOrId, label : label, kind : kind }
		;

		if (false !== config.checkExisting) {
			if (-1 != this.sharesStore.find('id', config.id)) return;
		}
		
		this.sharesStore.add({
			
			id : config.id,
			label : config.label,
			kind : config.kind,
			state : config.state || 'new'
			
		});		
		
	},

	_retrieveCurrentShares : function() {
		
		var me = this;

		if (null == me.nodeRef) return;
		
		var url = Bluedolmen.Alfresco.resolveAlfrescoProtocol(Yamma.view.dialogs.CirculateDialog.PERMISSIONS_GET_URL)
			.replace(/\{nodeRef\}/, me.nodeRef)
		;
		
		me.setLoading(true);
		
		// For local-users, we need to get the display-names from the server
		Bluedolmen.Alfresco.jsonRequest({
			
			url : url,
			
			onSuccess : function onSuccess(jsonResponse) {
				
				addCurrentPermissions(jsonResponse);
				me.sharesStore.on('datachanged', me.onSharesChanged, me);
				
			},
			
			onFailure : function onFailure() {
				
				Ext.Msg.show({
					title: 'Erreur',
					msg: 'Impossible de récupérer les partages courants',
					width: 300,
					buttons: Ext.Msg.OK,
					multiline: true,
					icon: Ext.window.MessageBox.ERROR
				});
				
				me.close();
				
			},
			
			"finally" : function() {
				me.setLoading(false);			
			},
			
			scope : this
			
		});
		
		function addCurrentPermissions(response) {
			
			var authorityId, authorityName, split, permission;
			
			// users, services and others
			for (authorityId in response.users) {
				
				permission = response.users[authorityId];
				split = authorityId.split('|');
				authorityId = split[0];
				authorityName = split[1] || authorityId;
				
				me._addShare({
					id : authorityId, 
					label : authorityName, 
					kind : 'user', 
					checkExisting : false,
					state : 'applied'
				});
				
			}
			
			for (authorityId in response.services) {
				
				permission = response.services[authorityId]['ServiceAssistant'];
				split = authorityId.split('|');
				authorityId = split[0];
				authorityName = split[1] || Yamma.utils.ServicesManager.getDisplayName(authorityId);
				
				me._addShare({
					id : authorityId, 
					label : authorityName, 
					kind : 'service', 
					checkExisting : false,
					state : 'applied'
				});

			}
			
			for (authorityId in response.others) {
				
				permission = response.others[authorityId];
				split = authorityId.split('|');
				authorityId = split[0];
				authorityName = split[1] || authorityId;
				
				me._addShare({
					id : authorityId, 
					label : authorityName, 
					kind : 'group', 
					checkExisting : false,
					state : 'applied'
				});
				
			}
			
			me.sharesStore.commitChanges(); // commit changes in memory
			
		}
		
	},
	
	/**
	 * @returns: true if valid, false or an error message if not
	 */
	isValid : function() {
		
		var isValid;
		
		return true;
		
	},	
	
	validateOperation : function() {
		
		var isValid = this.isValid();
		this.onStateChanged(this.somethingHasChanged(), isValid);
		this._setErrorMessage(Ext.isString(isValid) ? isValid : null);
		
	},
	
	onStateChanged : function(hasChanged, isValid) {

		this._setCanApply(hasChanged && true === isValid);
		
	},
	
	onSharesChanged : function() {
		
		this.validateOperation();
		
	},
	
	getAddedShares : function() {
		
		return this.sharesStore.query('state','new').getRange();
		
	},
		
	somethingHasChanged : function() {
		
		return !Ext.isEmpty(this.getAddedShares());
		
	},
	
	_setCanApply : function(canSave) {
		
		var applyButton = this.queryById('apply-button');
		applyButton.setDisabled(!canSave);
		
	},
	
	_setErrorMessage : function(message) {
		
		var errorContainer = this.queryById('error-message');
		if (null == errorContainer) return;
		
		errorContainer.update({
			message : message
		});
		
		errorContainer.setVisible(null != message);
		
	},
	
	apply : function() {
		
		var 
			me = this,
			url = Bluedolmen.Alfresco.resolveAlfrescoProtocol(me.url),
			addedShares = me.getAddedShares()
		;
		
		function encodeShares(shares) {
			
			return Ext.Array.map(shares || [], function(share) {
				
				var
					id = share.get('id'),
					kind = share.get('kind'),
					prefix = (Yamma.view.dialogs.CirculateDialog.KIND_COLUMN[kind] || {}).prefix,
					role = 'inf'
				;
				
				if (!prefix) return;
				
				return prefix + '_' + id + '|' + role;
				
			}).join(',');
			
		}
		
		if (Ext.isEmpty(addedShares)) return;
		
		me.setLoading(true);
		
		Bluedolmen.Alfresco.jsonPost({
			
			url : url,
			
			dataObj : {
				nodeRef : me.nodeRef,
				shares : encodeShares(addedShares)
			},
			
			onSuccess : function onSuccess() {
				me.close();
			},
			
			"finally" : function() {
				me.setLoading(false);
			},
			
			scope : this
			
		});	
		
	}
	
});
