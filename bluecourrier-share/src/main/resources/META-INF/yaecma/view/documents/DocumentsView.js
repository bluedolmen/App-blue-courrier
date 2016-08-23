Ext.define('Yaecma.view.documents.DocumentsView', {

	extend : 'Yaecma.utils.grid.StoreGridPanel',
	alias : 'widget.documentsview',
	
	requires : [
		'Bluedolmen.utils.grid.column.Action',
		'Bluedolmen.utils.grid.column.HeaderImage',
		
		'Ext.grid.column.Date',
		'Yaecma.view.documents.SortersMenu',
		'Yaecma.view.documents.ParentsMenu'
	],
	
	mixins : [
	],
	
	features : [
	],
	
	storeId : 'documents',
	
	proxyConfigOptions : {
	},
	
	title : i18n.t('widget.documentsview.title'),
	
	/**
	 * @cfg {String} rootRef
	 * The root reference (as a NodeRef) on which the file hierarchy will be displayed
	 */
	rootRef : 'root',
	
	/**
	 * @cfg {Boolean} [showThumbnails=true]
	 * Whether to show the thumbnails column
	 */
	showThumbnails : true,
	
	/**
	 * @cfg {Boolean} [showMimetypes=true]
	 *Whether to show the mimetype column 
	 */
	showMimetypes : false,
	
	/**
	 * @cfg {String} folderIcon
	 * The URL of the icon representing a folder
	 */
	//folderIcon : Alfresco.constants.URL_RESCONTEXT + 'components/documentlibrary/images/folder-64.png',
	folderIcon : Yaecma.Constants.getIconDefinition('folder_open', 48).icon,
	
	tbar : [
		{
			xtype : 'button',
			scale : 'small',
			text : '',
			iconCls : Yaecma.Constants.getIconDefinition('folder_up').iconCls,
			id : 'backToParent'
		},
		{
			xtype : 'parentsmenu',
			text : ' ',
			iconCls : Yaecma.Constants.getIconDefinition('folder').iconCls,
			id : 'backToAncestor'
		},
		'->',
		{
			xtype : 'sortersmenu',
			id : 'sortBy'
		}
	],

	initComponent : function() {
		
		this.callParent();
		
		var
			backToParentButton = this.getBackToParentButton(),
			sortByMenu = this.getSortByMenu()
		;
		
		this.mon(sortByMenu, 'sortby', this.onSortBy, this);
		this.mon(backToParentButton, 'click', this.onBackToParentClick, this);
		this.on('backto', this.onBackToAncestor, this); // this event bubbles from the backToAncestor menu
		this.on('itemclick', this.onItemClick, this);
		this.on('itemdblclick', this.onItemDblClick, this);
		
		this.addEvents('changecontainer','fileselected');
		
		this.proxyConfigOptions.extraParams = {
			'@root' : this.rootRef
		};
		
		this.displayContainerChildren(this.rootRef);
	},
	
 	onMetaDataRetrieved : function(metaData) {
 		
 		metaData = metaData || {};
 		this.parent = metaData.parent || null;
 		this.ancestors = metaData.ancestors || null;
 		
 		this.updateNavigationState();
 		
 		this.callParent();
 	},
 	
 	/**
 	 * @private
 	 */
 	updateNavigationState : function() {
 		
 		var
 			backToParentButton = this.getBackToParentButton(),
 			backToAncestorMenu = this.getBackToAncestorMenu(),
 			ancestors = this.getAncestors()
 		;
 		
		backToAncestorMenu.updatePath(ancestors);
		
 		if (ancestors.length <= 1) { // One ancestor means 1 parent (the current container), so it is not possible to go up to the parent 
 			backToParentButton.disable();
 			return;
 		} else {
			backToParentButton.enable();		
 		}
 		
 		function getDisplayPath() {
 			return
				Ext.Array.map(ancestors, function(pathPart) {
					return pathPart.text;
				}).join('/');
		}

		this.setTitle(getDisplayPath());
 		
 	},

	getBackToAncestorMenu : function() {
		return this.down('#backToAncestor');
	}, 	
	
	getBackToParentButton : function() {
		return this.down('#backToParent');
	},
	
	getSortByMenu : function() {
		return this.down('#sortBy');
	},
 	
 	getParent : function() {
 		return this.parent; // may be null
 	},
 	
 	getAncestors : function() {
 		return this.ancestors || [];
 	},
 	
	getColumns : function() {
		
		return [
		
			this.showMimetypes ? this.getMimetypeColumnDefinition() : null,
			
			this.showThumbnails ? this.getThumbnailColumnDefinition() : null,
			
			this.getDocumentDescriptionColumnDefinition()
		
		];		
	},
		
    applyDefaultColumnDefinition : function(columnDefinition) {
    	columnDefinition = this.callParent(arguments);
    	columnDefinition.tdCls = 'cell-align-middle';
    	return columnDefinition;
    },
    
	DESCRIPTION_TEMPLATE : new Ext.XTemplate(
		'<div class="document-description">',
			'<div class="header">',
				'<span class="name">{name}</span> <span class="title">{title}</span> <span class="version">{version}</span>',
			'</div>',
			'<div class="audit">',
				'<span class="{creationClass}">',
					'<span class="created">'+ i18n.t('widget.documentsview.template.description.created.text') +'{created}</span> <span class="{creatorClass}">'+ i18n.t('widget.documentsview.template.description.created.by') +'{creator}</span>',
				'</span>',
				'<span class="{modificationClass}">',
					'<span class="created">'+ i18n.t('widget.documentsview.template.description.modified.text') +'{modified}</span> <span class="modifier">'+ i18n.t('widget.documentsview.template.description.modified.by') +'{modifier} ('+ i18n.t('widget.documentsview.template.description.created.text') +'{created}<span class="{creatorClass}"> '+ i18n.t('widget.documentsview.template.description.created.by') +'{creator}</span>)</span>',
				'</span>',				
			'</div>',
			'<div class="{descriptionClass}">{description}</div>',
			'<div class="extra">',
				'<span class="size">{size}</span>',
			'</div>',
		'</div>'
	),	
	
    getDocumentDescriptionColumnDefinition : function() {
		
		var 
			me = this,
			coldef = this.applyDefaultColumnDefinition (
				{
					flex : 1,
					text : i18n.t('widget.documentsview.column.description.text'),
					dataIndex : '',
					
					renderer : function(value, meta, record) {
						
						function isModified(created, modified) {
							return modified && (created != modified);
						}
						
						var							
							name = record.get('cm:name'),
							title = record.get('cm:title'),
							version = record.get('cm:versionLabel'),
							
							modified = record.get('cm:modified'),
							modifier = record.get('modifier'),
							created = record.get('cm:created'),
							creator = record.get('creator'),
							
							isModified = isModified(created, modified),
							
							modifierDisplayName = modifier ? modifier.displayName || modifier.username : '',
							modificationClass = isModified ? 'modification' : Ext.baseCSSPrefix + 'hide-display',
							
							creatorDisplayName = creator ? creator.displayName || creator.username : '',
							creatorClass = !isModified || (creator.username != modifier.username) ? 'creator' : Ext.baseCSSPrefix + 'hide-display',
							creationClass = !isModified ? 'creation' : Ext.baseCSSPrefix + 'hide-display', // do not display created if the document is modified since
							
							size = record.get('size'),
							
							description = record.get('cm:description'),
							descriptionClass = description ? 'description' : 'no-description',
							
							documentDescription = me.DESCRIPTION_TEMPLATE.applyTemplate({
								name : name,
								title : title && title != name ? '(' + title + ')' : '',
								version : version || '',
								
								modified : me.getFormattedDate(modified),
								modifier : modifierDisplayName,
								modificationClass : modificationClass,
								
								created : me.getFormattedDate(created),
								creator : creatorDisplayName,
								creatorClass : creatorClass,
								creationClass : creationClass,
								
								size : size ? me.getFormattedSize(size) : '',
								
								description : description || 'Aucune description',
								descriptionClass :  descriptionClass
							})
						;
					
//						// Cell tooltip
//						meta.tdAttr =
//							'data-qtitle="' + name + '"' +
//							'data-qtip="' + object + '"' +
//							'data-qclass="' + objectClass + '"' +
//							'data-qwidth="200"'
//						;
						
						return documentDescription;
						
					}
					
				}
			)
		;
		
		return coldef;
	},
    		
	THUMBNAIL_URL : 'alfresco://api/node/{nodeRefAsPath}/content/thumbnails/doclib?c=queue&ph=true',
	
	getThumbnailUrl : function(nodeRef) {
		if (null == nodeRef) {
			Ext.Error.raise('IllegalArgumentException! The nodeRef has to be provided');
		}
		
		var 
			nodeRefAsPath = nodeRef.replace(':/',''),
			thumbnailUrl = this.THUMBNAIL_URL.replace('{nodeRefAsPath}', nodeRefAsPath)
		;
		
		return Bluedolmen.Alfresco.resolveAlfrescoProtocol(thumbnailUrl);
	},
	
	THUMBNAIL_TEMPLATE : new Ext.XTemplate(
		'<div class="thumbnail">',
			'<img src="{thumbnailUrl}"></img>',
		'</div>'
	),	
	
	getThumbnailColumnDefinition : function() {

		var
			me = this,
			coldef = this.applyDefaultColumnDefinition (
				{
					width : 100,
					minWidth : 100, // Circumvent a bug which decreases the width of the column when performing navigation
					maxHeight : 100,
					text : i18n.t('widget.documentsview.column.thumbnail.text'),
					dataIndex : '',
					
					renderer : function(value, meta, record) {
						
						var
							isContainer = record.get('isContainer'),
							nodeRef = record.get('nodeRef'),
							thumbnailUrl = isContainer ?
								me.folderIcon :
								me.getThumbnailUrl(nodeRef)
						;
					
						return me.THUMBNAIL_TEMPLATE.applyTemplate({
							thumbnailUrl : thumbnailUrl
						});
						
					}
					
				}
			)
		;
		
		return coldef;
		
	},	

//	MIMETYPE_TEMPLATE : new Ext.XTemplate(
//		'<div class="mimetype">',
//			'<img src="{mimetypeUrl}"></img>',
//		'</div>'
//	),		
//	
//	
//	getMimetypesColumnDefinition : function() {
//		var
//			coldef = this.applyDefaultColumnDefinition (
//				{
//					//xtype : 'actioncolumn',
//					width : 50,
//					minWidth : 50, // Circumvent a bug which decreases the width of the column when performing navigation
//					text : 'Type MIME',
//					dataIndex : 'mimetype',
//					
//					renderer : function(value, meta, record) {
//						
//						var
//							isContainer = record.get('isContainer'),
//							mimetype = record.get('mimetype'),
//							mimetypeIconDef = Bluedolmen.Constants.getMimeTypeIconDefinition(mimetype)
//						;
//						
//						meta.tdCls = isContainer ? this.folderIconCls : mimetypeIconDef.iconCls;
//						meta.style = 'background-repeat: none;'
//
//						return '';
//						
//					}
//					
//				}
//			)
//		;
//		
//		return coldef;
//	},
	
	folderIconCls : Yaecma.Constants.getIconDefinition('folder').iconCls,

	getMimetypeColumnDefinition : function() {
		
		return this.applyDefaultColumnDefinition (
		
			{
				xtype : 'actioncolumn',
				maxWidth : 50,
				tooltip : i18n.t('widget.documentsview.column.mimetype.tooltip'), // if the plugin is applied on the containing table
				plugins : Ext.create('Bluedolmen.utils.grid.column.HeaderImage', { iconCls : Bluedolmen.Constants.defaultMimetypeIconDefinition.iconCls }),
				
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
				
				var 
					isContainer = record.get('isContainer'),
					typeDefinition = isContainer
						? {
							title : i18n.t('widget.documentsview.action.type.title'),
							iconCls : me.folderIconCls
						}
						: Bluedolmen.Constants.getMimeTypeIconDefinition(mimetype)
				;	
				
				meta.tdAttr = 'data-qtip="' + typeDefinition.title + '"';
				return typeDefinition.iconCls;
			}
			
		};		
		
	},
	

	defaultDateFormat : 'd/m/Y',
	
	getFormattedDate : function(iso8601Date, inputFormat) {
		
		var 
			inputDate = iso8601Date instanceof Date ? iso8601Date : Ext.Date.parse(iso8601Date, inputFormat || 'c'),
			outputDate = Ext.Date.format(inputDate, this.defaultDateFormat)
		;

		return outputDate;
	},
	
	getFormattedSize : function(size) {
		return Alfresco.util.formatFileSize(size);
	},
	
	getActionsColumnDefinition : function() {
		
		return null;
		
	},
	
	
	/**
	 * Update the list view with the children of the provided container nodeRef.
	 * 
	 * @param {String}
	 *            containerNodeRef
	 */
	displayContainerChildren : function(containerNodeRef) {
		
		this.filter({
						
			filters : {
				id : 'parent',
				value : containerNodeRef
			}
			
		});
		
	},
	
	onItemClick : function(view, record, item, index, event, eOpts) {
		
		var
			nodeRef = record.get('nodeRef'),
			isContainer = record.get('isContainer'),
			parentRef = this.getParentRef()
		;
		
		if (!isContainer) return;
		this.changeContainer(nodeRef, parentRef);
		
	},
	
	changeContainer : function(nodeRef, parentRef) {
		
		if (false === this.fireEvent('changecontainer', nodeRef, parentRef)) return;
		this.displayContainerChildren(nodeRef);
		
	},
	
	onItemDblClick : function(view, record, item, index, event, eOpts) {
		
		var nodeRef = record.get('nodeRef');
		this.fireEvent('fileselected', nodeRef, record);
		
	},
	
	
	onSortBy : function(sortPropertyName, doSortAscending) {
		
		var documentsStore = this.getStore();
		if (!sortPropertyName) return;
				
		documentsStore.sort(sortPropertyName, doSortAscending ? 'ASC' : 'DESC');
				
	},
	
	onBackToParentClick : function(button, event) {
		
		var ancestors = this.getAncestors();
		if (Ext.isEmpty(ancestors)) return;
		
		var 
			grandParent = ancestors[1], // 0 is parent (ie the current container)
			grandParentRef = grandParent ? grandParent.nodeRef : this.rootRef
		; 
		
		this.changeContainer(grandParentRef); // no need for grand-parent ref since this is
		
	},
	
	getParentRef : function() {
		
		if (null == this.parent) return null;
		return parent.nodeRef;
		
	},
	
	onBackToAncestor : function(ancestorRef) {
		
		this.changeContainer(ancestorRef);
		return false;
	}
	
	
	
});
