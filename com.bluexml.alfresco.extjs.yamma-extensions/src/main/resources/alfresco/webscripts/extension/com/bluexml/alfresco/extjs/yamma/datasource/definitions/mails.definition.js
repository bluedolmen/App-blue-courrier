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
				YammaModel.CORRESPONDENT_CONTACT_PHONE_PROPNAME,
				
				{
					name : YammaModel.MAIL_TYPE_SHORTNAME + '_hasReplies',
					type : 'boolean',
					evaluate : function(node) {
						return ReplyUtils.hasReplies(node);
					}
				}				
								
			
			],
			
			filters : {
				
				'discardReplies' : {
					
					applyQueryFilter : function(query, areRepliesDiscarded) {
						
						if ('true' !== Utils.asString(areRepliesDiscarded)) return query;

						return (query + ' -ASPECT:"' + YammaModel.REPLY_ASPECT_SHORTNAME + '"');						
						return query;
					}
					
				}
				
			}			
	
		}
		
	);

})();