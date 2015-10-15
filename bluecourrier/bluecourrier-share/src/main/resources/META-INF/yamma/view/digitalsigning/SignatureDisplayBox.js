Ext.define('Yamma.view.digitalsigning.SignatureDisplayBox', {
	
	extend : 'Ext.container.Container',
	
	requires : [
	    'Yamma.utils.SignatureUtils'
	],
	
	nodeRef : null,
	allowMissing : true,
	signatureMissingMessage : "<strong>Pas encore de signature.</strong>",
	signatureMissing : true,
	
	alias : 'widget.signaturedisplaybox',
	
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    
	defaults : {
		width : '100%',
		padding : 4
	},
	
	WS_DS_IMAGE_URL : 'alfresco://bluedolmen/digital-signing/signature/image',
	WD_DS_SIGNATURE_URL : 'alfresco://bluedolmen/digital-signing/signature?allowmissing={allowMissing}',
	
	labelFirstValidity : 'De',
	labelLastValidity : 'à',

	initComponent : function() {
		
		var 
			me = this,
			imageSource = Bluedolmen.Alfresco.resolveAlfrescoProtocol(this.WS_DS_IMAGE_URL)
		;
		
		this.signatureTemplate = new Ext.XTemplate(
			'<div class="{signatureClass}">',
				'<div class="alias">{keyAlias}</div>',
				
				"<tpl if='hasImage'>",
					'<div class="image">', '<img src="' + imageSource + '" />', '</div>',
				'</tpl>',
				'<div class="subject">{keySubject}</div>',
				'<div class="validity">', 
					this.labelFirstValidity, ' <span class="first">{keyFirstValidity}</span>',
					this.labelLastValidity, ' <span class="last">{keyLastValidity}</span>',
				'</div>',
				'<div class="type">Type: {keyType}</div>',
			'</div>'
		);
	
		
		this.items = [
			{
				xtype : 'component',
				autoEl : 'div',
				itemId : 'signature-description',
				height : 250
			}
		],
		
		this.addEvents('load','signatureavailable');
		me.on('render', me.load, me);
		
		this.callParent();
		
	},
	
	load : function() {
		
		var 
			me = this,
			url = Bluedolmen.Alfresco.resolveAlfrescoProtocol(this.WD_DS_SIGNATURE_URL)
				.replace(/\{allowMissing\}/, me.allowMissing)		
		;
		
		// For local-users, we need to get the display-names from the server
		Bluedolmen.Alfresco.jsonRequest({
			
			url : url,
			
			onSuccess : function onSuccess(jsonResponse) {
				
				if (null == jsonResponse) return;
				
				me.signatureMissing = false;
				updateSignature(jsonResponse);
				
				me.fireEvent('signatureavailable', jsonResponse);
				
			},
			
			'finally' : function() {
				me.fireEvent('load');
			}
			
		});
		
		function updateSignature(keyDescription) {
			
			me.signatureMissing = !keyDescription.keySubject; 
			
			var sigDiv = me.queryById('signature-description');
			if (null == sigDiv) return;
			
			if (me.signatureMissing) {
				 Ext.DomHelper.overwrite(Ext.getDom(sigDiv.getEl()), me.signatureMissingMessage);
				 return;
			}
			
			keyDescription.keySubject = (keyDescription.keySubject + ',')
				.replace(/([A-Za-z]+)=([^,]*),/g, '<span class="field">$1=</span>$2<br/>')
//				.replace(/, ?/g,'<br/>')
			;
			keyDescription['signatureClass'] = 'signature';
			
			me.signatureTemplate.overwrite(sigDiv.getEl(), keyDescription);
			
		}
	}
	
});
