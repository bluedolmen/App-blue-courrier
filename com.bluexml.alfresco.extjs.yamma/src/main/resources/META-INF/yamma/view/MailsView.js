Ext.require('Yamma.utils.grid.MailsViewGrouping');

Ext.define('Yamma.view.MailsView', {

	extend : 'Yamma.utils.grid.YammaStoreList',
	alias : 'widget.mailsview',
	
	requires : [
		'Bluexml.utils.grid.column.Action',
		'Yamma.view.windows.DocumentHistoryWindow',
		'Yamma.view.windows.DocumentStatisticsWindow',
		'Yamma.utils.grid.MailsViewGrouping',
		'Yamma.utils.datasources.Documents',
		'Ext.grid.column.Date',
		'Bluexml.utils.grid.column.HeaderImage'
	],
	
	mixins : [
		'Yamma.view.gridactions.Distribute',
		'Yamma.view.gridactions.StartProcessing',
		'Yamma.view.gridactions.Reply',
		'Yamma.view.gridactions.SendReply',
		'Yamma.view.gridactions.ValidateReply'
	],
	
	features : [
		Ext.create('Yamma.utils.grid.MailsViewGrouping')
	],
	
	storeId : 'Mails',
	
	MAIL_OBJECT_LABEL : 'Objet',
	MAIL_NAME_LABEL : 'Identifiant',
	ASSIGNED_SERVICE_LABEL : 'Service',
	ASSIGNED_LABEL : 'Distribution',
	DELIVERY_DATE_LABEL : 'Date dépôt',
	DUE_DATE_LABEL : 'Date échéance',
	PRIORITY_LABEL : 'Priorité',
	
	title : 'Courrier',
	
//	initComponent : function() {
//		var me = this;
//		
//		this.viewConfig = {
//			getRowClass : function(record, rowIndex, rowParams, store) {
//				var lateState = record.get(Yamma.utils.datasources.Documents.DOCUMENT_LATE_STATE_QNAME);
//				var isLate = me.LATE_STATE_LATE_VALUE === lateState;
//				
//				var cssClass = (isLate ? 'row-mail-late' : '');
//				return cssClass;
//			}			
//		};
//		
//		this.callParent(arguments);
//	},
	
//	initComponent : function() {
//		
//		this.storeConfigOptions = {
//			groupField : Yamma.utils.datasources.Documents.ASSIGNED_SERVICE_QNAME
//		};
//		
//		this.callParent(arguments);
//	},
	
	initComponent : function() {
		
		this.addEvents('stateClick');
		
		this.callParent(arguments);
		
	},
	
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
		
			/* State */
			this.getStateColumnDefinition(),
		
			this.getDocumentTypeColumnDefinition(),
		
			this.getNameColumnDefinition(),
			
			/* Document object */
			this.getObjectColumnDefinition(),			
			
			/* Delivery date */
			this.getDeliveryDateColumnDefinition(),
			
			/* Due-date */
			this.getDueDateColumnDefinition(),
			
			/* Priority */
			this.getPriorityColumnDefinition(),
			
			this.getAssignedColumnDefinition(),
			
			this.getActionsColumnDefinition()
			
		
		];		
	},	
	
	
	getDocumentTypeColumnDefinition : function() {
		return this.applyDefaultColumnDefinition (
		
			{
				xtype : 'actioncolumn',
				maxWidth : 30,
				tooltip : 'Type de document', // if the plugin is applied on the containing table
				plugins : Ext.create('Bluexml.utils.grid.column.HeaderImage', {iconCls : Yamma.Constants.UNKNOWN_TYPE_DEFINITION.iconCls}),
				
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
				dataIndex : Yamma.utils.datasources.Documents.MAIL_NAME_QNAME
			}		
		);
		
		return coldef;		
	},
	
	getAssignedServiceColumnDefinition : function() {
		var coldef = this.applyDefaultColumnDefinition (
			{
				width : 150,
				text : this.ASSIGNED_SERVICE_LABEL,
				dataIndex : Yamma.utils.datasources.Documents.ASSIGNED_SERVICE_QNAME
			}		
		);
		
		return coldef;		
	},
	
	/**
	 * A special column definition that displays either the assigned authority
	 * if it is available, else the assigned service.
	 * 
	 */
	getAssignedColumnDefinition : function() {
		
		var me = this;
		var coldef = this.applyDefaultColumnDefinition (
			{
				width : 150,
				text : this.ASSIGNED_LABEL,
				sortable : false,
				groupable : false,
				menuDisabled : true,
				dataIndex : Yamma.utils.datasources.Documents.ASSIGNED_SERVICE_QNAME,
					
				renderer : function (value, meta, record) {
				
					var assignedAuthority = record.get(Yamma.utils.datasources.Documents.ASSIGNED_AUTHORITY_QNAME);
					if (assignedAuthority && value) {
						meta.tdCls = 'assigned-user-cell';
						return assignedAuthority.split('|')[0] || assignedAuthority;
					}
					
					if (value) {
						meta.tdCls = 'assigned-service-cell';
					}
					
					return value.split('|')[0] || value;
				}
			}		
		);
		
		return coldef;		
		
	},
	
	getObjectColumnDefinition : function() {
		
		var coldef = this.applyDefaultColumnDefinition (
			{
				flex : 1,
				text : this.MAIL_OBJECT_LABEL,
				dataIndex : Yamma.utils.datasources.Documents.MAIL_OBJECT_QNAME
			}		
		);
		
		return coldef;
		
	},
	
	getDeliveryDateColumnDefinition : function() {
		
		var coldef = this.applyDefaultColumnDefinition (
			{
				xtype : 'datecolumn',
				text : this.DELIVERY_DATE_LABEL,
				dataIndex : Yamma.utils.datasources.Documents.DELIVERY_DATE_QNAME
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
				var documentState = record.get(Yamma.utils.datasources.Documents.STATUSABLE_STATE_QNAME) || 'UNKNOWN';		
				var documentStateDef = Yamma.utils.Constants.DOCUMENT_STATE_DEFINITIONS[documentState];
				
				meta.tdAttr = 'data-qtip="' + documentStateDef.title + '"';
				return documentStateDef.iconCls + ' ' + 'column-header-img';
			}
		};			
		
	},
	
	onShowStateDetailsAction : function(grid, rowIndex, colIndex, item, e) {
		
		var record = grid.getStore().getAt(rowIndex);
		var documentNodeRef = this.getDocumentNodeRefRecordValue(record);
		
		this.fireEvent('stateClick', documentNodeRef);
		
//		return Ext.create('Yamma.view.windows.DocumentHistoryWindow', {
//			nodeRef : documentNodeRef 
//		}).show();
			
	},
	
	getDueDateColumnDefinition : function() {
		
		var me = this;
		var dateRenderer = Ext.util.Format.dateRenderer(me.DEFAULT_DATE_FORMAT);
		
		var coldef = this.applyDefaultColumnDefinition (
			{
				xtype : 'gridcolumn', // !!! not datecolumn since renderer function is then overwritten
				align : 'center',
				text : this.DUE_DATE_LABEL,
				dataIndex : Yamma.utils.datasources.Documents.DUE_DATE_QNAME,
				renderer : function (value, meta, record) {
				
					var lateState = record.get(Yamma.utils.datasources.Documents.DOCUMENT_LATE_STATE_QNAME);
					if (Yamma.utils.datasources.Documents.LATE_STATE_LATE_VALUE === lateState) {
						meta.tdCls = 'late-cell';
					}
					
					return dateRenderer(value);
				}
			}		
		);
		
		return coldef;
		
	},	
	
	getPriorityColumnDefinition : function() {
		
		var coldef = this.applyDefaultColumnDefinition (
			{
				width : 100,
				align : 'center',
				text : this.PRIORITY_LABEL,
				dataIndex : Yamma.utils.datasources.Documents.PRIORITY_QNAME
			}		
		);
		
		return coldef;
		
	},
	
	
	
	getActionsColumnDefinition : function() {
		
		return this.applyDefaultColumnDefinition (
		
			{
				xtype : 'bluexmlactioncolumn',
				maxWidth : 60,
				items : [
					this.getDistributeActionDefinition(),
					this.getStartProcessingActionDefinition(),
					this.getReplyActionDefinition(),
					this.getSendReplyActionDefinition(),
					this.getAcceptReplyActionDefinition(),
					this.getRefuseReplyActionDefinition()
				]
				
			}
		);
		
	},	
	
	
	getDocumentNodeRefRecordValue : function(record) {
		return record.get(Yamma.utils.datasources.Documents.MAIL_NODEREF_QNAME);	
	}
	
});