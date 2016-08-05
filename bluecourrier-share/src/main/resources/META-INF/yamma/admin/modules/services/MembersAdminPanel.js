Ext.define('Yamma.admin.modules.services.MembersAdminPanel', {

	extend : 'Ext.panel.Panel',
	alias : 'widget.membersadminpanel',
			
	requires : [
		'Ext.form.field.ComboBox',
		'Yamma.store.Authorities',
		'Yamma.utils.ServicesManager'
	],
	
	statics : {
		
		// TODO: Externalize this into application constants
		SERVICE_ROLES_DEFINITIONS : {
		    "ServiceAssistant" : {
		    	'id' : 'ServiceAssistant',
		    	'label' : 'Assistant',
		    	'iconCls' : Yamma.Constants.getIconDefinition('user_red').iconCls
		    },
		    "ServiceInstructor" : {
		    	'id' : 'ServiceInstructor',
		    	'label' : 'Instructeur',
		    	'iconCls' : Yamma.Constants.getIconDefinition('user_green').iconCls
		    },
		    "ServiceManager" : {
		    	'id' : 'ServiceManager',
		    	'label' : 'Manager',
		    	'iconCls' : Yamma.Constants.getIconDefinition('user_suit').iconCls
		    },
		    "ServiceSupervisor" : {
		    	'id' : 'ServiceSupervisor',
		    	'label' : 'Superviseur',
		    	'iconCls' : Yamma.Constants.getIconDefinition('user_suit').iconCls
		    }
			
		}
		
	},
	
	title : 'Administration des membres de services',
	iconCls : Yamma.Constants.getIconDefinition('group').iconCls,	
	
	layout : 'border',
	
	groupName : null,
	
	initComponent : function() {
		
		var 
			me = this,
		
			authoritiesCombo = Ext.create('Ext.form.field.ComboBox', {
				
				DATASOURCE_URL : 'alfresco://bluedolmen/yamma/authorities',
				
				minChars : 3,
			    fieldLabel: 'Membres',
			    labelWidth : 50,
			    queryMode: 'remote',
			    queryParam: 'filter',
			    displayField : 'displayName',
			    valueField: 'shortName',
			    hideTrigger : true,
			    width : 300,
			    grow : true,
			    tpl: Ext.create('Ext.XTemplate',
		            '<tpl for=".">',
		                '<div class="x-boundlist-item"><div class="icon-and-label {iconCls}">{displayName}</div></div>',
		            '</tpl>'
		        ),
		        
			    listConfig: {
					loadingText: 'Recherche...',
					emptyText: 'Aucune autorité trouvée.'		
				},
				
				store : Ext.create('Yamma.store.Authorities'),
				
				listeners : {
					
					select : function(combo, records, e) {
						
						if (records.length == 0) return;
						
						var 
							firstRecord = records[0],
							shortName = firstRecord.get('shortName')
						;
						
						combo.clearValue();
						me.addMember(shortName, firstRecord);
						
					}
					
				},
				
				disabled : true
			    
			}),
			
			SERVICE_ROLES_DEFINITIONS = this.statics().SERVICE_ROLES_DEFINITIONS,
			
			serviceRoleStore = Ext.create('Ext.data.JsonStore', {
				
				fields : ['id','label','iconCls'],
				
				data : {
					roles : [
					    SERVICE_ROLES_DEFINITIONS['ServiceAssistant'],
					    SERVICE_ROLES_DEFINITIONS['ServiceInstructor'],
					    SERVICE_ROLES_DEFINITIONS['ServiceManager'],
					    SERVICE_ROLES_DEFINITIONS['ServiceSupervisor']
					]
				},
				
				proxy : {
			        type: 'memory',
			        reader: {
			            type: 'json',
			            root: 'roles'
			        }					
				}
				
			}),
			
			serviceRoleGrid = Ext.create('Ext.grid.Panel', {
				
				region : 'west',
				width : 100,
				store : serviceRoleStore,
				hideHeaders : true,
				split : true,
				padding : '5 0 0 0',
				
				columns : [
				   {
					   xtype : 'templatecolumn',
					   text : 'Role',
					   dataIndex : 'label',
					   flex : 1,
					   tpl : new Ext.XTemplate('<div class="icon-and-label {iconCls}">{label}</div>') 
				   }
				],
				
				listeners : {
					
					'selectionchange' : function(panel, selected) {
						
						var 
							firstSelected = (selected || [])[0] || null,
							role = firstSelected ? firstSelected.get('id') : null
						;
						me.onRoleFilter(role);
						
					},
					scope : me
					
				}
				
			}),
			
			membersStore = Ext.create('Ext.data.Store', {
				
			     fields : ['authorityType', 'displayName', 'fullName', 'shortName', 'zones'],
			     proxy: {
			         type: 'ajax',
			         url: 'alfresco://api/groups/{groupName}/children',
			         getUrl: function(request) {
			        	 
			        	 var 
			        	 	url = Bluedolmen.Alfresco.resolveAlfrescoProtocol(request.proxy.url),
			        	 	groupName = me.groupName + (me.roleName ? '_' + me.roleName : '')
			        	 ;
			        	 return url.replace(/\{groupName\}/, groupName);
			        	 
			         },
			         reader: {
			             type: 'json',
			             root: 'data'
			         }
			     },
			     autoLoad: false
			     
			}),
			
			membersGrid = Ext.create('Yamma.view.admin.modules.Services.MembersAdminGrid', {
				store : membersStore,
				region : 'center',
				padding : '5 0 0 0'
			})
		;
	
		this.authoritiesCombo = authoritiesCombo;
		this.membersGrid = membersGrid;
		
		this.tbar = [
			'->',
			authoritiesCombo
		];		
		
		this.items = [
		    serviceRoleGrid,
			membersGrid
		];
		
		this.callParent();
		
	},	
	
	refreshView : function() {
		
		var me = this;
		setMemberComboDisabled(!(me.groupName && me.roleName));
		
		this.membersGrid.refreshView();
		
		function setMemberComboDisabled(disabled) {
			me.authoritiesCombo.setDisabled(disabled);
		}
		
	},
	
	updateMembers : function(groupName) {
		
		this.groupName = groupName;
		this.refreshView();
		
	},
	
	onRoleFilter : function(roleName) {
		
		this.roleName = roleName;
		this.refreshView();
		
	},
	
	addMember : function(shortName, record) {
		
		//POST
		var 
			me = this,
			url = 'alfresco://yamma/groups/{groupName}/children/{member}',
			groupName = me.groupName + (me.roleName ? '_' + me.roleName : ''),
			member = record.get('fullName') || shortName
		;
		
		url = Bluedolmen.Alfresco.resolveAlfrescoProtocol(url)
			.replace(/\{groupName\}/, groupName)
			.replace(/\{member\}/, member)
		;
		
		Bluedolmen.Alfresco.jsonRequest(
			{
				method : 'POST',
				url : url,
				onSuccess : function() {
					Ext.Function.defer(me.refreshView, 10, me);
				}
			}
		);
		
	}	
	
});

Ext.define('Yamma.view.admin.modules.Services.MembersAdminGrid', {
	
	extend : 'Ext.grid.Panel',
	
	title : false,

	editable : true,
	
	initComponent : function() {
		
		this.columns = this.getColumns();
		this.store = this.getStore();
		
		this.callParent();
		
	},
	
	hideHeaders : true,
	
	getColumns : function() {
		
		var
			me = this,
			memberTpl = new Ext.XTemplate('<div class="icon-and-label {iconCls}">{label}</div>'),
			columns = [{
				text: 'Name',
				flex: 1,
				sortable: true,
				dataIndex: 'displayName',
		    	renderer : function (value, meta, record) {
		    		
		    		var
		    			authorityType = record.get('authorityType'),
		    			shortName = record.get('shortName'),
		    			label = value,
		    			iconCls,
		    			matching, serviceName, serviceRole, serviceRoleDefinition
		    		;
		    		
		    		if ('USER' == authorityType) {
		    			value = value + '(' + shortName + ')';
		    			iconCls = Yamma.Constants.getIconDefinition('user').iconCls;
		    		}
		    		else if ('GROUP' == authorityType) {
		    			
		    			// Check whether it is a service group to have a more user-friendly display
		    			matching = shortName.match(/site_(\w+)_(\w+)/);
		    			if (matching) {
		    				serviceName = matching[1];
		    				serviceRole = matching[2];
		    				
		    				serviceRoleDefinition = Yamma.admin.modules.services.MembersAdminPanel.SERVICE_ROLES_DEFINITIONS[serviceRole];
		    				if (serviceRoleDefinition) {
		    					label = serviceRoleDefinition.label + ' du service ' + Yamma.utils.ServicesManager.getDisplayName(serviceName); 
		    					iconCls = serviceRoleDefinition.iconCls;
		    				}
		    			}
		    			
		    		}
		    		
		    		if (label) {
		    			return memberTpl.applyTemplate({
		    				label : label,
		    				iconCls : iconCls
		    			});
		    		}
		    		
		    		return value;
		    		
		    	}

			}]
		;
		
		if (!this.editable) return columns;
		
		function can(record, operation) {

			return true;
			
		}
		
		function canEdit(record) {
			return can(record, 'edit');
		}
		
		function canDelete(record) {
			return can(record, 'delete');
		}
		
		columns.push({
			
			text: 'Action',
			width : 30,
			xtype: 'alfrescoactioncolumn',
			
			items : [
				{
					icon: Yamma.Constants.getIconDefinition('delete').icon,
					
					handler: function(grid, rowIndex, colIndex, actionItem, event, record, row) {
						
						me._removeAuthority(record);

					},
					
					getClass : function(value, meta, record) {
						
						return canDelete(record) ? '' : Ext.baseCSSPrefix + 'hide-display';

					}
					
				}
				
			]			
		
		});
		
		return columns;
		
	},
	
	_removeAuthority : function(record, skipConfirmation) {
		
		var 
			me = this,
			shortName = record.get('shortName'),
			authorityType = record.get('authorityType')
		;
		
		if (!shortName) return;
		
		if (true === skipConfirmation) {
			removeMember();
			return;
		}
		
		Bluedolmen.windows.ConfirmDialog.INSTANCE.askConfirmation(
			'Supprimer le membre ?', /* title */
			'Etes-vous certain de vouloir supprimer le membre du groupe ?', /* message */
			removeMember /* onConfirmation */
		);
		
		function removeMember() {
			
			var 
				store = me.getStore(),
				operation = new Ext.data.Operation(store.lastOptions),
				request = store.proxy.buildRequest(operation),
				url = store.proxy.getUrl(request)
 			;
			
			url = url.replace(/\/api\//,'/yamma/'); // get the admin-authenticated Bluedolmen equivalent
			url = url + '/' + ('GROUP' == authorityType ? 'GROUP_' : '') + shortName; // uses fullName here for groups
			
			Bluedolmen.Alfresco.jsonRequest(
				{
					method : 'DELETE',
					url : url,
					onSuccess : function() {
						Ext.Function.defer(me.refreshView, 10, me);
					}
				}
			);
			
		}
		
	},
	
	refreshView : function() {
		
		this.getStore().reload();
		
	},
	
	getStore : function() {
		
		return this.store;
		
	}
	
});
