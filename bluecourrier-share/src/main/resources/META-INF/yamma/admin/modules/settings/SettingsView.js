Ext.define('Yamma.admin.modules.settings.SettingsView', {
	
	extend : 'Yamma.view.services.ServicesView',
	
	requires : [
		'Bluedolmen.utils.grid.column.Action'
	],
	
	alias : 'widget.settingsadminview',
	
	viewConfig: {
		
//		plugins: {
//			ptype: 'treeviewdragdrop',
//			containerScroll: true,
//			enableDrag : true,
//			enableDrop : true,
//			appendOnly : true,
//			allowContainerDrops : true
//		}

	},
	
	getTreeStore : function() {
		
		return Ext.create('Yamma.admin.modules.settings.SettingsView.TreeStore');
		
	},
	
	getColumns : function() {
		
		var
			me = this,
			columns = this.callParent()
		;
		
		columns.push({
			text: 'Action',
			width : 100,
			xtype: 'alfrescoactioncolumn',
			
			items : [
				{
					icon: Yamma.Constants.getIconDefinition('text_signature').icon,
					
					handler: function(grid, rowIndex, colIndex, actionItem, event, record, row) {
						var 
							serviceName = record.getId(),
							isSignable = record.get(me.IS_SIGNABLE_RECORD_VALUE)
						;
						
						setSignableService(serviceName, !isSignable);
					},
					
					getClass : function(value, meta, record) {
						var 
							isSignable = record.get(me.IS_SIGNABLE_RECORD_VALUE)
						;
						
						meta.tdAttr = (isSignable ? 'Retirer' : 'Ajouter') + ' la capacité de signature au service';
						return (isSignable ? me.IS_SIGNABLE_ICON_CLS : me.ISNOT_SIGNABLE_ICON_CLS);
					}
					
				},
				{
					icon: me.UNSET_SERVICE_ICON,
					tooltip : 'Supprimer en tant que service (le site reste présent)',
					handler: function(grid, rowIndex, colIndex, actionItem, event, record, row) {
						var serviceName = record.getId();
						unsetAsService(serviceName);
					}
				}
			]
		});
		
		function setSignableService(serviceName, canSign) {
			
	    	Yamma.admin.modules.services.SitesAdminUtils.setAsService(
	    		serviceName,
	    		{
	    			serviceCanSign : canSign
	    		}, /* serviceDefinition */
	    		{
	    			loadingMask : me.loadingMask,
		    		onSuccess : function() {
		    			me.refreshView();
		    		}
		    	} /* config */
		    );
			
		}
		
		
		function unsetAsService(serviceName) {
			
	    	Yamma.admin.modules.services.SitesAdminUtils.unsetAsService(
	    		serviceName,
	    		{
	    			loadingMask : me.loadingMask,
		    		onSuccess : function() {
		    			me.refreshView();
		    		}
		    	} /* config */
		    );
			
		}
		
		return columns;
	},
	
	refreshView : function() {
		var store = this.getStore();
		store.load();
	},
	
	initComponent : function() {
		
		var me = this;
		
		this.loadingMask = new Ext.LoadMask(this, {msg:"Application des changements en cours..."});
		
		this.callParent(arguments);
		
		this.getView().on({
			drop : function(node, data, overModel, dropPosition, eOpts) {
				
				var parentId = overModel.getId();
				Ext.Array.forEach(data.records, function(record) {
					var childId = record.getId();
					setNewParent(childId, parentId);
				});
				
			}
		});
		
		function setNewParent(childId, parentId) {
			
			me.loadingMask.show();
	    	Yamma.admin.modules.services.SitesAdminUtils.setAsService(
	    		childId,
	    		{
	    			parentServiceName : parentId
	    		} /* serviceDefinition */,
	    		{
	    			loadingMask : me.loadingMask,
		    		onSuccess : function() {
		    			me.refreshView();
		    		}
		    	} /* config */
		    );
			
		}
		
	}
	
});


Ext.define('Yamma.admin.modules.settings.SettingsView.TreeStore', {
	
	extend : 'Ext.data.TreeStore',
	
	showMembership : false,
	
	groupIconCls : Yamma.Constants.getIconDefinition('group').iconCls,
	groupExpanded : true,
	expandable : true,
	
	remoteSort : false,
	sorters : [
		{
			property : 'text'
		}
	],
	
	constructor : function(config) {
		
		Ext.apply(this, config || {});
		
		this.fields = this.getFieldsDefinition();
		this.proxy = this.getProxyDefinition();
		
		return this.callParent(arguments);
		
	},	

	getFieldsDefinition : function() {
		
		var fieldsDefinition = [
			{ name : 'id', type : 'string', mapping : 'name'},
			{ name : 'name', type : 'string'},
	    	{ 
				name : 'text', 
				type : 'string', 
				mapping : 'title',
				convert : function(value, record) {
					// This could be mapped to the ServiceManager
					if ('root' == record.getId()) return 'Tous';
					return value;
				}
			},
	    	{
	    		name : 'leaf',
	    		type : 'boolean',
	    		mapping : 'hasChildren',
	    		convert: this.leafConvertFunction
	    	},
	    	{
	    		name : 'iconCls',
	    		type : 'string',
	    		defaultValue : this.groupIconCls
	    	},
	    	{
	    		name : 'expandable',
	    		type : 'boolean',
	    		defaultValue : this.expandable
	    	},
	    	{
	    		name : 'expanded',
	    		type : 'boolean',
	    		defaultValue : this.groupExpanded
	    	},
	    	{
	    		name : 'disabled',
	    		type : 'boolean',
//	    		defaultValue : false,
	    		convert : this.disabledConvertFunction
	    	},
	    	{
	    		name : 'isSignable',
	    		type : 'boolean'
	    	},
	    	{
	    		name : 'inboxTray',
	    		type : 'string'
	    	}
	    ];
		
		if (true === this.showMembership) {
			fieldsDefinition.push('membership');
		}
		
		return fieldsDefinition;
	    
	},
	
	leafConvertFunction : function(value, record) {
		return !value;		
	},
	
	disabledConvertFunction : Ext.emptyFn,
	
	getProxyDefinition : function() {
		
	    return Ext.create('Yamma.store.services.ServicesTreeStoreProxy' , {
	    	
	    	showMembership : this.showMembership,
	    	
	        reader: {
	            type: 'json',
	            root: 'children'
	        }
	        
	    });
    
	}
	
});
