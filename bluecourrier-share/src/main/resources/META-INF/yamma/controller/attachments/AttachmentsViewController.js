/**
 * The Attachments View Controller.
 * 
 * This controller manages the addition of a new attachment.
 */
Ext.define('Yamma.controller.attachments.AttachmentsViewController', {

	extend : 'Ext.app.Controller',
	
	views : [
		'attachments.AttachmentsView'
	],
	
	refs : [
		{
			ref : 'attachmentsView',
			selector : 'attachmentsview'
		},
		{
			ref : 'displayView',
			selector : 'displayview'
		}
		
	],
	
	uses : [
	    'Yamma.view.windows.UploadFormWindow'
	],
	
	ATTACH_ACTION_WS_URL : 'alfresco://bluedolmen/yamma/attachment',
	
	init: function() {
		
		this.control({
			
			'attachmentsview #addAttachment-button' : {
				click : this.onAddAttachmentClick
			},
			
			'attachmentsview' : {
				itemclick : this.onAttachmentSelect
			}
			
		});

		this.callParent(arguments);
		
	},
	
	/**
	 * Add-Button click-handler.
	 * 
	 * @private
	 */
	onAddAttachmentClick : function(button, event, click) {
		
		var
			attachmentsView = this.getAttachmentsView(),
			documentNodeRef = attachmentsView.getDocumentNodeRef(),
			url = Bluedolmen.Alfresco.resolveAlfrescoProtocol(
				this.ATTACH_ACTION_WS_URL
			),
			
			fileSelectionMenu = Ext.create('Ext.menu.Menu', {
				title : "Source",
			    plain: true,
			    renderTo: Ext.getBody(),
			    items : [
					{
						text : 'Fichier local',
						iconCls : Yamma.Constants.getIconDefinition('page_add').iconCls,
						handler : uploadLocalFile
					},
					{
						text : 'Fichier GED',
						iconCls : Yamma.Constants.getIconDefinition('database_add').iconCls,
						handler : selectRepositoryFile
					}
				]
			})
		;
		
		fileSelectionMenu.showAt(event.getXY());

		function uploadLocalFile() {
			
			Ext.create('Yamma.view.windows.UploadFormWindow', {
				
				title : 'Choisissez un fichier à ajouter en <b>attachement</b>',
				
				formConfig : {
					uploadUrl : url + '?format=html', // force html response format due to ExtJS form submission restriction 
					additionalFields : [{
						name : 'nodeRef',
						value : documentNodeRef
					}]
				},
				
				onSuccess : function(response) {
					attachmentsView.refresh();
				}
				
			}).show();
			
		}
		
		function selectRepositoryFile() {
			
			var
				me = this,
				selectFileWindow = Ext.create('Yamma.view.windows.SelectCMSFileWindow')
			;
	
			selectFileWindow.mon(selectFileWindow, 'fileselected', function(nodeRef, record) {
								
				var
					operation = selectFileWindow.getOperation(),
					fileName = selectFileWindow.getFileName()
				;				
				
				selectFileWindow.setLoading(true);
				
				Bluedolmen.Alfresco.jsonPost({
					
					url : url,
					
					dataObj : {
						nodeRef : documentNodeRef,
						attachmentRef : nodeRef,
						operation : operation,
						filename : fileName
					},
					
					onSuccess : function() {
						attachmentsView.refresh();
					},
					
					"finally" : function() {
						selectFileWindow.close();
					}
						
				});	
	
				return false; // do not close the window yet
				
			});
	
			selectFileWindow.show();
			
		}

	},
	

	
	onAttachmentSelect : function(grid, record, item, index, eOpts) {
		
		var 
			nodeRef = record.get('nodeRef'),
			mimetype = record.get('mimetype'),
			title = record.get('cm:title') || record.get('cm:name'),
			displayView = this.getDisplayView(),
			attachmentsView = this.getAttachmentsView(),
			documentNodeRef = attachmentsView.getDocumentNodeRef()
		;
		if (!nodeRef) return;
		
		displayView.showPreviewTab({
			nodeRef :nodeRef, 
			mimetype : mimetype,
			tabConfig : {
				title : title,
				iconCls : 'icon-attach',
				closable : true
			},
			parentRef : documentNodeRef
		});
		
	}
	
	
});