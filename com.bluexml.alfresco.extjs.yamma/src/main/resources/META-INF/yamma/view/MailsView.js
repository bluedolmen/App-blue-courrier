Ext.define('Yamma.view.MailsView', {

	extend : 'Yamma.utils.grid.YammaStoreList',
	alias : 'widget.mailsview',
	
	requires : [
		'Bluexml.utils.grid.column.Action',
		'Yamma.view.windows.DocumentHistoryWindow'
	],
	
	storeId : 'Mails',
	
	MAIL_OBJECT_LABEL : 'Objet',
	MAIL_OBJECT_QNAME : 'yamma-ee:Mail_object',
	
	MAIL_NAME_LABEL : 'Identifiant',
	MAIL_NAME_QNAME : 'cm:name',
	
	MAIL_NODEREF_QNAME : 'nodeRef',
	
	ASSIGNED_SERVICE_LABEL : 'Service',
	ASSIGNED_SERVICE_QNAME : 'yamma-ee:Assignable_service',
	ASSIGNED_SERVICE_ISDELIVERED_QNAME : 'yamma-ee:Assignable_service_isDelivered',
	
	DELIVERY_DATE_LABEL : 'Date dépôt',
	DELIVERY_DATE_QNAME : 'yamma-ee:Mail_deliveryDate',
	
	DOCUMENT_ISCOPY_QNAME : 'yamma-ee:Document_isCopy',
	STATUSABLE_STATE_QNAME : 'yamma-ee:Statusable_state',
	
	DISTRIBUTE_ACTION_ICON : Yamma.Constants.getIconDefinition('email_go'),
	DISTRIBUTE_ACTION_WS_URL : 'alfresco://bluexml/yamma/distribute',
	
	title : 'Courrier',
	
	nextDocument : function() {
		
//		var store = this.getStore();
//		var totalCount = store.getTotalCount();
		
		var selectionModel = this.getSelectionModel();
		if (!selectionModel) return;
		
		var lastSelected = selectionModel.getLastSelected();
		if (!lastSelected) return;

		var lastIndex = lastSelected.index == null ? -1 : lastSelected.index;
		selectionModel.select(lastIndex + 1, false /* keepExisting */, false /* suppressEvent */);
	},
	
	refreshSelected : function() {
		
		var selectionModel = this.getSelectionModel();
		if (!selectionModel) return;
		
		var lastSelected = selectionModel.getLastSelected();
		if (!lastSelected) return;

		var lastIndex = lastSelected.index;
		if (null == lastIndex) return;
		
		this.refreshNode(lastIndex);
	},

	getColumns : function() {
		
		return [
		
			this.getDocumentTypeColumnDefinition(),
		
			this.getNameColumnDefinition(),
			
			this.getServiceColumnDefinition(),
			
			/* Delivery date */
			this.getDeliveryDateColumnDefinition(),
			
			/* Document object */
			this.getObjectColumnDefinition(),
			
			/* State */
			this.getStateColumnDefinition(),
			
			this.getActionsColumnDefinition()
			
		
		];		
	},	
	
	
	getDocumentTypeColumnDefinition : function() {
		return this.applyDefaultColumnDefinition (
		
			{
				xtype : 'actioncolumn',
				width : 30,
				tooltip : 'Type de document', // if the plugin is applied on the containing table
				plugins : Ext.create('Bluexml.utils.grid.column.HeaderImage', {iconCls : Yamma.Constants.UNKNOWN_TYPE_DEFINITION.iconCls}),
				resizable : false,
				menuDisabled : true,
				sortable : false,
				
				items : [
					this.getDocumentTypeActionDefinition()
				]
				
			}
		);
	},
	
	getDocumentTypeActionDefinition : function() {
		
		return	{
			
			getClass : function(value, meta, record) {
				
				var typeDefinition =
					getTypeShortDefinition(record) ||
					getMimeTypeDefinition(record) ||
					Yamma.Constants.UNKNOWN_TYPE_DEFINITION;					
				
				meta.tdAttr = 'data-qtip="' + typeDefinition.title + '"';
				return typeDefinition.iconCls + ' ' + 'column-header-img';
			}
			
		};
		
		function getTypeShortDefinition(record) {
			var typeShort = record.get('typeShort');
			if (!typeShort) return null;
			
			return Yamma.Constants.DOCUMENT_TYPE_DEFINITIONS[typeShort];
		}
		
		function getMimeTypeDefinition(record) {
			var mimetype = record.get('mimetype');
			if (!mimetype) return null;
			
			return Yamma.Constants.MIME_TYPE_DEFINITIONS[mimetype];
		}		
		
	},	
	
	getNameColumnDefinition : function() {
		var coldef = this.applyDefaultColumnDefinition (
			{
				width : 150,
				text : this.MAIL_NAME_LABEL,
				dataIndex : this.MAIL_NAME_QNAME
			}		
		);
		
		return coldef;		
	},
	
	getServiceColumnDefinition : function() {
		var coldef = this.applyDefaultColumnDefinition (
			{
				width : 150,
				text : this.ASSIGNED_SERVICE_LABEL,
				dataIndex : this.ASSIGNED_SERVICE_QNAME
			}		
		);
		
		return coldef;		
	},
	
	getObjectColumnDefinition : function() {
		
		var coldef = this.applyDefaultColumnDefinition (
			{
				flex : 1,
				text : this.MAIL_OBJECT_LABEL,
				dataIndex : this.MAIL_OBJECT_QNAME
			}		
		);
		
		return coldef;
		
	},
	
	getDeliveryDateColumnDefinition : function() {
		
		var coldef = this.applyDefaultColumnDefinition (
			{
				xtype : 'datecolumn',
				text : this.DELIVERY_DATE_LABEL,
				dataIndex : this.DELIVERY_DATE_QNAME
			}		
		);
		
		return coldef;
		
	},
	
	getStateColumnDefinition : function() {
		return this.applyDefaultColumnDefinition (
		
			{
				xtype : 'actioncolumn',
				width : 30,
				tooltip : 'État', // if the plugin is applied on the containing table
				plugins : Ext.create('Bluexml.utils.grid.column.HeaderImage', {iconCls : 'icon-cog'}),
				resizable : false,
				menuDisabled : true,
				sortable : false,
				
				items : [
					this.getShowStateActionDefinition()
				]
				
			}
		);
	},
	
	getShowStateActionDefinition : function() {
		
		var me = this;
		
		return	{
			handler : this.onShowStateDetailsAction,
			scope : this,
			getClass : function(value, meta, record) {
				var documentState = record.get(me.STATUSABLE_STATE_QNAME) || 'UNKNOWN';		
				var documentStateDef = Yamma.utils.Constants.DOCUMENT_STATE_DEFINITIONS[documentState];
				
				meta.tdAttr = 'data-qtip="' + documentStateDef.title + '"';
				return documentStateDef.iconCls + ' ' + 'column-header-img';
			}
		};			
		
	},
	
	onShowStateDetailsAction : function(grid, rowIndex, colIndex, item, e) {
		
		var record = grid.getStore().getAt(rowIndex);
		var documentNodeRef = this.getDocumentNodeRefRecordValue(record);
		
		return Ext.create('Yamma.view.windows.DocumentHistoryWindow', {
			nodeRef : documentNodeRef 
		}).show();
			
	},
	
	getActionsColumnDefinition : function() {
		
		return this.applyDefaultColumnDefinition (
		
			{
				xtype : 'bluexmlactioncolumn',
				width : 30,
				items : [
					this.getDistributeActionDefinition()
				]
				
			}
		);
		
	},
	
	getDistributeActionDefinition : function() {
		
		var me = this;
		
		return	{
			icon : this.DISTRIBUTE_ACTION_ICON.icon,
			tooltip : 'Distribuer le document',
			handler : this.onDistributeAction,
			scope : this,
			getClass : function(value, meta, record) {
				if (!canLaunchActionOnDocument(record)) return (Ext.baseCSSPrefix + 'hide-display');
				return '';
			}
		};
			
		function canLaunchActionOnDocument(record) {
			var documentAssignedService = record.get(me.ASSIGNED_SERVICE_QNAME);
			var isDocumentDelivered = record.get(me.ASSIGNED_SERVICE_ISDELIVERED_QNAME);
			var isCopy = record.get(me.DOCUMENT_ISCOPY_QNAME);
			
			return (documentAssignedService && !isDocumentDelivered && !isCopy);
		}
	},
	
	onDistributeAction : function(grid, rowIndex, colIndex, item, e) {
		var record = grid.getStore().getAt(rowIndex);
		var documentNodeRef = this.getDocumentNodeRefRecordValue(record);
		this.distributeDocument(documentNodeRef);
		
		return false;
	},
	
	distributeDocument : function(documentNodeRef) {
		
		var me = this;
		
		var url = Bluexml.Alfresco.resolveAlfrescoProtocol(
			this.DISTRIBUTE_ACTION_WS_URL
		);
		
		Bluexml.Alfresco.jsonPost(
			{
				url : url,
				dataObj : {
					nodeRef : documentNodeRef
				}
			},
			
			function(jsonResponse) { /* onSuccess */
				me.refresh(); 
			}
		);		
		
		
	},
	
	getDocumentNodeRefRecordValue : function(record) {
		return record.get(this.MAIL_NODEREF_QNAME);	
	}
	
});