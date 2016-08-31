Ext.define('Yamma.view.mails.gridactions.CertifyDocument', {
	
	extend : 'Yamma.view.mails.gridactions.SimpleTaskRefGridAction',
	
	requires : [
		'Yamma.view.digitalsigning.SignDocumentWindow',
		'Yamma.utils.SignatureUtils'
	],
	
	WS_PDF_INFORMATION_URL : 'alfresco://bluedolmen/digital-signing/pdf-information?nodeRef={nodeRef}',
	
	icon : Yamma.Constants.getIconDefinition('rosette').icon,
	tooltip : i18n.t('view.mails.gridactions.certifydocument.tooltip'),
	actionUrl : 'alfresco://bluedolmen/yamma/certify',
	
	taskName : ['bcogwf:certifyingTask'],
	actionName : 'Certify',
	
	dialogConfig : {
	},
	
	supportBatchedNodes : true,
	
	isAvailable : function(record) {
		
		var
			isAvailable_ = this.callParent(arguments),
			signedBy = record.get('ds:signed')
		;
		
		if (!Yamma.utils.SignatureUtils.isFeatureAvailable()) return false;
		
		return (isAvailable_ && false === signedBy);
		
	},		
	
	prepareBatchAction : function(records) {
		
		var
			me = this
		;
		
		if (!Ext.isIterable(records)) return;
		if (records.length == 0) return;
		
		var nodeRef = 1 == records.length ? records[0].get('nodeRef') : null;
		
		me.signatureDialog = me.getDialog({
			nodeRef : nodeRef,
			pageInformation : me.pageInformation,
			listeners : {
				click : function onClick(operation, button) {
					
					switch (operation) {
					case 'sign':
						sign();
					break;
					}
					
					me.signatureDialog.close();
					me.signatureDialog = null;
					
				}
			}
		});
		
		me.signatureDialog.show();
				
		function sign() {
			me.fireEvent('preparationReady', records, {} /* preparationContext */);
		}
		
	},
	
	getDialog : function(config) {
		return Ext.create('Yamma.view.digitalsigning.SignDocumentWindow', config);
	},
	
	getAdditionalRequestParameters : function(preparationContext) {
		
		if (null == this.signatureDialog) {
			return {};
		}
		
		var
			values = this.signatureDialog.getFormValues(),
			signatureLocation = values['signature-location'],
			
			extraParameters = {
				password : values['password'],
				reason : values['reason'] || '',
				location : values['location'] || '',
				"signed-target" : "FORCE_VERSION"
			}
		;
		
		if ('FIELD' == signatureLocation) {
			
			extraParameters['field-name'] = values['field-name'];
			
		}
		else if ('PAGE_NB' == signatureLocation) {
			
			extraParameters['page'] = values['page-number'];
			extraParameters['position'] = values['posX'] + ';' + values['posY'];
			extraParameters['size'] = values['rectW'] + 'x' + values['rectH'];
			
		}
		
		return (Ext.apply(extraParameters, preparationContext));
		
	},	
	
	
	onSuccess : function() {
		
		this.callParent();
		
		if (null != this.signatureDialog) {
			this.signatureDialog.close();
			this.signatureDialog = null;
		}
		
	}
	
});

