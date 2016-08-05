Ext.define('Yamma.view.mails.gridactions.AddReply', {

	extend : 'Yamma.view.mails.gridactions.SimpleTaskRefGridAction',
	
	uses : [
		'Yamma.utils.ReplyUtils'
	],
	
	icon : Yamma.Constants.getIconDefinition('email_go_add').icon,
	tooltip : 'Ajouter un fichier réponse',
	taskName : 'bcinwf:processingTask',
	actionName : 'Add Reply',
//	availableIfOwner : true,
	
	status : 'In Progress',

	supportBatchedNodes : false,
	
	discardRefreshOnSuccess : true, // signal an operation instead	
	
	getParameters : function(record) {
		var 
			taskRef = this.callParent(arguments),
			documentNodeRef = this.getDocumentNodeRefRecordValue(record)
		;
		
		return [taskRef, documentNodeRef];
	},
	
	launchAction : function(record, item, e) {
		
		this.contextMenuEvent = e;
		this.callParent(arguments);
		
	},
	
	isAvailable : function(record, context) {
		
		if (!this.callParent(arguments)) return false;
		
		var task = this.getFirstMatchingTask(record);
		if (null == task) return null;
		
		var
			taskProperties = task.properties,
			processKind = taskProperties[Yamma.utils.DeliveryUtils.PROP_PROCESS_KIND],
			serviceRole = taskProperties[Yamma.utils.DeliveryUtils.PROP_SERVICE_ROLE]
		;
		
		return Yamma.utils.DeliveryUtils.getDefaultProcessId() == processKind && 'procg' == serviceRole;
		
	},
	
	performAction : function(taskRef, documentNodeRef, preparationContext) {
		
		var 
			me = this,
			fileSelectionMenu = Yamma.utils.ReplyUtils.getFileSelectionReplyMenu(onItemClick)
		;
		
		fileSelectionMenu.showAt(this.contextMenuEvent.getXY());
		
					
		function onItemClick(menu, item, e) {
			
			if (!item) return;
			
			var action = item.action;
			Yamma.utils.ReplyUtils.replyFromItemAction(action, {
				taskRef : taskRef,
				documentNodeRef : documentNodeRef,
				onSuccess : onSuccess
			});
			
		}
		
		function onSuccess() {
			
			var grid = me.grid;		
			if (!grid) return;

			grid.fireEvent('operation', 'update', documentNodeRef);
			// TODO: Should also raise a create-operation event for the reply (but not necessary yet)
			me.fireEvent('actionComplete', 'success', arguments);
			
		}

	}
	
});