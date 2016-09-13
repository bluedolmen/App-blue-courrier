Ext.define('Yamma.view.dialogs.AssignmentDialog', {

	extend : 'Ext.window.Window',
	alias : 'widget.assignmentdialog',
	
	requires : [
		'Bluedolmen.model.Person'
	],
	
	statics : {
		ICON : Yamma.Constants.getIconDefinition('user_go_ul').icon,
		ICON_CANCEL : Yamma.Constants.getIconDefinition('cancel').icon,
		PEOPLE_GET : 'alfresco://bluedolmen/yamma/datasource/ServicePeople/data'
	},
	
	title : i18n.t('view.dialog.assignmentdialog.title'),
	height : 500,
	width : 400,
	modal : true,
	serviceName : null,
	serviceDisplayName : null,
	
	layout : 'vbox',
	
	defaults : {
		margin : 10,
		flex : 1,		
		width : '100%',
		border : 1
	},
	
	headerPosition : Yamma.utils.Preferences.getPV(Yamma.utils.Preferences.PREFERED_HEADER_POSITION),
	
	renderTo : Ext.getBody(),
	
	initialService : null,
	
	initComponent : function() {
		
		var
		
			me = this,
		
			servicePeopleStore = Ext.create('Ext.data.Store', {
			    storeId:'servicePeopleStore',
			    model : 'Bluedolmen.model.Person',
			    data:{'items':[]},
			    proxy: {
			        type: 'ajax',
			        url: Bluedolmen.Alfresco.resolveAlfrescoProtocol(Yamma.view.dialogs.AssignmentDialog.PEOPLE_GET),
			        reader: {
			            type: 'json',
			            root: 'items'
			        },
			        extraParams : {
			        	'@service' : this.serviceName
			        }
			    }
			})
		;		
		
		servicePeopleStore.load();
		
		this.instructorsGrid = Ext.create('Ext.grid.Panel', {
			
			icon : Yamma.Constants.getIconDefinition('group_mail').icon,
		    title: this.serviceDisplayName ? 'Service ' + this.serviceDisplayName : '',
		    hideHeaders : !this.serviceDisplayName,
		    
		    store: servicePeopleStore,
		    columns: [
		        { 
		        	text: i18n.t('view.dialog.assignmentdialog.columns.displayName'),
		        	dataIndex: 'displayName', 
		        	flex: 1 
		        }
		    ],
		    
			viewConfig : {
				listeners : {
					'itemdblclick' : function(table, record, item) {
						me.assign(record);						
					}
				}
			},
			
			listeners : {
				'selectionchange' : function(table, record, index) {
					me._validateOperation();
				}				
			},
			
			dockedItems : [{
				
			    xtype: 'toolbar',
			    dock: 'top',
			    defaults: { 
			    	minWidth: Ext.panel.Panel.minButtonWidth 
			    },
			    items: [
					'->',
					{
						xtype : 'textfield',
						listeners : {
							'change' : onFilterChange
						}
					}
			    ]
				
			}]
		});
		
		function onFilterChange(textfield, newValue, oldValue) {
			
			newValue = newValue.toLowerCase();
			
			servicePeopleStore.clearFilter(true);
			servicePeopleStore.filter([
				Ext.create('Ext.util.Filter', {
					filterFn: function(item) { 
						return (item.get("displayName") || '').indexOf(newValue) != -1;
					}
				})
			]);
			
		}
				
		this.items = [
			this.instructorsGrid
		];
		
		
		this.dockedItems = [{
		    xtype: 'toolbar',
		    dock: 'bottom',
		    ui: 'footer',
		    defaults: { 
		    	minWidth: Ext.panel.Panel.minButtonWidth 
		    },
		    items: [
		        { xtype: 'component', flex: 1 },
		        { 
		        	xtype: 'button',
		        	itemId : 'assign-button',
		        	text: i18n.t('view.dialog.assignmentdialog.dockedItems.buttons.assign-button'),
		        	icon : Yamma.view.dialogs.AssignmentDialog.ICON,
		        	handler : function() {
		        		var assigned = me.getAssigned();
						me.assign(assigned);
		        	}
		        },
		        { 
		        	xtype: 'button', 
		        	itemId : 'cancel-button',
		        	text: i18n.t('view.dialog.assignmentdialog.dockedItems.buttons.cancel-button'),
		        	icon : Yamma.view.dialogs.AssignmentDialog.ICON_CANCEL,
		        	handler : function() {
		        		me.close();
		        	}
		        }
		    ]
		}];
		
		if (this.serviceRole) {
			this.title = this.title + ' en ' + Yamma.utils.DeliveryUtils.ROLE_TITLE[this.serviceRole];
		}
		
		this.callParent();
		
	},
	
	getAssigned : function() {
		
		var 
			instructorGrid  = this.instructorsGrid,
			selectionModel = instructorGrid.getSelectionModel(),
			selectedRows = selectionModel.getSelection()
		;
		
		if (null == selectedRows || Ext.isEmpty(selectedRows)) return null;
		
		return selectedRows[0];
		
	},
	
	assign : Ext.emptyFn,
	
	show: function() {
				
		this._validateOperation();
		this.callParent();
		
	},
	
	/**
	 * @private
	 */
	_validateOperation : function(operation) {
		
		var 
			me = this
		;
				
		function isValid() {	
			
			var 
				assigned = me.getAssigned()
			;
			if (assigned == null) return false;
			
			return true;
			
		}
		
		this._setCanAssign(isValid());
	},
	
	_setCanAssign : function(canAssign) {
		var assignButton = this.queryById('assign-button');
		assignButton.setDisabled(!canAssign);
	}
	
});