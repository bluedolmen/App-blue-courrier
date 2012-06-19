(function() {
	
	DatasourceDefinitions.register('Mails',
		{
			
			extend : 'Documents',
			baseSearchType : MAIL_TYPE_SHORTNAME,			
			
			fields : [
			
				MAIL_STAMP_DATE_PROPNAME,
				MAIL_DELIVERY_DATE_PROPNAME,
				MAIL_WRITING_DATE_PROPNAME,
				MAIL_OBJECT_PROPNAME,
				CORRESPONDENT_NAME_PROPNAME,
				CORRESPONDENT_ADDRESS_PROPNAME,
				CORRESPONDENT_CONTACT_EMAIL_PROPNAME,
				CORRESPONDENT_CONTACT_PHONE_PROPNAME
			
			]
	
		}
		
	);

})();