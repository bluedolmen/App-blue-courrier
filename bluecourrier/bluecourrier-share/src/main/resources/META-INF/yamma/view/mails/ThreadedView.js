Ext.define('Yamma.view.mails.ThreadedView', {
	
	extend : 'Yamma.utils.grid.StoreTreePanel',
	alias : 'widget.threadedview',
	
	requires : [
		'Ext.grid.column.Template'
	],
	
	mixins : {
		deferredloading : 'Yamma.view.edit.DeferredLoading',
		mailcolumndefinitions : 'Yamma.view.mails.MailColumnDefinitions'		
	},
	
	title : 'Fil discussion',
	iconCls : 'icon-chart_organisation',
	
	storeId : 'MailThread',
	hasPaging : false,
		
	config : {
		documentNodeRef : null
	},
	
  	itemactions : [
 		'Yamma.view.mails.itemactions.ShowDetailsWindowAction',
 		'Yamma.view.mails.itemactions.DownloadFileAction',
 		'Yamma.view.mails.itemactions.GoToShareAction',
		'Yamma.view.mails.itemactions.StartFollowingAction',
		'Yamma.view.mails.itemactions.StopFollowingAction',
		'Yamma.view.mails.itemactions.ShareDocumentAction' 		
 	],
   	
  	maxAvailableActions : 3,
   	
//	listeners : {
//		
//		viewready : function(table) {
//			
//			var documentNodeRef = this.getDocumentNodeRef();
//			if (!documentNodeRef) return;
//			
//			var record = this.findRecord(documentNodeRef);
//			if (!record) return;
//			
//			var selectionModel = this.getSelectionModel();
//			selectionModel.select(record);
//			
//		}
//	
//	},
	
	initComponent : function() {

		var me = this;
		
		this.on('storeloaded', function(store, records) {
			
			var nodeRef = me.getDocumentNodeRef();
			if (!nodeRef) return;
			
			var record = store.getById(nodeRef);
			if (!record) return;
			
			var selectionModel = me.getSelectionModel();
			if (!selectionModel) return;
			
			selectionModel.select([record], false /* keepExisting */, true /* suppressEvent */);
			
		});
		
		this.callParent();
	},
	
	loadInternal : function(record) {
		
		var nodeRef = record.get('nodeRef');
		if (null == nodeRef) return;
		
		this.loadThread(nodeRef);
		
	},	
	
	loadThread : function(nodeRef) {
		
		if (!nodeRef || !Ext.isString(nodeRef)) {
			Ext.Error.raise('IllegalArgumentException! The provided document nodeRef is not valid');
		}
		
		this.setDocumentNodeRef(nodeRef);		
		
		this.load({
			filters : [
				{
					property : 'nodeRef',
					value : nodeRef
				}
			]
		});
		
	},
	
 	getDerivedFields : function() {
 		
 		var me = this;
 		
 		return [
 		        
//	        {
//	        	name : 'children',
//	        	mapping : 'children',
//	        	convert : function(value, record) {
//	        		var children = record.get('children');
//	        		return children;
//	        	}
//	        },
// 		
	    	{
	    		name : 'expanded',
	    		type : 'boolean',
//	 			convert : function(value, record) {
//	 				
//	 				if (record.isRoot()) return true;
//	 				return value;
//	 				
//	 			},
	    		defaultValue : true
	    	},
	    	
	    	{
	    		name : 'expandable',
	    		type : 'boolean',
	    		convert : function(valud, record) {
	    			return !record.isRoot();
	    		},
	    		defaultValue : false
	    	},
	        
	 		{ 
	 			name : 'leaf',
	 			type : 'boolean',
	 			mapping : 'children', 
	 			convert : function(value, record) {
	 				
	 				var children = record.get('children');
	 				return Ext.isEmpty(children);
	 				
	 			},
	 			defaultValue : true
	 		},
	 		
	 		{
	 			name : 'iconCls',
	 			convert : function(value, record) {
	 				
					var 
						typeDefinition =
							me.getKindDefinition(record) ||
							me.getMimeTypeDefinition(record) ||
							Yamma.Constants.UNKNOWN_TYPE_DEFINITION
					;					
	 				
					return typeDefinition.iconCls;
	 				
	 			}
	 		}
 		
 		];
 		
 	},
 	
// 	load : function() {
//		this.getStore().removeAll();
// 		this.callParent();
// 	},
	
	getColumns : function() {
		
		var subjectColumnDefinition = this.getSubjectColumnDefinition();
		subjectColumnDefinition.xtype = 'treecolumn';
		
		return [
			
			subjectColumnDefinition,
		
			this.getDatesColumnDefinition()
			
//			this.getActionsColumnDefinition()				
		
		];
		
	},
	
	SUBJECT_TEMPLATE : new Ext.XTemplate(
		'<span class="document-subject">',
//		'<div class="{nameClass}">{name}</div>',
		'<span class="{objectClass}">{object}</span>',
		'</span>'
	)		
	

});