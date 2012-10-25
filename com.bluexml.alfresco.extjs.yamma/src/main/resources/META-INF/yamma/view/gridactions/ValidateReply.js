Ext.define('Yamma.view.gridactions.ValidateReply', {

	requires : [
		'Yamma.utils.datasources.Documents'
	],
	
	uses : [
		'Bluexml.windows.ConfirmDialog',
		'Bluexml.windows.CommentInputDialog'
	],
	
	statics : {
		ICON : Yamma.Constants.getIconDefinition('email_tick'),
		LABEL : 'Valider courrier sortant',
		FIELD : Yamma.utils.datasources.Documents.DOCUMENT_USER_CAN_VALIDATE,
		ICON_OK : Yamma.Constants.getIconDefinition('email_tick'),
		ICON_REFUSE : Yamma.Constants.getIconDefinition('email_cross'),
		ICON_DELEGATE : Yamma.Constants.getIconDefinition('email_group'),
		ICON_SERVICE : Yamma.Constants.getIconDefinition('group'),
		ACTION_WS_URL : 'alfresco://bluexml/yamma/validate-reply'
	},
	
	DIALOG_CONFIG : {
		
		'accept' : {
			CONFIRM_MESSAGE : "Validez-vous l'envoi de la réponse à l'expéditeur ?",
			CONFIRM_TITLE : 'Valider la réponse',
			CONFIRM_TYPE : 'yesno'
		},
		
		'refuse' : {
			CONFIRM_MESSAGE : "Quelle est la raison de ce refus ?",
			CONFIRM_TITLE : 'Refuser la réponse',
			CONFIRM_TYPE : 'comment'
		},
		
		'delegate' : {
			CONFIRM_MESSAGE : "Quelle est la raison de cette délégation (hors procédure standard) ?",
			CONFIRM_TITLE : 'Déléguer la validation',
			CONFIRM_TYPE : 'comment'
		}
		
	},
	
	getAcceptReplyActionDefinition : function() {
		
		return this.getValidateReplyActionDefinition(
			'accept', /* validateOperation */
			Yamma.view.gridactions.ValidateReply.ICON_OK.icon, /* icon */
			'Valider l\'envoi de la réponse' /* tooltip */
		);
		
	},
	
	getRefuseReplyActionDefinition : function() {
		
		return this.getValidateReplyActionDefinition(
			'refuse', /* validateOperation */
			Yamma.view.gridactions.ValidateReply.ICON_REFUSE.icon, /* icon */
			'Refuser l\'envoi de la réponse' /* tooltip */
		);
		
	},
	
	getDelegateValidationActionDefinition : function() {
		
		var me = this;
		
		return Ext.apply(
			this.getValidateReplyActionDefinition(
				'delegate', /* validateOperation */
				Yamma.view.gridactions.ValidateReply.ICON_DELEGATE.icon, /* icon */
				"Déléguer la validation à un autre service", /* tooltip */
				this.onDelegateValidationAction /* handler */
			),
			{
				getClass : function(value, meta, record) {
					if (me.canDelegateValidation(record)) return '';
					else return (Ext.baseCSSPrefix + 'hide-display');
				}
			}
		);
		
	},
	
	getValidateReplyActionDefinition : function(validateOperation, icon, tooltip, handler) {
		
		var me = this;
		
		return	{
			icon : icon,
			tooltip : tooltip,
			handler : handler ? handler : this.onValidateReplyAction,
			scope : this,
			getClass : function(value, meta, record) {
				if (!me.canLaunchValidateReplyAction(record)) return (Ext.baseCSSPrefix + 'hide-display');
				return '';
			},
			validateOperation : validateOperation
		};
		
	},
	
	canLaunchValidateReplyAction : function(record) {
		var userCanValidate = record.get(Yamma.view.gridactions.ValidateReply.FIELD);
		return userCanValidate;
	},
	
	canDelegateValidation : function(record) {
		var hasDelegatedSites = record.get(Yamma.utils.datasources.Documents.DOCUMENT_HAS_DELEGATED_SITES_QNAME);
		return this.canLaunchValidateReplyAction(record) && hasDelegatedSites;
	},
	
	onValidateReplyAction : function(grid, rowIndex, colIndex, item, e) {
		
		var 
			record = grid.getStore().getAt(rowIndex),
			documentNodeRef = this.getDocumentNodeRefRecordValue(record),
			validateOperation = item.validateOperation
		;
		
		if (!validateOperation) {
			Ext.Error.raise('IllegalStateException! Cannot get the reply-validation action');
		}
		this.validateReply(documentNodeRef, validateOperation);
		
		return false;
	},
	
	validateReply : function(documentNodeRef, operation, extraParams) {
		
		var
			me = this,
			dialogConfig = me.DIALOG_CONFIG[operation],
			askForComment = ('comment' === dialogConfig.CONFIRM_TYPE),
			url = Bluexml.Alfresco.resolveAlfrescoProtocol(
				Yamma.view.gridactions.ValidateReply.ACTION_WS_URL
			);
		;
		
		if (askForComment) askComment();
		else askConfirmation();
		
		function askComment() {
			
			Bluexml.windows.CommentInputDialog.askForComment(
				{
					title : dialogConfig.CONFIRM_TITLE,
					msg : dialogConfig.CONFIRM_MESSAGE,
					modal : true
				}, /* overrideConfig */
				onCommentAvailable
			);
			
			function onCommentAvailable(comment) {
				performAction(comment);
			}
			
		}
		
		function askConfirmation () {
			
			Bluexml.windows.ConfirmDialog.FR.askConfirmation({
				title : dialogConfig.CONFIRM_TITLE,
				msg : dialogConfig.CONFIRM_MESSAGE,
				onConfirmation : performAction
			});
			
		};		
		
		function performAction(comment) {
			Bluexml.Alfresco.jsonPost(
				{
					url : url,
					dataObj : Ext.applyIf(
						{
							nodeRef : documentNodeRef,
							operation : operation,
							comment : comment || ''
						}, 
						extraParams
					)
				},
				
				function(jsonResponse) { /* onSuccess */
					me.refresh(); 
				}
			);
		}
		
	},
	
	onDelegateValidationAction : function(grid, rowIndex, colIndex, item, e) {
		var 
			record = grid.getStore().getAt(rowIndex),
			documentNodeRef = this.getDocumentNodeRefRecordValue(record)
		;
		
		this.displayDelegatedServicesMenu(documentNodeRef, e.getXY());
	},
	
	/**
	 * @private
	 */
	displayDelegatedServicesMenu : function(documentNodeRef, xyPosition) {
		
		var 
			me = this			
		;
		
		loadDataSource();
		
		function loadDataSource() {
			
			Yamma.store.YammaStoreFactory.requestNew({
				
				storeId : 'DelegatedServices',
				onStoreCreated : loadStore, 
				proxyConfig : {
	    			extraParams : {
	    				'@nodeRef' : documentNodeRef
	    			}
	    		}
				
			});
			
			function loadStore(store) {
				
				store.load({
				    scope   : me,
				    callback: function(records, operation, success) {
				    	if (!success) return;
				    	
						var menu = buildMenu(records);
						if (!menu) return;
						
						menu.showAt(xyPosition);
				    }
				});
				
			}
		}		
		
		function buildMenu(records) {
			
			if (!records || records.length == 0) return;
			
			var 
				menuItems = []
			;
			
	    	Ext.Array.forEach(records, function(record) {
	    		
	    		var
	    			shortName = record.get('cm:name'),
	    			title = record.get('cm:title')
	    		;
	    		
	    		menuItems.push({
	    			text : title,
	    			shortName : shortName,
	    			iconCls : Yamma.view.gridactions.ValidateReply.ICON_SERVICE.iconCls
	    		});
	    		
	    	});
			
    		return Ext.create('Ext.menu.Menu', {
    		    //width: 100,
    		    margin: '0 0 10 0',
    		    renderTo: Ext.getBody(),
    		    items: menuItems,
    		    listeners : {
    		    	click : onItemClick
    		    }
    		});
    		
		}
		
		function onItemClick(menu, item, event, eOpts) {
			
			var serviceName = item.shortName;
			me.validateReply(
				documentNodeRef /* documentNodeRef */, 
				'delegate' /* operation */, 
				{service : serviceName} /* extraParams */
			);
			
		}
		
	},	
	
	getDocumentNodeRefRecordValue : function(record) {
		throw new Error('Should be redefined by the including class');
	}	
	
});