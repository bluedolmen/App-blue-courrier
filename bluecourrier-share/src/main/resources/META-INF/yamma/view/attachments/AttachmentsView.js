Ext.define('Yamma.view.attachments.AttachmentsView', {
	
	extend : 'Yamma.utils.grid.StoreGridPanel',
	alias : 'widget.attachmentsview',
	
	requires : [
		'Ext.grid.column.Template'
	],
	
	mixins : {
		deleteattachmentaction : 'Yamma.view.attachments.DeleteAttachmentAction',
		deferredloading : 'Yamma.view.edit.NodeRefDeferredLoading',
		countingtitle : 'Yamma.utils.grid.CountingTitle'
	},
	
	title : 'Attachements',
	iconCls : 'icon-attach',
	
	storeId : 'Attachments',
	hasPaging : false,
	hideHeaders : true,
	
    getDockedItemDefinitions : function() {
    	return [{
		    xtype: 'toolbar',
		    dock: 'bottom',
		    border : '1 0 0 0',
		    items: [
	    		'->',
	    		{
	    			xtype : 'button',
	    			itemId : 'addAttachment-button',
	    			iconCls : 'icon-attach_add',
	    			tooltip : 'Ajouter un attachement',
	    			disabled : true
	    		}
		    ]
		}];    	
    },
	
    initComponent : function() {
    	
    	var me = this;
    	
    	function onStoreLoaded(store, records, sucessful) {
    		
    		var
    			addAttachmentButton = me.queryById('addAttachment-button'),
    			hasWritePermission = true === (me.getPermissions()['Write'])
    		;
    		
    		if (null != addAttachmentButton) {
    			addAttachmentButton.setDisabled(!hasWritePermission);
    		}
    		
    	}
    	
    	function onStoreCleared() {
    		
    		var
				addAttachmentButton = me.queryById('addAttachment-button'),
				hasWritePermission = true === (me.getPermissions()['Write'])
			;
			
			if (null != addAttachmentButton) {
				addAttachmentButton.setDisabled(true);
			}
			
    	}
    	
		this.on('storeloaded', onStoreLoaded, this);
		this.on('storecleared', onStoreCleared, this);
		
    	this.mixins.countingtitle.init.call(this);
    	this.callParent(arguments);
    	
    },
    
 	getDerivedFields : function() {
 		
 		return [
 		
	 		{ 
	 			name : 'name', 
	 			mapping : 'cm:name', 
	 			convert : function(value, record) {
	 				var title = record.get('cm:title');
	 				
	 				return title ? title : value;
	 			}
	 		},
	 		
	 		{
	 			name : 'humanReadableSize',
	 			mapping : 'sizeInBytes',
	 			convert : function(value, record) {
	 				
	 				if (!value) return '?';
	 				if (! (Alfresco && Alfresco.util && Alfresco.util.formatFileSize) ) return value;
	 				return Alfresco.util.formatFileSize(value);
	 				
	 			}
	 			
	 		}
 		
 		];
 		
 	},	
	
	getColumns : function() {
		
		return [
		
			this.getAttachmentTypeColumnDefinition(),
			this.getNameColumnDefinition(),
			this.getSizeColumnDefinition(),
			this.getActionsColumnDefinition()
		
		];		
	},	
	
	
	getAttachmentTypeColumnDefinition : function() {
		return this.applyDefaultColumnDefinition (
		
			{
				xtype : 'actioncolumn',
				maxWidth : 30,
				tooltip : 'Type de document', // if the plugin is applied on the containing table
				plugins : Ext.create('Bluedolmen.utils.grid.column.HeaderImage', {iconCls : Yamma.Constants.UNKNOWN_TYPE_DEFINITION.iconCls}),
				
				items : [
					this.getAttachmentTypeActionDefinition()
				]
				
			}
		);
	},	
	
	getAttachmentTypeActionDefinition : function() {
		
		return	{
			
			getClass : function(value, meta, record) {
				
				var typeDefinition =
					getMimeTypeDefinition(record) ||
					Yamma.Constants.UNKNOWN_TYPE_DEFINITION
				;					
				
				meta.tdAttr = 'data-qtip="' + typeDefinition.title + '"';
				return typeDefinition.iconCls;
			}
			
		};
		
		function getMimeTypeDefinition(record) {
			var mimetype = record.get('mimetype');
			if (!mimetype) return null;
			
			return Yamma.Constants.MIME_TYPE_DEFINITIONS[mimetype];
		}		
		
	},	
	
	getNameColumnDefinition : function() {
		var coldef = this.applyDefaultColumnDefinition (
			{
				flex : 1,
				text : 'Nom du fichier',
				dataIndex : 'name'
			}		
		);
		
		return coldef;		
	},	
	
	getSizeColumnDefinition : function() {
		var coldef = this.applyDefaultColumnDefinition (
			{
				width : 50,
				text : 'Taille',
				dataIndex : 'humanReadableSize'
			}		
		);
		
		return coldef;		
	},
	
	getActionsColumnDefinition : function() {
		
		return this.applyDefaultColumnDefinition (
		
			{
				xtype : 'alfrescoactioncolumn',
				maxWidth : 30,
				items : [
					this.getDeleteAttachmentActionDefinition()
				]
				
			}
		);
		
	}
	

});