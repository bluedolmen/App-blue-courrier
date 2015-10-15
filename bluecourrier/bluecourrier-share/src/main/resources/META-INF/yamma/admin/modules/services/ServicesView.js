Ext.define('Yamma.admin.modules.services.ServicesView', {

	extend : 'Yamma.view.services.ServicesView',
	
	requires : [
		'Ext.util.Point', // missing ExtJS dependency,
		'Bluedolmen.utils.grid.column.Action'
	],
	
	alias : 'widget.servicesadminview',
	
	ISNOT_SIGNABLE_ICON_CLS : Yamma.Constants.getIconDefinition('text_signature').iconCls,
	IS_SIGNABLE_ICON_CLS : Yamma.Constants.getIconDefinition('text_signature_tick').iconCls,
	UNSET_SERVICE_ICON_CLS : Yamma.Constants.getIconDefinition('cross').iconCls,
	ROLE_ICON_CLS : Yamma.Constants.getIconDefinition('group_mail').iconCls,
	IS_SIGNABLE_RECORD_VALUE : 'isSignable',

	viewConfig: {
		
		plugins: {
			ptype: 'treeviewdragdrop',
			containerScroll: true,
			enableDrag : true,
			enableDrop : true,
			appendOnly : true,
			allowContainerDrops : true
		}

	},
	
	getTreeStore : function() {
		
		return Ext.create('Yamma.admin.modules.services.ServicesView.TreeStore');
		
	},
	
	enableSigningServices : "true" == Yamma.config.client['application.enable-signing-feature'],
	
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
						
						if (!me.enableSigningServices) return Ext.baseCSSPrefix + 'hide-display';
						
						var isSignable = record.get(me.IS_SIGNABLE_RECORD_VALUE);
						
						meta.tdAttr = (isSignable ? 'Retirer' : 'Ajouter') + ' la capacité de signature au service';
						return (isSignable ? me.IS_SIGNABLE_ICON_CLS : me.ISNOT_SIGNABLE_ICON_CLS);
					}
					
				},
				{
//					icon: me.UNSET_SERVICE_ICON,
					tooltip : 'Supprimer en tant que service (le site reste présent)',
					handler: function(grid, rowIndex, colIndex, actionItem, event, record, row) {
						var serviceName = record.getId();
						unsetAsService(serviceName);
					},
					
					getClass : function(value, meta, record) {
						
						if (!record.get('name')) return Ext.baseCSSPrefix + 'hide-display';
						return me.UNSET_SERVICE_ICON_CLS;
						
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

Ext.define('Yamma.admin.modules.services.ServicesView.TreeStore', {
	
	extend : 'Yamma.store.services.ServicesTreeStore',
	
	rootVisible : true,
	
	leafConvertFunction : function(value, record) { return false; },
	
//	constructor : function() {
//		
//		var me = this;
//	
//		this.callParent();
//		
//		this.on('append', function( thisNode, newChildNode, index, eOpts ) {  
//            
//            if( newChildNode.isRoot() ) return;
//            if (!newChildNode.get('name')) return;
//            
//            Ext.Array.forEach(this.showRoles, function(role)  {
//	            newChildNode.appendChild({
//	            	text : role.text,
//	            	leaf : true,
//	            	iconCls : me.ROLE_ICON_CLS
//	            });
//            });
//            
//		
//		});
//	},
	
	getFieldsDefinition : function() {
		
		var fieldsDefinition = this.callParent();
		fieldsDefinition.push({
    		name : 'children',
    		convert : function() {
    			return [];
    		}
		});
		
		return fieldsDefinition;
		
	}
	
});
