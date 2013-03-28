Ext.define('Yamma.utils.ReplyUtils', {
	
	singleton : true,
	
	REPLY_MAIL_URL : 'alfresco://bluexml/yamma/reply-mail',
	
	constructor : function() {
		this.REPLY_MAIL_URL = Bluexml.Alfresco.resolveAlfrescoProtocol(this.REPLY_MAIL_URL);
		// force html response format due to ExtJS form submission restriction;
		this.REPLY_MAIL_HTML_URL = this.REPLY_MAIL_URL + '?format=html'; 
	},
	
	getFileSelectionReplyMenu : function(onItemClick) {
		
		var
			fileSelectionMenu = Ext.create('Ext.menu.Menu', {
				title : "Source",
			    plain: true,
			    renderTo: Ext.getBody(),
			    items : [
					{
						text : 'Fichier local',
						iconCls : Yamma.Constants.getIconDefinition('page_add').iconCls,
						action : 'uploadFile'
					},
					{
						text : 'Fichier GED',
						iconCls : Yamma.Constants.getIconDefinition('database_add').iconCls,
						action : 'selectFile'
					}
				],
				listeners : {
					click : onItemClick 
				}
			})
		;
		
		return fileSelectionMenu;
		
	},
	
	replyFromItemAction : function(actionId, documentNodeRef, updatedReplyNodeRef, onSuccess) {
		
		if ('uploadFile' == actionId) {
			this.replyFromLocalFile(
				documentNodeRef,
				updatedReplyNodeRef,
				onSuccess
			);			
		} else if ('selectFile' == actionId) {
			this.replyFromRepository(
				documentNodeRef,
				updatedReplyNodeRef,
				onSuccess
			);
		}
		
	},

	replyFromLocalFile : function(documentNodeRef, updatedReplyNodeRef, onSuccess, additionalFields) {
			
		additionalFields = (additionalFields || []).concat({
			name : 'nodeRef',
			value : documentNodeRef
		});

		if (updatedReplyNodeRef) {				
			additionalFields.push({
				name : 'updatedReplyRef',
				value : updatedReplyNodeRef
			});
		}

		Ext.create('Yamma.view.windows.UploadFormWindow', {
			
			title : 'Choisissez un fichier en <b>réponse</b>',
			
			formConfig : {
				uploadUrl : this.REPLY_MAIL_HTML_URL, 
				additionalFields : additionalFields
			},
			
			onSuccess : onSuccess
			
		}).show();
		
	},
	
	replyFromRepository : function(documentNodeRef, updatedReplyNodeRef, onSuccess) {
				
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
			
			Bluexml.Alfresco.jsonPost(
				{
					url : me.REPLY_MAIL_HTML_URL,
					dataObj : {
						nodeRef : documentNodeRef,
						modelRef : nodeRef,
						operation : operation,
						filename : fileName
					},
					
					onSuccess : function() {
						onSuccess();
						selectFileWindow.close();
					},
					
					onFailure : function() {
						selectFileWindow.close();
					}
				}
			);	

			return false; // do not close the window yet
		});

		selectFileWindow.show();
		
	},
	
	removeReply : function(replyNodeRef, onSuccess) {
		
		if (!replyNodeRef) return;
		
		var me = this;
		
		Bluexml.windows.ConfirmDialog.INSTANCE.askConfirmation(
			'Supprimer la réponse ?', /* title */
			'êtes-vous certain de vouloir supprimer la réponse ?', /* message */
			deleteReply /* onConfirmation */
		);
		
		function deleteReply() {
			
			var
				url = me.REPLY_MAIL_URL + '/' + replyNodeRef.replace(/:\//,'')
			;
			
			Bluexml.Alfresco.jsonRequest(
				{
					method : 'DELETE',
					url : url,
					onSuccess :onSuccess
				}
			);
			
		}
		
	}	
	
	
	
});