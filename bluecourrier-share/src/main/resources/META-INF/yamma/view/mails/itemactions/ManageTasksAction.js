Ext.define('Yamma.view.mails.itemactions.ManageTasksAction', {
	
	extend : 'Bluedolmen.utils.alfresco.grid.ContextMenuAction',
	
	uses : [
		'Yamma.view.windows.AssignToWindow'
	],
	
	text : 'Gérer les tâches',
	
	iconCls : Yamma.Constants.getIconDefinition('cog').iconCls,
	
	url : 'alfresco://bluedolmen/workflows/tasks',
		
	initComponent : function() {
		
		this.on('activate', this.loadTasks, this);
		this.callParent();
		
	},
	
	grid : null,
	
	init : function(grid) {
		// we need to get the calling grid to refresh the view once the operation is performed
		this.grid = grid;
	},
	
	menu : [],
	
	loadTasks : function(item) {
		
		if (null == this.record) return;
		
		var 
			me = this,
			nodeRef = this.record.get(Yamma.utils.datasources.Documents.DOCUMENT_NODEREF_QNAME),
			url = Bluedolmen.Alfresco.resolveAlfrescoProtocol(this.url),
			store = Ext.create('Ext.data.Store', {
				fields : [
		          'id',
		          'name',
		          'description',
		          'properties'
				],
		        proxy: {
		            type: 'ajax',
		            url : url,
		            reader: {
		                type: 'json',
		                root: 'tasks'
		            }
		        }
			})
		;
		
		store.load({
			callback : onLoad,
			params : {
				nodeRef : nodeRef
			}
		});
		
		function onLoad(records, operation, success) {
			
			if (!success) return;
			
			var items = Ext.Array.map(records, renderMenuItem);
			
			me.setMenu({
				items : items
			});
			
		}
		
		function renderMenuItem(record) {
			
			var 
				taskId = record.get('id'),
				taskName = record.get('name'),
				def = (
					Yamma.Constants.WORKFLOW_TASK_DEFINITIONS[taskName] 
					|| Yamma.Constants.WORKFLOW_TASK_DEFINITIONS['default']
				)
			;
			
			return ({
				taskId : taskId,
				text : Ext.isFunction(def.renderTitle) ? def.renderTitle(record) : def.title,
				iconCls : Ext.isFunction(def.renderIconCls) ? def.renderIconCls(record) : def.iconCls,
				handler : Ext.bind(execute, me, [record])
			});
			
		}
		
		function execute(record) {
			
			var
				taskId = record.getId(),
				assignToWindow = Ext.create('Yamma.view.windows.AssignToWindow', {
					taskId : taskId,
					nodeRef : nodeRef,
					onSuccess : onSuccess
				})
			;
			
			assignToWindow.show();
			
			function onSuccess() {
				assignToWindow.close();
				me.grid.refresh();
			}
			
		}
		
	},
	
	isAvailable : function(record) {
		
		var hasWorkflows = record.get('hasworkflows');
		return hasWorkflows;
		
	}
	
});