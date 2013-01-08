Ext.require([
	'Yamma.utils.datasources.Documents',
	'Yamma.utils.grid.MailsViewGrouping',
	'Yamma.view.gridactions.ForwardReply',
	'Yamma.view.gridactions.RefuseReply',
	'Yamma.view.gridactions.Distribute',
	'Yamma.view.gridactions.StartProcessing',
	'Yamma.view.gridactions.SendOutbound',
	'Yamma.view.gridactions.MarkAsSent',
	'Yamma.view.gridactions.MarkAsSigned',
	'Yamma.view.gridactions.Archive'	
], function() {

Ext.define('Yamma.view.MailsView', {

	extend : 'Yamma.utils.grid.YammaStoreList',
	alias : 'widget.mailsview',
	
	requires : [
		'Bluexml.utils.grid.column.Action',
		'Yamma.view.windows.DocumentHistoryWindow',
		'Yamma.view.windows.DocumentStatisticsWindow',
		'Yamma.utils.grid.MailsViewGrouping',
		'Ext.grid.column.Date',
		'Ext.ux.grid.column.CheckColumn',
		'Bluexml.utils.grid.column.HeaderImage',
		'Ext.form.Label',
		'Yamma.utils.button.UploadButton'
	],
	
	features : [
		Ext.create('Yamma.utils.grid.MailsViewGrouping')
	],
	
	storeId : 'Mails',
	proxyConfigOptions : {
		extraParams : {
			'@discardReplies' : true // Just another permanent filter
		}
	},
	
	MAIL_SUBJECT_FIELD_ID : 'subject',
	MAIL_SUBJECT_LABEL : 'Sujet',
	MAIL_OBJECT_LABEL : 'Objet',
	MAIL_NAME_LABEL : 'Identifiant',
	ASSIGNED_SERVICE_LABEL : 'Service',
	ASSIGNED_LABEL : 'Distribution',
	DELIVERY_DATE_LABEL : 'Date dépôt',
	DUE_DATE_LABEL : 'Date échéance',
	DATES_LABEL : 'Dates',
	PRIORITY_LABEL : 'Priorité',
	
	//title : 'Courrier',
	title : '',
	
	initComponent : function() {
		var me = this;
		
		this.viewConfig = {
			getRowClass : function(record, rowIndex, rowParams, store) {
				var 
					priority = record.get(Yamma.utils.datasources.Documents.PRIORITY_QNAME),
					priorityLevel = Number(priority.split('|')[1] || -1),
					rowClass = me.getRowClass(priorityLevel) || ''
				;

				return rowClass;
			}			
		};
		
		this.addEvents('stateClick');
		this.getStatisticsView(); // instantiate the statistics view 
		
		this.callParent(arguments);
	},
	
	getRowClass : function(priorityLevel) {
		
		if (priorityLevel < 0) return null;
		if (priorityLevel >= 90) return 'row-mail-vip';
		if (priorityLevel >= 50) return 'row-mail-important';
		return null;
		
	},
	
//	initComponent : function() {
//		
//		this.storeConfigOptions = {
//			groupField : Yamma.utils.datasources.Documents.ASSIGNED_SERVICE_QNAME
//		};
//		
//		this.callParent(arguments);
//	},

	tbar : [
		{
			xtype : 'label',
			text : 'Courrier',
			itemId : 'toolbarTitle',
			margins : '0 0 0 5',
			style : {
				'font-size' : '1.2em',
				'font-weight' : 'bold',
				'color' : '#15498B'
			}
		},
		'->',
		{
			xtype : 'uploadbutton',
			scale : 'small',
			text : ''
		},
		{
			xtype : 'button',
			scale : 'small',
			text : '',
			iconCls : 'icon-chart_curve',
			id : 'statistics'
		}
	],
	
	/**
	 * This method is overloaded in order to set the the label of the toolbar
	 * and not the title of the panel (which is hidden).
	 * 
	 * @param {String}
	 *            title
	 */
	setTitle : function(title) {
		var label = this.down('#toolbarTitle');
		if (!label) return;
		
		label.setText(title);
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
		
			this.getTickColumnDefinition(),
		
			this.getStateColumnDefinition(),
		
			this.getDocumentTypeColumnDefinition(),
			
			this.getSubjectColumnDefinition(),
		
			this.getDatesColumnDefinition(),
			
			this.getAssignedColumnDefinition(),
			
			this.getActionsColumnDefinition()
			
		
		];		
	},	
	
		
    applyDefaultColumnDefinition : function(columnDefinition) {
    	var defaultConfig = this.callParent([columnDefinition]);
    	defaultConfig.tdCls = 'cell-align-middle';
    	return defaultConfig;
    },	
    
    getTickColumnDefinition : function() {
    	return this.applyDefaultColumnDefinition(
	    	{
	    		xtype : 'checkcolumn',
	    		width : 30,
	    		tooltip : 'Sélectionner le document',
	    		plugins : Ext.create('Bluexml.utils.grid.column.HeaderImage', {iconCls : Yamma.Constants.getIconDefinition('checkbox').iconCls}),
	    		resizable : false,
				menuDisabled : true,
				sortable : false,
				dataIndex : 'selected'
	    		
	    	}	
    	);
    },
    
    getDerivedFields : function() {
    	return [
	    	{
	    		name : 'selected',
	    		type : 'boolean',
	    		defaultValue : false
	    	}
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
		var me = this;
		
		return	{
			
			getClass : function(value, meta, record) {
				
				var typeDefinition =
					getTypeShortDefinition(record) ||
					me.getMimeTypeDefinition(record) ||
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
		
		
	},
	
	/**
	 * @private
	 * @param record
	 * @returns
	 */
	getMimeTypeDefinition : function(record) {
		var mimetype = record.get('mimetype') || 'default';
		
		return (
			Yamma.Constants.MIME_TYPE_DEFINITIONS[mimetype] || 
			Yamma.Constants.MIME_TYPE_DEFINITIONS['default']
		);
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

	
	
	
	
	
	ASSIGNED_TEMPLATE : new Ext.XTemplate(
		'<div class="document-assigned">',
		'<div class="{assignedServiceClass}">{assignedService}</div>',
		'<div class="{assignedAuthorityClass}">{assignedAuthority}</div>',
		'</div>'
	),
	
	ASSIGNED_TIP_TEMPLATE : new Ext.XTemplate(
		'<div style="text-align: right;"><i>Expéditeur</i></div>',
		'<div>Nom : <b>{name}</b></div>',
		'<div>Adresse : <b>{address}</b></div>',
		'<div>Mél : <span style="font-family: monospace;">{eMail}</span></div>',
		'<div>Tél : <span style="font-family: monospace;">{phone}</span></div>'
	),
	
	getAssignedColumnDefinition : function() {
		var 
			me = this,
			dateRenderer = Ext.util.Format.dateRenderer(me.DEFAULT_DATE_FORMAT),
			coldef = this.applyDefaultColumnDefinition ({
				width : 150,
				text : this.ASSIGNED_LABEL,
				sortable : false,
				groupable : false,
				menuDisabled : true,
				dataIndex : Yamma.utils.datasources.Documents.ASSIGNED_SERVICE_QNAME,
				
				renderer : function (value, meta, record) {
					
					var 
						assignedService = value ? value.split('|')[0] : '',
						assignedServiceClass = assignedService ? 'assigned-service' : Ext.baseCSSPrefix + 'hide-display',
						assignedAuthority = record.get(Yamma.utils.datasources.Documents.ASSIGNED_AUTHORITY_QNAME).split('|')[0],
						assignedAuthorityClass = assignedAuthority ? 'assigned-authority' : Ext.baseCSSPrefix + 'hide-display',
						correspondentName = record.get(Yamma.utils.datasources.Documents.CORREPONDENT_NAME),
						correspondentAddress = record.get(Yamma.utils.datasources.Documents.CORREPONDENT_ADDRESS),
						correspondentMail = record.get(Yamma.utils.datasources.Documents.CORREPONDENT_MAIL),
						correspondentPhone = record.get(Yamma.utils.datasources.Documents.CORREPONDENT_PHONE),
						tooltip = me.ASSIGNED_TIP_TEMPLATE.applyTemplate({
							name : correspondentName,
							address : correspondentAddress,
							eMail : correspondentMail,
							phone : correspondentPhone
						})
					;
					
					if (correspondentName || correspondentAddress || correspondentMail || correspondentPhone) {
						meta.tdAttr = 'data-qtip="' + Ext.htmlEncode(tooltip) + '"';
					}
					
					return me.ASSIGNED_TEMPLATE.applyTemplate({
						assignedServiceClass : assignedServiceClass,
						assignedService : assignedService,
						assignedAuthorityClass : assignedAuthorityClass,
						assignedAuthority : assignedAuthority
					});
					
				}
			});
		
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
	
	SUBJECT_TEMPLATE : new Ext.XTemplate(
		'<div class="document-subject">',
		'<div class="{nameClass}">{name}</div>',
		'<div class="{objectClass}">{object}</div>',
		'</div>'
	),	
	
	getSubjectColumnDefinition : function() {
		
		var 
			me = this,
			coldef = this.applyDefaultColumnDefinition (
				{
					flex : 1,
					text : this.MAIL_SUBJECT_LABEL,
					dataIndex : Yamma.utils.datasources.Documents.MAIL_OBJECT_QNAME,
					renderer : function(value, meta, record) {
						
						var 
							object = value,
							objectClass = object ? 'object' : Ext.baseCSSPrefix + 'hide-display',
							name = record.get(Yamma.utils.datasources.Documents.MAIL_NAME_QNAME),
							mimeTypeDefinition = me.getMimeTypeDefinition(record),
							nameClass = name ? 'name' : Ext.baseCSSPrefix + 'hide-display',
							subject = me.SUBJECT_TEMPLATE.applyTemplate({
								objectClass : objectClass,
								object : object,
								nameClass : nameClass + 
									(mimeTypeDefinition && nameClass 
											? ' ' + mimeTypeDefinition.iconCls 
											: ''
									),
								name : name
							})
						;
					
						// Cell tooltip
						meta.tdAttr =
							'data-qtitle="' + name + '"' +
							'data-qtip="' + object + '"' +
							'data-qclass="' + objectClass + '"' +
							'data-qwidth="200"'
						;
						
						return subject;
						
					}
					
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
		
		return	{
			handler : this.onShowStateDetailsAction,
			scope : this,
			getClass : function(value, meta, record) {
				var 
					documentState = record.get(Yamma.utils.datasources.Documents.STATUSABLE_STATE_QNAME) || 'UNKNOWN',		
					documentStateDef = Yamma.utils.Constants.DOCUMENT_STATE_DEFINITIONS[documentState]
				;
				
				meta.tdAttr = 'data-qtip="' + documentStateDef.title + '"';
				return documentStateDef.iconCls + ' ' + 'column-header-img';
			}
		};			
		
	},
	
	onShowStateDetailsAction : function(grid, rowIndex, colIndex, item, e) {
		
		var 
			record = grid.getStore().getAt(rowIndex),
			documentNodeRef = this.getDocumentNodeRefRecordValue(record)
		;
		
		this.fireEvent('stateClick', documentNodeRef);
		
	},
	
	DATES_TEMPLATE : new Ext.XTemplate(
		'<div class="document-dates">',
		'<div class="{dueDateClass}">{dueDate}</div>',
		'<div class="{deliveryDateClass}">{deliveryDate}</div>',
		'<div class="{writingDateClass}">{writingDate}</div>',		
		'</div>'
	),
	
	DATES_TIP_TEMPLATE : new Ext.XTemplate(
		'<div>Rédaction : <b>{writing}</b></div>',
		'<div>Envoi : <b>{sent}</b></div>',
		'<div>Réception : <b>{delivered}</b></div>',
		'<div>Numérisation : <b>{digitized}</b></div>'
	),
	
	getDatesColumnDefinition : function() {
		var 
			me = this,
			dateRenderer = Ext.util.Format.dateRenderer(me.DEFAULT_DATE_FORMAT),
			coldef = this.applyDefaultColumnDefinition ({
				xtype : 'gridcolumn',
				text : this.DATES_LABEL,
				dataIndex : Yamma.utils.datasources.Documents.DUE_DATE_QNAME,
				
				renderer : function (value, meta, record) {
				
					var 
						lateState = record.get(Yamma.utils.datasources.Documents.DOCUMENT_LATE_STATE_QNAME),
						dueDate = record.get(Yamma.utils.datasources.Documents.DUE_DATE_QNAME),
						dueDateClass =  dueDate ? me.getLateStateClass(lateState) : Ext.baseCSSPrefix + 'hide-display',
						deliveryDate = record.get(Yamma.utils.datasources.Documents.DELIVERY_DATE_QNAME),
						deliveryDateClass = deliveryDate ? 'deliveryDate' : Ext.baseCSSPrefix + 'hide-display',
						
						writingDate = record.get(Yamma.utils.datasources.Documents.WRITING_DATE_QNAME),
						writingDateClass = !deliveryDate ? 'writingDate' : Ext.baseCSSPrefix + 'hide-display', // only displayed if no delivery-date is available
						sentDate = record.get(Yamma.utils.datasources.Documents.SENT_DATE_QNAME),
						digitizedDate = record.get(Yamma.utils.datasources.Documents.DIGITIZED_DATE_QNAME),
						
						tooltip = me.DATES_TIP_TEMPLATE.applyTemplate({
							writing : dateRenderer(writingDate),
							sent : dateRenderer(sentDate),
							delivered : dateRenderer(deliveryDate),
							digitized : dateRenderer(digitizedDate)
						}),
						
						value = me.DATES_TEMPLATE.applyTemplate({
							dueDate : dateRenderer(dueDate),
							dueDateClass : dueDateClass,
							deliveryDate : dateRenderer(deliveryDate),
							deliveryDateClass : deliveryDateClass,
							writingDate : dateRenderer(writingDate),
							writingDateClass : writingDateClass
						}); 
					;
					
					// tooltip
					if (writingDate || sentDate || deliveryDate || digitizedDate) {						
						meta.tdAttr = 'data-qtip="' + tooltip + '"';
					}
						
					return value;
					
				}
			});
		
		return coldef;		
	},
	
	/**
	 * @private
	 */
	getLateStateClass : function(lateState) {
		return lateState;
	},
	
	getDueDateColumnDefinition : function() {
		
		var 
			me = this,
			dateRenderer = Ext.util.Format.dateRenderer(me.DEFAULT_DATE_FORMAT),
			coldef = this.applyDefaultColumnDefinition (
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
			)
		;
		
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
	
	gridactions : [
		Ext.create('Yamma.view.gridactions.ForwardReply'),
		Ext.create('Yamma.view.gridactions.Distribute'),
		Ext.create('Yamma.view.gridactions.StartProcessing'),
		Ext.create('Yamma.view.gridactions.SendOutbound'),
		Ext.create('Yamma.view.gridactions.MarkAsSigned'),
		Ext.create('Yamma.view.gridactions.MarkAsSent'),
		Ext.create('Yamma.view.gridactions.RefuseReply'), // RefuseReply should be defined after ForwardReply and MarkAsSigned for a better user-experience 
		Ext.create('Yamma.view.gridactions.Archive')
	],
	
	maxAvailableActions : 3,	
	
	getDocumentNodeRefRecordValue : function(record) {
		return record.get(Yamma.utils.datasources.Documents.DOCUMENT_NODEREF_QNAME);	
	},
	
	/**
	 * @private
	 * @returns
	 */
	getStatisticsView : function() {
		if (null == this.statisticsView) {
			this.statisticsView = Ext.create('Yamma.view.windows.DocumentStatisticsWindow', {
				closeAction : 'hide'
			}); 
		}
		
		return this.statisticsView;
	}	
	
});

});
