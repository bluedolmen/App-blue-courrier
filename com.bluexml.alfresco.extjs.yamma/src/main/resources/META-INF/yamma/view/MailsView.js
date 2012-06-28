Ext.define('Yamma.view.MailsView', {

	extend : 'Yamma.utils.grid.YammaStoreList',
	alias : 'widget.mailsview',
	
	requires : [
		'Bluexml.utils.grid.column.Action'
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
			
			this.getActionsColumnDefinition()
			
		
		];		
	},	
	
	getDocumentTypeColumnDefinition : function() {
		
		var coldef = this.applyDefaultColumnDefinition (
			{
				xtype : 'gridcolumn',
				plugins : 'columnheaderimage',
				iconCls : Yamma.Constants.UNKNOWN_TYPE_DEFINITION.iconCls, 
				width : 30,
				align : 'center',
				resizable : false,
				dataIndex : 'typeShort',
				renderer : function(value, metadata, record) {

					var typeDefinition =
						getTypeShortDefinition() ||
						getMimeTypeDefinition() ||
						Yamma.Constants.UNKNOWN_TYPE_DEFINITION;					
					
					value =  
						'<img ' + 
						'alt="' + typeDefinition.title + '" ' +
						'src="' + typeDefinition.icon + '" ' +
						'data-qtip="' + typeDefinition.title + '" ' +
						'/>';
						
					return value;
					
					function getTypeShortDefinition() {
						var typeShort = record.get('typeShort');
						if (!typeShort) return null;
						
						return Yamma.Constants.DOCUMENT_TYPE_DEFINITIONS[typeShort];
					}
					
					function getMimeTypeDefinition() {
						var mimetype = record.get('mimetype');
						if (!mimetype) return null;
						
						return Yamma.Constants.MIME_TYPE_DEFINITIONS[mimetype];
					}
						
				}
			}
		);

		return coldef;

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
			
			return (documentAssignedService && !isDocumentDelivered);
		}
	},
	
	onDistributeAction : function(grid, rowIndex, colIndex, item, e) {
		var record = grid.getStore().getAt(rowIndex);
		var documentNodeRef = record.get(this.MAIL_NODEREF_QNAME);
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
		
		
	}
	
	
});