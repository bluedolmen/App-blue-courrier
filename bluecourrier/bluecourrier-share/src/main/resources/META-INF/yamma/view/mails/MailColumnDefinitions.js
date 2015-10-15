Ext.define('Yamma.view.mails.MailColumnDefinitions', {
	
	requires : [
	    'Bluedolmen.utils.grid.column.HeaderImage',
		'Bluedolmen.utils.grid.column.Action',	    
		'Ext.grid.column.Date'
	],
	
	uses : [
	    'Yamma.store.DeliveryRoles'
	],
	
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
	
	
	getDocumentTypeColumnDefinition : function() {
		
		return this.applyDefaultColumnDefinition (
		
			{
				xtype : 'actioncolumn',
				maxWidth : 30,
				tooltip : 'Type de document', // if the plugin is applied on the containing table
				plugins : Ext.create('Bluedolmen.utils.grid.column.HeaderImage', {iconCls : Yamma.Constants.UNKNOWN_TYPE_DEFINITION.iconCls}),
				groupable : false,
				items : [
					this.getDocumentTypeActionDefinition()
				]				
				
			}
		);		
		
	},
	
	getKindDefinition : function(record) {
		
		var kind = record.get(Yamma.utils.datasources.Documents.MAIL_KIND_QNAME);
		if (!kind) return null;
		
		return Yamma.Constants.DOCUMENT_TYPE_DEFINITIONS[kind];
		
	},
	
	geProcessKindDefinition : function(record) {
		
		var kind = record.get(Yamma.utils.datasources.Documents.PROCESS_KIND_QNAME);
		if (!kind) return null;
		
		kind = Yamma.utils.DeliveryUtils.getProcessKinds()[kind];
		if (null == kind) return null;
		
		return {
			title : kind.label,
			iconCls : kind.iconCls
		};
		
	},

	
	getDocumentTypeActionDefinition : function() {
		
		var me = this;
		
		return	{
			
			getClass : function(value, meta, record) {
				
				var 
					typeDefinition =
						me.geProcessKindDefinition(record) ||
						me.getKindDefinition(record) ||
						me.getMimeTypeDefinition(record) ||
						Yamma.Constants.UNKNOWN_TYPE_DEFINITION
				;				
				
				meta.tdAttr = 'data-qtip="' + typeDefinition.title + '"';
				return typeDefinition.iconCls;
				
			}
			
		};
		
	},
	
	/**
	 * @private
	 * @param record
	 * @returns
	 */
	getMimeTypeDefinition : function(record) {
		
		var 
			mimetype = record.get('mimetype') || 'default',
			signed = false !== record.get('ds:signed'),
			mimetype = mimetype + (signed ? '*signed' : '') 
		;
		
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
				dataIndex : Yamma.utils.datasources.Documents.DOCUMENT_NAME_QNAME
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
	
	getEnclosingServiceColumnDefinition : function() {
		var coldef = this.applyDefaultColumnDefinition (
			{
				width : 150,
				text : this.ASSIGNED_SERVICE_LABEL,
				dataIndex : Yamma.utils.datasources.Documents.ENCLOSING_SERVICE,
				renderer : function(value, meta, record) {
					
					return Yamma.utils.ServicesManager.getDisplayName(value);
					
				}
			}		
		);
		
		return coldef;
	},
	
	SERVICE_TEMPLATE : new Ext.XTemplate(
		'<div class="service">',
		'<div class="{serviceClass}" data-qtip="{qtip}">{displayedService}</div>',
//		'<div class="{copyServicesClass}">{copyServices}</div>',
		'</div>'
	),
		
	getServiceColumnDefinition : function() {
		
		var 
			me = this,
			distributeAction = Yamma.view.mails.gridactions.Distribute,
//			deliveryRoles = Ext.create('Yamma.store.DeliveryRoles'),
//			processingRoles = deliveryRoles.query('family', 'procg'),
			
			dateRenderer = Ext.util.Format.dateRenderer(me.DEFAULT_DATE_FORMAT),
			coldef = this.applyDefaultColumnDefinition ({
				width : 150,
				text : this.ASSIGNED_SERVICE_LABEL,
				sortable : false,
				groupable : false,
				menuDisabled : true,
				dataIndex : Yamma.utils.datasources.Documents.ENCLOSING_SERVICE,
				
				renderer : function (value, meta, record) {
					
					var
					
						enclosingService = value,
						
						properties = record.get('incomingWorkflowProperties'),
//						assignedService = distributeAction.getAssignedService(record.data),
						assignedService = null,
						assignedServiceName = assignedService ? assignedService.serviceName : enclosingService,
//						targetProcessingService = distributeAction.getTargetProcessingService(properties),
						targetProcessingService = null,
						targetProcessingServiceName = targetProcessingService ? targetProcessingService.serviceName : null,
						serviceClass = null,
						displayedService = null,
								
						processType = record.get('processType'),
						
						qtip = ''

//						copies = distributeAction.getShares(properties),
//						copyServices = (copies ? copies.services : null) || [],
//						copyServicesDN = Ext.Array.map(copyServices, function(serviceName) {
//							return Yamma.utils.ServicesManager.getDisplayName(serviceName);
//						}),
//						copyServicesString = copyServicesDN.join(', '),
//						copyServicesClass = Ext.isEmpty(copyServices) ? hideDisplayClass : 'copy-services' 
						
					;
					
//					ongoingProcessingService = ( distributeAction.getOngoingShares(properties, processingRoles) || [])[0];
//					currentProcessingService = (distributeAction.getProcessedShares(properties, processingRoles) || [])[0];
					
					if (targetProcessingServiceName && targetProcessingServiceName != assignedServiceName) {
						serviceClass = 'assigned-service';
						displayedService = Yamma.utils.ServicesManager.getDisplayName(targetProcessingServiceName);
						qtip = '<i>Service destination : </i><b>' + displayedService + '</b>';
					} 
					else {
						serviceClass = 'enclosing-service';
						displayedService = Yamma.utils.ServicesManager.getDisplayName(assignedServiceName);
						qtip = '<i>Service actuel : </i><b>' + displayedService + '</b>';
					}
					
					qtip += '<br/><i>Circuit <b>' + 
						('with-validation' == processType ? 'avec' : 'sans') +
						'</b> validation</i>'
					;

					serviceClass += ' ' + processType;
					
					return me.SERVICE_TEMPLATE.applyTemplate({
						
						serviceClass : serviceClass,
						displayedService : displayedService,
						qtip : qtip
						
//						copyServices : copyServicesString,
//						copyServicesClass : copyServicesClass,
						
					});
					
				}
			})
		;
		
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
		'<div class="{nameClass}"><div class="privacy-extra-cls {addCls}"></div>{name}</div>',
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
					groupable : false,
					renderer : function(value, meta, record) {
						
						var 
							object = value,
							objectClass = object ? 'object' : Ext.baseCSSPrefix + 'hide-display',
							name = record.get(Yamma.utils.datasources.Documents.DOCUMENT_NAME_QNAME),
							mimeTypeDefinition = me.getMimeTypeDefinition(record),
							nameClass = name ? 'name' : Ext.baseCSSPrefix + 'hide-display',
							addCls = me.getPrivacyAddCls(record),
							subject = me.SUBJECT_TEMPLATE.applyTemplate({
								objectClass : objectClass,
								object : object,
								addCls : addCls,
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
			)
		;
		
		return coldef;
	},
	
	getPrivacyAddCls : function(record) {
		
		var privacyLevel = record.get(Yamma.utils.datasources.Documents.PRIVACY_QNAME);
		if (!privacyLevel) return '';
		
		return 'mail-privacy-' + privacyLevel.toLowerCase().replace(/[\W]/g,'_');  
		
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
				plugins : Ext.create('Bluedolmen.utils.grid.column.HeaderImage', {iconCls : Yamma.Constants.getIconDefinition('cog_email').iconCls }),
				resizable : false,
				menuDisabled : true,
				sortable : false,
				groupable : false,
				
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
				return documentStateDef.iconCls;
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
		'<div class=\'{digitizedDateClass}\'>Numérisation : <b>{digitized}</b></div>'
	),
	
	getDatesColumnDefinition : function() {
		var 
			me = this,
			dateRenderer = Ext.util.Format.dateRenderer(me.DEFAULT_DATE_FORMAT),
			coldef = this.applyDefaultColumnDefinition ({
				xtype : 'gridcolumn',
				text : this.DATES_LABEL,
				dataIndex : Yamma.utils.datasources.Documents.DUE_DATE_QNAME,
				groupable : false,
				sortable : false,				
				renderer : function (value, meta, record) {
				
					var 
						lateState = record.get(Yamma.utils.datasources.Documents.DOCUMENT_LATE_STATE_QNAME),
						dueDate = record.get(Yamma.utils.datasources.Documents.DUE_DATE_QNAME),
						dueDateClass =  dueDate ? me.getLateStateClass(lateState) : Ext.baseCSSPrefix + 'hide-display',
						deliveryDate = record.get(Yamma.utils.datasources.Documents.DELIVERY_DATE_QNAME),
						deliveryDateClass = deliveryDate ? 'deliveryDate' : Ext.baseCSSPrefix + 'hide-display',
						
						writingDate = record.get(Yamma.utils.datasources.Documents.WRITING_DATE_QNAME),
						writingDateClass = !deliveryDate && writingDate ? 'writingDate' : Ext.baseCSSPrefix + 'hide-display', // only displayed if no delivery-date is available
						sentDate = record.get(Yamma.utils.datasources.Documents.SENT_DATE_QNAME),
						digitizedDate = record.get(Yamma.utils.datasources.Documents.DIGITIZED_DATE_QNAME),
						digitizedDateClass = digitizedDate ? '' : Ext.baseCSSPrefix + 'hide-display',
						
						tooltip = me.DATES_TIP_TEMPLATE.applyTemplate({
							writing : dateRenderer(writingDate),
							sent : dateRenderer(sentDate),
							delivered : dateRenderer(deliveryDate),
							digitized : dateRenderer(digitizedDate),
							digitizedDateClass : digitizedDateClass
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
		
		return this.applyDefaultColumnDefinition (
		
			{
				xtype : 'gridcolumn',
				width : 30,
				tooltip : this.PRIORITY_LABEL, // if the plugin is applied on the containing table
				plugins : Ext.create('Bluedolmen.utils.grid.column.HeaderImage', {iconCls : Yamma.Constants.getIconDefinition('flag_nb').iconCls }),
				resizable : false,
				menuDisabled : true,
				sortable : false,
				groupable : false,
				
				renderer : function (value, meta, record) {
					
					var 
						documentState = record.get(Yamma.utils.datasources.Documents.PRIORITY_QNAME) || 'INDEFINI',
						addCls = 'mail-priority-' + documentState.toLowerCase().replace(/[\W]/g,'_');
					;
					meta.tdAttr = 'data-qtip="' + documentState + '"';
					
					return '<div class="mail-priority ' + addCls + '"></div>';
					
				}
				
			}
		);
		
	},
	
	getFollowedByActionDefinition : function() {
		
		var 
			iconCls = Yamma.Constants.getIconDefinition('feed').iconCls,
			actiondef = {
				tooltip: 'Courrier suivi',
				disabled : true,
				getClass : function(value, meta, record) {
					
					var followed = record.get(Yamma.utils.datasources.Documents.IS_FOLLOWED_QNAME);
					
					return ( followed && !Yamma.view.mails.gridactions.SimpleTaskRefGridAction.hasTask(record) 
						? iconCls 
						: Ext.baseCSSPrefix + 'hide-display'
					);
					
				}
			}
		;
		
		return actiondef;
		
	}
	
});