var YammaModel = new (function(){
	
	var me = this;
	
	this.YAMMA_NS_PREFIX = 'yamma-ee';
	this.YAMMA_PREFIX = '';
	
	this.TRAY_TYPE_SHORTNAME = dfn('Tray');
	
	// DOCUMENT TYPE DEFINITION
	this.DOCUMENT_TYPE_SHORTNAME = dfn('Document');
	
	this.DOCUMENT_CONTAINER_SHORTNAME = dfn('DocumentContainer');
	this.DOCUMENT_CONTAINER_REFERENCE_ASSOCNAME = dfna(this.DOCUMENT_CONTAINER_SHORTNAME, this.DOCUMENT_TYPE_SHORTNAME, 'reference');

	// MAIL TYPE DEFINITION
	this.MAIL_TYPE_SHORTNAME = dfn('Mail');
	this.MAIL_SENT_DATE_PROPNAME = dfnp(this.MAIL_TYPE_SHORTNAME, 'sentDate');
	this.MAIL_WRITING_DATE_PROPNAME = dfnp(this.MAIL_TYPE_SHORTNAME, 'writingDate');
	this.MAIL_OBJECT_PROPNAME = dfnp(this.MAIL_TYPE_SHORTNAME, 'object');	
		
	// INBOUND_MAIL TYPE DEFINITION
	this.INBOUND_MAIL_TYPE_SHORTNAME = dfn('InboundMail');
	
	// OUTBOUND_MAIL_DEFINITION
	this.OUTBOUND_MAIL_TYPE_SHORTNAME = dfn('OutboundMail');
	
	// DATALISTS TYPE DEFINITIONS
	this.ASSIGNABLE_SITE_TYPE_SHORTNAME = dfn('AssignableSite');
	this.DELAY_TYPE_SHORTNAME = dfn('Delay');
	this.DELAY_DELAY_PROPNAME = dfnp(this.DELAY_TYPE_SHORTNAME, 'delay');
	this.PRIORITY_TYPE_SHORTNAME = dfn('Priority');
	this.PRIORITY_LEVEL_PROPNAME = dfnp(this.PRIORITY_TYPE_SHORTNAME, 'level');
	this.PRIVACY_LEVEL_TYPE_SHORTNAME = dfn('PrivacyLevel');
	this.STATUS_LEVEL_TYPE_SHORTNAME = dfn('Status');	
	
	// ASPECTS DEFINITIONS
	
	this.INBOUND_DOCUMENT_ASPECT_SHORTNAME = dfn('InboundDocument');
	this.INBOUND_DOCUMENT_DELIVERY_DATE_PROPNAME = dfnp(this.INBOUND_DOCUMENT_ASPECT_SHORTNAME, 'deliveryDate');
	this.INBOUND_DOCUMENT_ORIGIN_PROPNAME = dfnp(this.INBOUND_DOCUMENT_ASPECT_SHORTNAME, 'origin');
	
	// REPLY TYPE DEFINITION
	this.REPLY_ASPECT_SHORTNAME = dfn('Reply');
	this.REPLY_REPLY_TO_DOCUMENT_ASSOCNAME = dfna(this.REPLY_ASPECT_SHORTNAME, this.MAIL_TYPE_SHORTNAME, 'replyTo');	
	
	this.SIGNABLE_ASPECT_SHORTNAME = dfn('Signable');
	this.SIGNABLE_NEEDS_SIGNATURE_PROPNAME = dfnp(this.SIGNABLE_ASPECT_SHORTNAME, 'needsSignature');
	this.SIGNABLE_SIGNED_DATE_PROPNAME = dfnp(this.SIGNABLE_ASPECT_SHORTNAME, 'signedDate');
	
	this.COMMENTABLE_ASPECT_SHORTNAME = dfn('Commentable');
	this.COMMENTABLE_COMMENT_PROPNAME = dfnp(this.COMMENTABLE_ASPECT_SHORTNAME, 'comment');
	
	this.CORRESPONDENT_ASPECT_SHORTNAME = dfn('Correspondent');
	this.CORRESPONDENT_NAME_PROPNAME = dfnp(this.CORRESPONDENT_ASPECT_SHORTNAME, 'name');
	this.CORRESPONDENT_ADDRESS_PROPNAME = dfnp(this.CORRESPONDENT_ASPECT_SHORTNAME, 'address');
	this.CORRESPONDENT_CONTACT_EMAIL_PROPNAME = dfnp(this.CORRESPONDENT_ASPECT_SHORTNAME, 'contactEmail');
	this.CORRESPONDENT_CONTACT_PHONE_PROPNAME = dfnp(this.CORRESPONDENT_ASPECT_SHORTNAME, 'contactPhone');
	
	this.RECIPIENT_ASPECT_SHORTNAME = dfn('Recipient');
	this.RECIPIENT_NAME_PROPNAME = dfnp(this.RECIPIENT_ASPECT_SHORTNAME, 'name');
	this.RECIPIENT_ADDRESS_PROPNAME = dfnp(this.RECIPIENT_ASPECT_SHORTNAME, 'address');
	this.RECIPIENT_CONTACT_EMAIL_PROPNAME = dfnp(this.RECIPIENT_ASPECT_SHORTNAME, 'contactEmail');
	this.RECIPIENT_CONTACT_PHONE_PROPNAME = dfnp(this.RECIPIENT_ASPECT_SHORTNAME, 'contactPhone');
	
	this.REFERENCEABLE_ASPECT_SHORTNAME = dfn('Referenceable');
	this.REFERENCEABLE_REFERENCE_PROPNAME = dfnp(this.REFERENCEABLE_ASPECT_SHORTNAME, "reference");
	this.REFERENCEABLE_INTERNAL_REFERENCE_PROPNAME = dfnp(this.REFERENCEABLE_ASPECT_SHORTNAME, "internalReference");
	
	this.DIGITIZABLE_ASPECT_SHORTNAME = dfn('Digitizable');
	this.DIGITIZABLE_DIGITIZED_DATE_PROPNAME = dfnp(this.DIGITIZABLE_ASPECT_SHORTNAME, 'digitizedDate');
	
	this.ASSIGNABLE_ASPECT_SHORTNAME = dfn('Assignable');
	this.ASSIGNABLE_AUTHORITY_PROPNAME = dfnp(this.ASSIGNABLE_ASPECT_SHORTNAME, 'searchableAuthority');
	this.ASSIGNABLE_SERVICE_ASSOCNAME = dfna(this.ASSIGNABLE_ASPECT_SHORTNAME, this.ASSIGNABLE_SITE_TYPE_SHORTNAME, 'service');
	this.ASSIGNABLE_AUTHORITY_ASSOCNAME = dfna(this.ASSIGNABLE_ASPECT_SHORTNAME, 'cm:authority', 'authority');
	
	this.DISTRIBUTABLE_ASPECT_SHORTNAME = dfn('Distributable');
	this.DISTRIBUTABLE_SERVICES_ASSOCNAME = dfna(this.DISTRIBUTABLE_ASPECT_SHORTNAME, this.ASSIGNABLE_SITE_TYPE_SHORTNAME, 'services');
	
	this.PRIORITIZABLE_ASPECT_SHORTNAME = dfn('Prioritizable');
	this.PRIORITIZABLE_PRIORITY_ASSOCNAME = dfna(this.PRIORITIZABLE_ASPECT_SHORTNAME, this.PRIORITY_TYPE_SHORTNAME, 'priority');
	
	
	this.DUEABLE_ASPECT_SHORTNAME = dfn('Dueable');
	this.DUEABLE_DELAY_ASSOCNAME = dfna(this.DUEABLE_ASPECT_SHORTNAME, this.DELAY_TYPE_SHORTNAME, 'delay');
	this.DUEABLE_DUE_DATE_PROPNAME = dfnp(this.DUEABLE_ASPECT_SHORTNAME, 'dueDate');
	
	
	this.PRIVACY_ASPECT_SHORTNAME = dfn('Privacy');
	this.PRIVACY_PRIVACY_LEVEL_ASSOCNAME = dfna(this.PRIVACY_ASPECT_SHORTNAME, this.PRIVACY_LEVEL_TYPE_SHORTNAME, 'level');
	
	this.STATUSABLE_ASPECT_SHORTNAME = dfn('Statusable');
	this.STATUSABLE_EXTENDED_ASSOCNAME = dfna(this.STATUSABLE_ASPECT_SHORTNAME, this.STATUS_LEVEL_TYPE_SHORTNAME, 'extended');
	this.STATUSABLE_STATE_PROPNAME = dfnp(this.STATUSABLE_ASPECT_SHORTNAME, 'state');

	this.EVENT_TYPE_SHORTNAME = dfn('Event');
	this.EVENT_DATE_PROPNAME = dfnp(this.EVENT_TYPE_SHORTNAME, 'date');
	this.EVENT_EVENT_TYPE_PROPNAME = dfnp(this.EVENT_TYPE_SHORTNAME, 'eventType');
	this.EVENT_COMMENT_PROPNAME = dfnp(this.EVENT_TYPE_SHORTNAME, 'comment');
	this.EVENT_REFERRER_PROPNAME = dfnp(this.EVENT_TYPE_SHORTNAME, 'referrer');
	this.EVENT_DELEGATE_PROPNAME = dfnp(this.EVENT_TYPE_SHORTNAME, 'delegate');
	
	this.HISTORIZABLE_ASPECT_SHORTNAME = dfn('Historizable');
	this.HISTORIZABLE_HISTORY_ASSOCNAME = dfna(this.HISTORIZABLE_ASPECT_SHORTNAME, this.EVENT_TYPE_SHORTNAME, 'history');
	
	this.SERVICE_ASPECT_SHORTNAME = dfn('Service');
	this.SERVICE_CAN_SIGN_PROPNAME = dfnp(this.SERVICE_ASPECT_SHORTNAME, 'canSign');
	this.SERVICE_PARENT_ASSOCNAME = dfna(this.SERVICE_ASPECT_SHORTNAME, this.SERVICE_ASPECT_SHORTNAME, 'parent');
	
	this.SENT_BY_EMAIL_ASPECT_SHORTNAME = dfn('SentByEmail');
	this.SENT_BY_EMAIL_SENT_DATE_PROPNAME = dfnp(this.SENT_BY_EMAIL_ASPECT_SHORTNAME, 'sentDate');
	this.SENT_BY_EMAIL_LAST_FAILURE_DATE_PROPNAME = dfnp(this.SENT_BY_EMAIL_ASPECT_SHORTNAME, 'lastFailureDate');
	
	this.SENT_BY_POSTAL_SERVICES_ASPECT_SHORTNAME = dfn('SentByPostalServices');
	this.SENT_BY_POSTAL_SERVICES_ASSIGNED_SERVICE_PROPNAME = dfnp(this.SENT_BY_POSTAL_SERVICES_ASPECT_SHORTNAME, 'assignedService');
	
	this.DOCUMENT_STATE_PENDING = 'pending';
	this.DOCUMENT_STATE_DELIVERING = 'delivering';
	this.DOCUMENT_STATE_VALIDATING_DELIVERY = 'validating!delivery';
	this.DOCUMENT_STATE_PROCESSING = 'processing';
	this.DOCUMENT_STATE_REVISING = 'revising';
	this.DOCUMENT_STATE_VALIDATING_PROCESSED = 'validating!processed';
	this.DOCUMENT_STATE_SENDING = 'sending';
	this.DOCUMENT_STATE_SIGNING = 'signing';
	this.DOCUMENT_STATE_PROCESSED = 'processed';
	this.DOCUMENT_STATE_ARCHIVED = 'archived';
	this.DOCUMENT_STATE_UNKNOWN = 'unknown';
	this.DOCUMENT_STATES = [
		this.DOCUMENT_STATE_PENDING,
		this.DOCUMENT_STATE_DELIVERING,
		this.DOCUMENT_STATE_VALIDATING_DELIVERY,
		this.DOCUMENT_STATE_PROCESSING,
		this.DOCUMENT_STATE_REVISING,
		this.DOCUMENT_STATE_VALIDATING_PROCESSED,
		this.DOCUMENT_STATE_SIGNING,
		this.DOCUMENT_STATE_SENDING,
		this.DOCUMENT_STATE_PROCESSED,
		this.DOCUMENT_STATE_ARCHIVED
	];
	
	this.LATE_STATE_UNDETERMINED = 'undetermined';
	this.LATE_STATE_LATE = 'late';
	this.LATE_STATE_ONTIME = 'onTime';
	this.LATE_STATE_HURRY = 'hurry';
	this.LATE_STATES = [
		this.LATE_STATE_UNDETERMINED,
		this.LATE_STATE_LATE,
		this.LATE_STATE_HURRY,
		this.LATE_STATE_ONTIME
	];
	
	this.ORIGIN_DIGITIZED = 'digitized';
	this.ORIGIN_MANUAL = 'manual';
	this.ORIGIN_IMAP = 'imap';
	this;ORIGINS = [
		this.ORIGIN_DIGITIZED,
		this.ORIGIN_MANUAL,
		this.ORIGIN_IMAP
	];
	
	/**
	 * Get the declaration full-name based on the composition of the namespace prefix
	 * and of the prefix.
	 */
	function dfn(shortName, prefix) {
		return me.YAMMA_NS_PREFIX + ':' + me.YAMMA_PREFIX + shortName;
	}
	
	function dfnp(classShortName, attributeName) {
		return classShortName + '_' + attributeName;
	}
	
	function dfna(sourceClassShortName, targetClassShortName, assocName) {
		return me.YAMMA_NS_PREFIX + ':' + localName(sourceClassShortName) + '_' + assocName + '_' + localName(targetClassShortName);
		
		function localName(classShortName) {
			if (!classShortName) return classShortName;
			
			var colonPosition = classShortName.indexOf(':');
			if (colonPosition == -1) return classShortName;
			
			return classShortName.substr(colonPosition + 1);
		}
		
	}

	
	
});


