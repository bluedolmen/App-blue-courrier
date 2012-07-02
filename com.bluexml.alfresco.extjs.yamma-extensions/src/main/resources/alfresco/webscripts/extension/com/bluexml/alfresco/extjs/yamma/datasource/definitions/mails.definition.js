(function() {
	
	DatasourceDefinitions.register('Mails',
		{
			
			extend : 'Documents',
			baseSearchType : YammaModel.MAIL_TYPE_SHORTNAME,			
			
			fields : [
			
				YammaModel.MAIL_STAMP_DATE_PROPNAME,
				YammaModel.MAIL_DELIVERY_DATE_PROPNAME,
				YammaModel.MAIL_WRITING_DATE_PROPNAME,
				YammaModel.MAIL_OBJECT_PROPNAME,
				YammaModel.CORRESPONDENT_NAME_PROPNAME,
				YammaModel.CORRESPONDENT_ADDRESS_PROPNAME,
				YammaModel.CORRESPONDENT_CONTACT_EMAIL_PROPNAME,
				YammaModel.CORRESPONDENT_CONTACT_PHONE_PROPNAME
			
			]
	
		}
		
	);

})();