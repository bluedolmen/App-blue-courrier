(function() {
	
	DatasourceDefinitions.register('Mails',
		{
			
			extend : 'Documents',
			
			fields : [
			
				YammaModel.MAIL_SENT_DATE_PROPNAME,
				YammaModel.MAIL_WRITING_DATE_PROPNAME,
				YammaModel.MAIL_OBJECT_PROPNAME,
				
				YammaModel.INBOUND_DOCUMENT_DELIVERY_DATE_PROPNAME,
				
				YammaModel.CORRESPONDENT_NAME_PROPNAME,
				YammaModel.CORRESPONDENT_ADDRESS_PROPNAME,
				YammaModel.CORRESPONDENT_CONTACT_EMAIL_PROPNAME,
				YammaModel.CORRESPONDENT_CONTACT_PHONE_PROPNAME
			
			]
	
		}
		
	);

})();