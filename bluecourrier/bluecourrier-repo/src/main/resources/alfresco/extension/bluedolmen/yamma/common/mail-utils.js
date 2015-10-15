(function() {
	
	MailUtils = {
			
		MAIL_KIND_INCOMING : 'incoming',
		MAIL_KIND_OUTGOING : 'outgoing',
		
		isMail : function(node) {
			return (
				null != node &&
				'undefined' != typeof node.hasAspect &&
				node.hasAspect(YammaModel.MAIL_ASPECT_SHORTNAME)
			);
		},		
		
		isIncomingMail : function(document) {
			return (
				MailUtils.isMail(document) &&
				document.hasAspect(YammaModel.INBOUND_DOCUMENT_ASPECT_SHORTNAME)
			);
		},
		
		isOutcomingMail : function(document) {
			
			return (
				null != document &&
				MailUtils.isMail(document) &&
				document.hasAspect(YammaModel.OUTBOUND_DOCUMENT_ASPECT_SHORTNAME)
			);
			
		},
		
		getKind : function(document) {
			
			var kind = '';
			
			if (MailUtils.isIncomingMail(document)) {
				kind += MailUtils.MAIL_KIND_INCOMING;
			}
			else if (MailUtils.isOutcomingMail(document)) {
				kind += MailUtils.MAIL_KIND_OUTGOING;
			}
			
			if (!kind) return null;
			
			kind += DocumentUtils.isCopy(document) ? '-copy' : '-mail';
			
			return kind;
			
		}

	}
	
})();
