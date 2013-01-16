Ext.define('Yamma.view.gridactions.GridAction', {
	
	extend : 'Bluexml.utils.alfresco.grid.GridAction',
	
	requires : [
		'Yamma.utils.datasources.Documents'
	],
	
	uses : [
		'Bluexml.utils.alfresco.grid.GridAction'
	],
	
	mixins : {
		jsonPostAction : 'Bluexml.utils.alfresco.grid.JsonPostAction'	
	},
	
	statics : {
		MANAGER_ICON : Yamma.Constants.getIconDefinition('user_suit')
	},
	
	showBusy : true,
	managerAction : false,
	usurpedManager : null,
	
	getDocumentNodeRefRecordValue : function(record) {
		return record.get(Yamma.utils.datasources.Documents.DOCUMENT_NODEREF_QNAME);	
	},
	
	onSuccess : function() {
		this.mixins.jsonPostAction.onSuccess.call(this);
		this.refreshGrid();
	},
	
	launchAction : function(records, item, e) {
		
		var 
			me = this,
			parentLaunchAction = function() {
				//me.callParent([records]);
				Bluexml.utils.alfresco.grid.GridAction.prototype.launchAction.call(me, records);
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
			     title : 'Services multiples!',
			     msg: "Vous essayer d'effectuer une opération mettant en oeuvre des services multiples. " +
			     	"Ce type d'opération n'est pas supporté pour l'instant. " +
			     	"Veuillez svp sélectionner les éléments correspondants à un unique service.",
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
				title : "En tant que",
			    plain: true,
			    renderTo: Ext.getBody(),
			    items : Ext.Array.map(serviceDescription.serviceManagers, function(serviceManager) {
			    	return ({
			    		text : serviceManager.displayName,
			    		userName : serviceManager.userName,
			    		iconCls : Yamma.view.gridactions.GridAction.MANAGER_ICON.iconCls,
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
				return records.get(Yamma.utils.datasources.Documents.ENCLOSING_SERVICE).name;
			}
			
			if (0 == records.length) return null;
			
			var firstRecordService = records[0].get(Yamma.utils.datasources.Documents.ENCLOSING_SERVICE).name;
			return (
				Ext.Array.every(records, function(record) {
					var enclosingService = record.get(Yamma.utils.datasources.Documents.ENCLOSING_SERVICE).name;
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