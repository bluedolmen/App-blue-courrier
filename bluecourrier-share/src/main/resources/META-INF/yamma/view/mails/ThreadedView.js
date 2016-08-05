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
	cls : 'threaded-view',
	
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
 		
 		var 
 			me = this,
 			documentTypeActionDefinition = this.getDocumentTypeActionDefinition()
 		;
 		
 		return [
 		    /*
 		     * IMPORTANT! Override the 'loaded' property.
 		     * This is a *HACK* to circumvent a bug occurring in ExtJS 4.2.1 rev 883.
 		     * 
 		     * Oddly enough, this behaviour only occurs while working with ext-all.js
 		     * and not ext-dev.js
 		     * 
 		     * This should probably removed in more recent version of ExtJS
 		     * (4.2.3 seems to provide a bug fixing)
 		     */
			{
				name : 'loaded',
				type : 'boolean',
				defaultValue : true
// DO NOT DO THAT! This should be set for all levels
//	        	convert : function(value, record) {
//					return record.isRoot();
//	        	}
			},
	    	{
	    		name : 'expanded',
	    		type : 'boolean',
	    		defaultValue : true
	    	},
	    	
	    	{
	    		name : 'expandable',
	    		type : 'boolean',
	    		defaultValue : true
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
	 				
	 				return documentTypeActionDefinition.getClass(value, {} /* meta */, record);
	 				
	 			}
	 		}
 		
 		];
 		
 	},
 	
	getColumns : function() {
		
		var subjectColumnDefinition = this.getSubjectColumnDefinition();
		subjectColumnDefinition.xtype = 'treecolumn';
		
		return [
			
			subjectColumnDefinition,
		
			this.getDatesColumnDefinition()
			
		];
		
	},
	
	/*
	 * @override
	 */
	SUBJECT_TEMPLATE : new Ext.XTemplate(
		'<span class="document-subject">',
				'<span class="reference">{reference}</span>',
				'<span class="{objectClass}">{object}<span class="paragraph-end"/></span>',
				'<span class="name">( {name} )</span>',
		'</span>'
	)		
	

});