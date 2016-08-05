Ext.define('Yamma.view.dialogs.OutgoingSigningDialog', {

	extend : 'Ext.window.Window',
	alias : 'widget.outgoingsigningdialog',
	
	requires : [
		'Bluedolmen.store.PersonStore'
	],
	
	iconCls : Yamma.Constants.getIconDefinition('text_signature').iconCls,
	
	title : 'Validation électronique',
	height : 500,
	width : 800,
	modal : true,
	
	layout : 'border',
	
	defaults : {
		height : '100%',
		border : 1,
		flex : 1,
		margin : 5
	},
	
	headerPosition : Yamma.utils.Preferences.getPV(Yamma.utils.Preferences.PREFERED_HEADER_POSITION),
	
	renderTo : Ext.getBody(),
	
	/**
	 * @config
	 */
	nodeRef : null,
	taskRef : null,
	taskName : null,
	
	commentable : true,
	modifiable : false,

	/**
	 * @config
	 */
	validationChain : [],
	
	initComponent : function() {
		
		var me = this;
		
		this.items = this.getItemsDefinition();
		this.dockedItems = this.getDockedItemsDefinition();
		
		this.callParent();
		
		me.on('actorschanged', this._validateOperation);
		me.on('show', this._validateOperation);
		
	},
	
	/**
	 * @protected
	 */
	getItemsDefinition : function() {
		
		var
		
			me = this,
			
			taskRef = me.taskRef,
			taskName = me.taskName,
			
			actorsStore = Ext.create('Ext.data.Store', {
			    storeId:'actorsStore',
			    fields:[
					'id', 
					'title',
					'decision'
				],
			    data:{
			    	'items' : []
			    },
			    proxy: {
			        type: 'memory',
			        reader: {
			            type: 'json',
			            root: 'items'
			        }
			    },
			    firstIndex : 0
	 		}),
	 		
	 		personStore = Ext.create('Bluedolmen.store.PersonStore')
	 		
		;
		
		function loadTaskProperties() {
			
			if (null == taskRef) return;
			
			var url = Bluedolmen.Alfresco.resolveAlfrescoProtocol('alfresco://bluedolmen/yamma/review-outgoing?taskRef={taskRef}')
				.replace(/\{taskRef\}/, taskRef)
			;			
			
			me.setLoading(true);
			
			Bluedolmen.Alfresco.jsonRequest({
				
				url : url,
				
				onSuccess : function onSuccess(jsonResponse) {
					
					var
						tasks = jsonResponse.tasks || [],
						task = tasks[taskRef] || {},
						taskProperties = task.properties || {}
					;
					
					fillValidationChain(taskProperties);
					
				},
				
				"finally" : function() {
					me.setLoading(false);			
				},
				
				scope : me
				
			});
			
			function fillValidationChain(taskProperties) {
				
				var
					validationChain = taskProperties['{http://www.bluedolmen.org/model/bcoutgoingworkflow/1.0}signingChain'] || [],
					validationHistory = taskProperties['{http://www.bluedolmen.org/model/bcoutgoingworkflow/1.0}signingHistory'] || [],
					owner = taskProperties['owner']
				; 
				
				Ext.Array.forEach(validationHistory, function(event) {
					actorsStore.add({
						id : event.id,
						title : event.displayName,
						decision : event.decision
					});
				});
				actorsStore.firstIndex = validationHistory.length;
				
				Ext.Array.forEach(validationChain, function(authority) {
					actorsStore.add({
						id : authority.id,
						title : authority.displayName,
						decision : owner && owner.id == authority.id ? 'Ongoing' : ''
					});
				});
				
			}
			
		}
		
		function isSetAsActor(id) {
			
			return -1 != actorsStore.findExact('id', id);
			
		}
		
	    function addActorChecked(id, title) {
	    	
	    	if (isSetAsActor(id)) return;
	    	
			actorsStore.add({
				id : id,
				title : title
			});
			
			me.fireEvent('actorschanged', id);
	    	
	    }
	    
	    function removeActorChecked(id) {
	    	
	    	var record = id;
	    	
	    	if (Ext.isString(id)) {
		    	if (!isSetAsActor(id)) return;
		    	record = actorsStore.findRecord('id', id);
	    	}
	    	
	    	actorsStore.remove(record);	    		
	    	me.fireEvent('actorschanged', record.getId());
	    	
	    }
	    
	    function isDecisionTaken(record) {
	    	
	    	return !!record.get('decision');
	    	
	    }
	    
		this.actorsGrid = Ext.create('Ext.grid.Panel', {
			
		    header : false,
		    hideHeaders : true,
		    store: actorsStore,
		    flex : 1,
		    border : 0,
		    
		    columns: [
		        { 
		        	text: 'Nom', 
		        	dataIndex: 'title', 
		        	flex: 1,
		        	renderer : function (value, meta, record) {
		        		
	            		var decision = record.get('decision');
	            		
	            		if ('Ongoing' == decision) {
	            			meta.tdCls = 'current-validator'; 
	            		}
		        		
		        		return value;
	            		
		        	}
		        },
		        {
		        	text : 'Actions',
		        	xtype : 'actioncolumn',
		        	width : 60,
		        	items: [
						{
			                tooltip: 'Monter',
			                handler: function(grid, rowIndex, colIndex) {
			                	
			                	var 
			                		store = grid.getStore(),
			                    	record = store.getAt(rowIndex)
			                    ;
			                	if (rowIndex <= store.firstIndex) return;
			                	
			                	store.removeAt(rowIndex);
			                	store.insert(rowIndex - 1, record);
			                    
			                	
			                },
			                hidden : !me.modifiable,
							getClass : function(value, meta, record) {
								
								if (!isDecisionTaken(record)) return Yamma.Constants.getIconDefinition('arrow_up_lightgreen').iconCls;
								else return Ext.baseCSSPrefix + 'hide-display';
								
							}			                			                
			            },
						{
			                tooltip: 'Descendre',
			                handler: function(grid, rowIndex, colIndex) {
			                	
			                	var 
			                		store = grid.getStore(),
			                		totalCount = store.getCount(),
			                    	record = store.getAt(rowIndex)
			                    ;
			                	if (rowIndex >= totalCount - 1) return;
			                	
			                	store.removeAt(rowIndex);
			                	store.insert(rowIndex + 1, record);
			                	
			                },
			                hidden : !me.modifiable,
							getClass : function(value, meta, record) {
								
								if (!isDecisionTaken(record)) return Yamma.Constants.getIconDefinition('arrow_down_lightgreen').iconCls;
								else return Ext.baseCSSPrefix + 'hide-display';
								
							}			                			                
			            },			            
						{
			                tooltip: 'Enlever',
			                handler: function(grid, rowIndex, colIndex) {
			                    var record = grid.getStore().getAt(rowIndex);
			                	removeActorChecked(record);
			                },
			                hidden : !me.modifiable,
							getClass : function(value, meta, record) {
								
								if (!isDecisionTaken(record)) return Yamma.Constants.getIconDefinition('delete').iconCls;
								else return Ext.baseCSSPrefix + 'hide-display';
								
							}			                			                
			            },
			            {
			            	getClass : function(value, meta, record) {
			            		
			            		if (!isDecisionTaken(record)) return Ext.baseCSSPrefix + 'hide-display';
			            		var decision = record.get('decision');
			            		
			            		if ('Reject' == decision) return Yamma.Constants.getIconDefinition('cross').iconCls;
			            		else if ('certification' == decision) return Yamma.Constants.getIconDefinition('rosette').iconCls;
			            		else if ('Next' == decision) return Yamma.Constants.getIconDefinition('accept').iconCls;
			            		else if ('Ongoing' == decision) return Yamma.Constants.getIconDefinition('hourglass').iconCls;
			            		
			            	},
			            	disabled : true
			            }
		        	]
		        	
		        }
		        
		    ]
		
		});
		
		loadTaskProperties();
		
		this.personCombo = Ext.create('Ext.form.field.ComboBox', {
			
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
		    labelStyle : 'background-repeat:no-repeat ; background-position:center; padding: 1px;',
		    
		    hidden : true !== me.modifiable,
		    
		    listConfig: {
				loadingText: 'Recherche...',
				emptyText: 'Aucun utilisateur trouvé.'		
			},
			
			store : personStore,
			
			listeners : {
				
				select : function(combo, records, e) {
					if (records.length == 0) return;
					
					var 
						firstRecord = records[0],
						userName = firstRecord.get('userName'),
						displayName = firstRecord.get('displayName')
					;
					
					combo.clearValue();
					addActorChecked(userName /* id */, displayName /* title */);
					
				}
				
			},
			
			margin : '3px 2px 2px 0'			
		    
		});
		
		this.propertiesForm = Ext.create('Ext.form.FormPanel', {
			flex : 0,
			height : '100px',
			region : 'south',
		    bodyPadding: 10,
		    defaults : {
		        anchor    : '100%',
			    fieldLabel: '&nbsp',
			    labelWidth : 30,
			    labelSeparator : '',
			    labelStyle : 'background-repeat:no-repeat ; background-position:center; padding: 1px;',
		    },
		    items: [
		        {
			        xtype     : 'textareafield',
			        grow      : true,
			        name      : 'comment',
				    labelClsExtra : Yamma.Constants.getIconDefinition('comment_add').iconCls,
				    listeners : {
				    	'change' : function(textarea, newvalue, oldvalue) {
				    		
				    		if (newvalue && oldvalue) return;
				    		me._validateOperation();
				    		
				    	}
				    },
				    hidden : !this.commentable
			    }
		    ]
		});
		
		this.propertiesForm.setVisible(this.commentable);
				
		return [
			{
				xtype : 'panel',
				region : 'center',
				layout : 'vbox',
				plain : true,
			    title: 'Acteurs de la validation',
			    iconCls : Yamma.Constants.getIconDefinition('tick').iconCls,
				defaults : {
					width : '100%',
					margin : 0
				},
				items : [
					this.personCombo,
					this.actorsGrid
				]
			},
			{
				
				xtype : 'signdocumentpanel',
				itemId : 'signature-form',
				title : 'Signature électronique',
				region : 'east',				
				nodeRef : me.nodeRef,
				showPositioning : false,
				hideButtons : true,
				flex : 1,
				border : 1
			},
			this.propertiesForm
		];
		
	},
	
	/**
	 * @protected
	 */
	getDockedItemsDefinition : function() {

		var me = this;
		
		return [{
		    xtype: 'toolbar',
		    dock: 'bottom',		

		    ui: 'footer',
		    defaults: { minWidth: Ext.panel.Panel.minButtonWidth },
		    items: [
		        { xtype: 'component', flex: 1 },
		        { 
		        	xtype: 'button',
		        	itemId : 'accept-button',
		        	text: 'Accepter',
		        	icon : Yamma.Constants.getIconDefinition('accept').icon,
		        	handler : function() {
						this.performOperation('Certify');
		        	},
		        	scope : this
		        },
		        { 
		        	xtype: 'button',
		        	itemId : 'reject-button',
		        	text: 'Refuser',
		        	icon : Yamma.Constants.getIconDefinition('cross').icon,
		        	handler : function() {
		        		this.performOperation('Reject');
		        	},
		        	disabled : true,
		        	scope : this
		        },
		        { 
		        	xtype: 'button', 
		        	itemId : 'cancel-button',
		        	text: 'Annuler',
		        	icon : this.statics().ICON_CANCEL,
		        	handler : function() {
		        		me.close();
		        	}
		        }
		    ]
		}];
		
	},
	
	performOperation : Ext.emptyFn,
	
	getActorsChain : function(includeHistory) {
		
		var actorsStore = this.actorsGrid.getStore();
		if (null == actorsStore) return [];
		
		return Ext.Array.clean(
			Ext.Array.map(actorsStore.getRange(), function(record) {
				if (true !== includeHistory && record.get('decision')) return;
				return record.get('id');
			})
		);
		
	},
	
	getSigningInformation : function() {
		
		var
			signingPanel = this.queryById('signature-form'),
			form
		;
		
		if (null == signingPanel) return {};
		
		form = signingPanel.getForm();
		if (null == form) return {};
		
		return form.getValues();
		
	},
		
	/**
	 * Disable the forward button if the operation is not valid w.r.t. the available data
	 * @private
	 */
	_validateOperation : function(operation) {
		
		var 
			me = this
		;
				
		function canRefuse() {

			// A comment is provided
			return !!me.propertiesForm.getValues()['comment'];

		}
		
		this._setCanRefuse(canRefuse());
		
	},
	
	_setCanRefuse : function(canRefuse) {
		
		if (null == this._rejectButton) {
			this._rejectButton = this.queryById('reject-button');
		}
		
		this._rejectButton.setDisabled(!canRefuse);
		
	}
	
});

