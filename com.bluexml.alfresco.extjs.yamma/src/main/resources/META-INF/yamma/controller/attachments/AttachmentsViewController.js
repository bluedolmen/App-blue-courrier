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
	
	ATTACH_ACTION_WS_URL : 'alfresco://bluexml/yamma/attachment',
	
	init: function() {
		
		this.control({
			
			'attachmentsview #addAttachment' : {
				click : this.onAddAttachmentClick
			},
			
			'attachmentsview' : {
				select : this.onAttachmentSelect
			}
			
		});

		this.callParent(arguments);
		
	},
	
	/**
	 * Add-Button click-handler.
	 * 
	 * @private
	 */
	onAddAttachmentClick : function() {
		
		var
			attachmentsView = this.getAttachmentsView(),
			documentNodeRef = attachmentsView.getDocumentNodeRef(),
			url = Bluexml.Alfresco.resolveAlfrescoProtocol(
				this.ATTACH_ACTION_WS_URL
			)
		;
		
		
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
		
	},
	
	onAttachmentSelect : function(rowmodel, record, index, eOpts) {
		
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