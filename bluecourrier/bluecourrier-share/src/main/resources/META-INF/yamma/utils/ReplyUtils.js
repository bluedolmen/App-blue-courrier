Ext.define('Yamma.utils.ReplyUtils', {
	
	singleton : true,
	
	requires : [
		'Ext.menu.Menu'
	],
	
	uses : [
	    'Yamma.view.windows.SelectCMSFileWindow'
	],
	
	REPLY_MAIL_URL : 'alfresco://bluedolmen/yamma/reply-mail',
	
	constructor : function() {
		this.REPLY_MAIL_URL = Bluedolmen.Alfresco.resolveAlfrescoProtocol(this.REPLY_MAIL_URL);
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
	
	replyFromItemAction : function(actionId, config) {
		
		if ('uploadFile' == actionId) {
			this.replyFromLocalFile(config);
		} 
		else if ('selectFile' == actionId) {
			this.replyFromRepository(config);
		}
		
	},

	/**
	 * 
	 * @param {{
	 * 	{string} documentNodeRef - the nodeRef of the replied document
	 * 	{string} [updatedReplyNodeRef] - the nodeRef of the updated reply
	 * 	{Function} [onSuccess] - the callback to be called on successful execution
	 * 	{Object[]} [additionalFields] - the additional fields to be given on upload request
	 * }} config 
	 */
	replyFromLocalFile : function(config) {
		
		config = config || {};
		
		var
			documentNodeRef = config.documentNodeRef,
			taskRef = config.taskRef,
			updatedReplyNodeRef = config.updateReplyNodeRef,
			onSuccess = config.onSuccess,
			additionalFields = config.additionalFields
		;
			
		additionalFields = (additionalFields || []).concat([
		    {
				name : 'nodeRef',
				value : documentNodeRef
			}
		]);

		if (updatedReplyNodeRef) {				
			additionalFields.push({
				name : 'updatedReplyRef',
				value : updatedReplyNodeRef
			});
		}
		
		if (taskRef){
			additionalFields.push({
				name : 'taskRef',
				value : taskRef
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
	
	/**
	 * 
	 * @param {{
	 * 	{string} documentNodeRef - the nodeRef of the replied document
	 * 	{Function} [onSuccess] - the callback to be called on successful execution
	 * }} config 
	 */
	replyFromRepository : function(config) {
				
		var
			documentNodeRef = config.documentNodeRef,
			taskRef = config.taskRef,
			onSuccess = config.onSuccess,
			
			me = this,
			selectFileWindow = Ext.create('Yamma.view.windows.SelectCMSFileWindow')
		;

		selectFileWindow.mon(selectFileWindow, 'fileselected', function(nodeRef, record) {
							
			var
				operation = selectFileWindow.getOperation(),
				fileName = selectFileWindow.getFileName()
			;				
			
			selectFileWindow.setLoading(true);
			
			Bluedolmen.Alfresco.jsonPost(
				{
					url : me.REPLY_MAIL_HTML_URL,
					dataObj : {
						nodeRef : documentNodeRef,
						taskRef : taskRef,
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
	
	/**
	 * @param replyNodeRef
	 * @param onSuccess
	 * @param skipConfirmation
	 */
	removeReply : function(replyNodeRef, onSuccess, skipConfirmation) {
		
		if (!replyNodeRef) return;
		
		var me = this;
		
		if (true === skipConfirmation) {
			deleteReply();
			return;
		}
		
		Bluedolmen.windows.ConfirmDialog.INSTANCE.askConfirmation(
			'Supprimer la réponse ?', /* title */
			'Etes-vous certain de vouloir supprimer la réponse ?', /* message */
			deleteReply /* onConfirmation */
		);
		
		function deleteReply() {
			
			var
				url = me.REPLY_MAIL_URL + '/' + replyNodeRef.replace(/:\//,'')
			;
			
			Bluedolmen.Alfresco.jsonRequest(
				{
					method : 'DELETE',
					url : url,
					onSuccess :onSuccess
				}
			);
			
		}
		
	}
	
	
	
});