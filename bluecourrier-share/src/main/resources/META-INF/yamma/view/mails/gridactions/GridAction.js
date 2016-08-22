Ext.define('Yamma.view.mails.gridactions.GridAction', {
	
	extend : 'Bluedolmen.utils.alfresco.grid.GridAction',
	
	requires : [
		'Yamma.utils.datasources.Documents'
	],
	
	uses : [
		'Bluedolmen.utils.alfresco.grid.GridAction'
	],
	
	mixins : {
		jsonRequestAction : 'Bluedolmen.utils.alfresco.grid.JsonRequestAction'	
	},
	
	statics : {
		MANAGER_ICON : Yamma.Constants.getIconDefinition('user_suit')
	},
	
	method : 'POST', // Default method for actions is POST
	showBusy : true,
	managerAction : false,
	usurpedManager : null,
	
	discardRefreshOnSuccess : false,
	
	constructor : function() {
		
		this.callParent();
		this.on('actionComplete', this.onActionComplete, this);
		
	},
		
	getDocumentNodeRefRecordValue : function(record) {
		return record.get(Yamma.utils.datasources.Documents.DOCUMENT_NODEREF_QNAME);	
	},
	
	onActionComplete : function(status, action, grid) {
		
		if ('success' == status && this.discardRefreshOnSuccess !== true) {
			this.refreshGrid();			
		}
		
	},
	
	onSuccess : function() {
		this.mixins.jsonRequestAction.onSuccess.call(this);
	},
	
	launchAction : function(records, item, e) {
		
		var 
			me = this,
			parentLaunchAction = function() {
				//me.callParent([records]);
				Bluedolmen.utils.alfresco.grid.GridAction.prototype.launchAction.call(me, records);
			}
		;
		
		this.usurpedManager = null; // reset if necessary

		if (true !== this.managerAction) {
			parentLaunchAction();
			return;
		}
		
		var commonServiceName = getCommonService(records);
		if (!commonServiceName) {
			
			Ext.Msg.show({
			     title : i18n.t('view.mails.gridactions.gridaction.commonservicename.msg.title'),
			     msg: i18n.t('view.mails.gridactions.gridaction.commonservicename.msg.content'),
			     buttons: Ext.Msg.OK,
			     icon: Ext.Msg.WARNING
			});
			
			return;
		}
		
		Yamma.utils.Services.getDescription(commonServiceName, onServiceDescriptionAvailable);
			

		
		function onServiceDescriptionAvailable(serviceDescription) {
			
			if (serviceDescription.roles.isManager) {
				parentLaunchAction(); // a service manager is allowed to perform the operation
				return;
			}
			
			var managerMenu = Ext.create('Ext.menu.Menu', {
				title : i18n.t('view.mails.gridactions.gridaction.menu.manager.title'),
			    plain: true,
			    renderTo: Ext.getBody(),
			    items : Ext.Array.map(serviceDescription.serviceManagers, function(serviceManager) {
			    	return ({
			    		text : serviceManager.displayName,
			    		userName : serviceManager.userName,
			    		iconCls : Yamma.view.mails.gridactions.GridAction.MANAGER_ICON.iconCls,
			    		listeners : {
			    			click : function(item) {
			    				me.usurpedManager = item.userName;
			    				parentLaunchAction();
			    			}
			    		}
			    	});
			    })
			});
			
			if ('menuitem' == item.xtype) {
				item.menu = managerMenu;
				item.expandMenu(0);
				//managerMenu.showBy(item);
				//item.menu = managerMenu;
			} else {
				managerMenu.showAt(e.getXY());
			}
		}
	
		
		function getCommonService() {
			
			if (!Ext.isIterable(records)) {
				return records.get(Yamma.utils.datasources.Documents.ENCLOSING_SERVICE);
			}
			
			if (0 == records.length) return null;
			
			var firstRecordService = records[0].get(Yamma.utils.datasources.Documents.ENCLOSING_SERVICE);
			return (
				Ext.Array.every(records, function(record) {
					var enclosingService = record.get(Yamma.utils.datasources.Documents.ENCLOSING_SERVICE);
					return (firstRecordService == enclosingService);
				}) 
				? firstRecordService 
				: null
			);
			
		}
		
	},
	
	onPreparationReady : function(records, preparationContext) {
	
		preparationContext = preparationContext || {};
		if (Ext.isObject(preparationContext) && this.usurpedManager) {
			preparationContext.usurpedManager = this.usurpedManager;
		}

		this.callParent(arguments);
		
	}
	
	
});