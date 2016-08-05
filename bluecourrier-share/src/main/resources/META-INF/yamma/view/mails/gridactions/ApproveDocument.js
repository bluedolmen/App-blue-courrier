Ext.define('Yamma.view.mails.gridactions.ApproveDocument', {
	
	extend : 'Yamma.view.mails.gridactions.SimpleTaskRefGridAction',
	
	requires : [
		'Yamma.view.dialogs.OutgoingSigningDialog',
		'Yamma.utils.SignatureUtils'
	],
	
	WS_PDF_INFORMATION_URL : 'alfresco://bluedolmen/digital-signing/pdf-information?nodeRef={nodeRef}',
	
	icon : Yamma.Constants.getIconDefinition('text_signature').icon,
	tooltip : 'Approuver électroniquement le document',
	actionUrl : 'alfresco://bluedolmen/yamma/certify',
	
	taskName : ['bcogwf:certifyingTask'],
	actionName : 'Certify',
	
	supportBatchedNodes : false,
	
//	getParameters : function(record) {
//		
//		var task = this.getFirstMatchingTask(record);
//		return [task];
//		
//	},	
//	
	isAvailable : function(record) {
		
		var
			isAvailable_ = this.callParent(arguments),
			signedBy = record.get('ds:signed')
		;
		
		if (!Yamma.utils.SignatureUtils.isFeatureAvailable()) return false;
		
		return (isAvailable_) && false !== signedBy;
		
	},		
	
	prepareBatchAction : function(records) {
		
		var
			me = this
		;
		
		if (!Ext.isIterable(records)) return;
		if (records.length == 0) return;
		
		var 
			nodeRef = 1 == records.length ? records[0].get('nodeRef') : null,
			firstMatchingTask = this.getFirstMatchingTask(records[0])
		;
		
		Ext.define('Yamma.view.mails.gridactions.ApproveDocument.OutgoingSigningDialog', {
			
			extend : 'Yamma.view.dialogs.OutgoingSigningDialog',
			
			performOperation : function(action) {
				
				this.signatureDialog.setLoading(true);
				me.fireEvent('preparationReady', records, {
					action : action
				} /* preparationContext */);
				
			}
				
		}, function() {
			
			me.signatureDialog = new this({
				nodeRef : nodeRef,
				taskRef : firstMatchingTask.id
			});
			
			me.signatureDialog.show();
			
		});
			
	},
	
	getAdditionalRequestParameters : function(preparationContext) {
		
		if (null == this.signatureDialog) {
			return {};
		}
		
		var
			values = this.signatureDialog.getSigningInformation(),
			signatureLocation = values['signature-location'],
			
			extraParameters = {
				password : values['password'],
				reason : values['reason'] || '',
				location : values['location'] || ''
			}
		;
		
		return (Ext.apply(extraParameters, preparationContext));
		
	},	
	
	onSuccess : function() {
		
		this.callParent();
		
		if (null != this.signatureDialog) {
			this.signatureDialog.close();
			this.signatureDialog = null;
		}
		
	},
	
	onActionComplete : function(status, action, grid) {
		
		this.callParent();
		if (this.signatureDialog) {
			this.signatureDialog.setLoading(false);
		}

	}
	
});

