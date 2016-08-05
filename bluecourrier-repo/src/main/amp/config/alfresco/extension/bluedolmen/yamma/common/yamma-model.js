var YammaModel = new (function(){
	
	var me = this;
	
	this.YAMMA_NS_PREFIX = 'bluecourrier';
	this.YAMMA_PREFIX = '';
	
	this.TRAY_ASPECT_SHORTNAME = dfn('tray');
	this.TRAY_KIND_PROPNAME = dfn('trayKind');
	
	// DOCUMENT DEFINITION
	this.DOCUMENT_ASPECT_SHORTNAME = dfn('document');
	
	this.DOCUMENT_CONTAINER_SHORTNAME = dfn('documentContainer');
	this.DOCUMENT_CONTAINER_REFERENCE_ASSOCNAME = dfn('referenceDocument');

	// MAIL DEFINITION
	this.MAIL_ASPECT_SHORTNAME = dfn('mail');
	this.MAIL_SENT_DATE_PROPNAME = dfn('sentDate');
	this.MAIL_WRITING_DATE_PROPNAME = dfn('writingDate');
	this.MAIL_OBJECT_PROPNAME = dfn('object');	
	
	// DATALISTS TYPE DEFINITIONS
	this.DELAY_TYPE_SHORTNAME = dfn('delayItem');
	this.DELAY_DELAY_PROPNAME = dfn('delayInDays');
	
	this.PRIORITY_TYPE_SHORTNAME = dfn('priorityItem');
	this.PRIORITY_LEVEL_PROPNAME = dfn('level');
	
	this.STATUS_LEVEL_TYPE_SHORTNAME = dfn('statusItem');
	
	this.PRIVACY_LEVEL_TYPE_SHORTNAME = dfn('privacyLevelItem');
	this.PRIVACY_LEVEL_RESTRICTED_PROPNAME = dfn('restricted');
	this.PRIVACY_LEVEL_DISCARD_EXISTING_PROPNAME = dfn('discardExisting');
	this.PRIVACY_LEVEL_ASSISTANT_ROLE_PROPNAME = dfn('assistantRole');
	this.PRIVACY_LEVEL_MANAGER_ROLE_PROPNAME = dfn('managerRole');
	this.PRIVACY_LEVEL_INSTRUCTOR_ROLE_PROPNAME = dfn('instructorRole');
	this.PRIVACY_LEVEL_SUPERVISOR_ROLE_PROPNAME = dfn('supervisorRole');

	this.DELIVERY_MODEL_TYPE_SHORTNAME = dfn('deliveryModelItem');
	
	// INBOUND DOCUMENT
	this.INBOUND_DOCUMENT_ASPECT_SHORTNAME = dfn('inboundDocument');
	this.INBOUND_DOCUMENT_DELIVERY_DATE_PROPNAME = dfn('deliveryDate');
	this.INBOUND_DOCUMENT_ORIGIN_PROPNAME = dfn('origin');
	
	// OUTBOUND DOCUMENT
	this.OUTBOUND_DOCUMENT_ASPECT_SHORTNAME = dfn('outboundDocument');
	
	// REPLY
	this.REPLY_ASPECT_SHORTNAME = dfn('reply');
	this.REPLY_REPLY_TO_DOCUMENT_ASSOCNAME = dfn('replyTo');	
	
	// COPY
	this.COPIED_FROM_ASPECT_SHORTNAME = dfn('copiedfrom');
	this.COPIED_FROM_ORIGINAL_ASSOCNAME = dfn('originalDocument');

	this.SIGNABLE_ASPECT_SHORTNAME = dfn('signable');
	this.SIGNABLE_NEEDS_SIGNATURE_PROPNAME = dfn('needsSignature');
	this.SIGNABLE_SIGNED_DATE_PROPNAME = dfn('signedDate');
	
	this.SENDER_ASPECT_SHORTNAME = dfn('sender');
	this.SENDER_ORGANIZATION_NAME_PROPNAME = dfn('senderOrganizationName');
	this.SENDER_EMAIL_PROPNAME = dfn('senderEmail');
	this.SENDER_TELEPHONE_PROPNAME = dfn('senderTelephone');
	this.SENDER_ADDRESS_PROPNAME = dfn('senderAddress');
	this.SENDER_POSTCODE_PROPNAME = dfn('senderPostcode');
	this.SENDER_CITY_PROPNAME = dfn('senderCity');
	this.SENDER_COUNTRY_PROPNAME = dfn('senderCountry');
	this.SENDER_INSTRUCTOR_NAME_PROPNAME = dfn('senderInstructorName');
	this.SENDER_INSTRUCTOR_JOB_TITLE_PROPNAME = dfn('senderInstructorJobTitle');
	this.SENDER_INSTRUCTOR_EMAIL_PROPNAME = dfn('senderInstructorEmail');
	this.SENDER_INSTRUCTOR_TELEPHONE_PROPNAME = dfn('senderInstructorTelephone');
	this.SENDER_INSTRUCTOR_MOBILE_PROPNAME = dfn('senderInstructorMobile');
	this.SENDER_SIGNATOR_NAME_PROPNAME = dfn('senderSignatorName');
	this.SENDER_SIGNATOR_JOB_TITLE_PROPNAME = dfn('senderSignatorJobTitle');
	this.SENDER_SIGNATOR_EMAIL_PROPNAME = dfn('senderSignatorEmail');
	this.SENDER_SIGNATOR_TELEPHONE_PROPNAME = dfn('senderSignatorTelephone');
	this.SENDER_SIGNATOR_MOBILE_PROPNAME = dfn('senderSignatorMobile');
	this.SENDER_ORGANIZATION_ASSOCNAME = dfn('senderOrganizationEntry');
	this.SENDER_INSTRUCTOR_ASSOCNAME = dfn('senderInstructorPersonEntry');
	this.SENDER_SIGNATOR_ASSOCNAME = dfn('senderSignatorPersonEntry');
	
	this.RECIPIENT_ASPECT_SHORTNAME = dfn('recipient');
	this.RECIPIENT_ORGANIZATION_NAME_PROPNAME = dfn('organizationName');
	this.RECIPIENT_RECIPIENT_NAME_PROPNAME = dfn('recipientName');
	this.RECIPIENT_EMAIL_PROPNAME = dfn('recipientEmail');
	this.RECIPIENT_TELEPHONE_PROPNAME = dfn('recipientTelephone');
	this.RECIPIENT_JOB_TITLE_PROPNAME = dfn('recipientJobTitle'); // NOT jobTitle as it should be (error in the model)
	this.RECIPIENT_ADDRESS_PROPNAME = dfn('recipientAddress');
	this.RECIPIENT_POSTCODE_PROPNAME = dfn('recipientPostcode');
	this.RECIPIENT_CITY_PROPNAME = dfn('recipientCity');
	this.RECIPIENT_COUNTRY_PROPNAME = dfn('recipientCountry');
	this.RECIPIENT_ORGANIZATION_ASSOCNAME = dfn('recipientOrganizationEntry');
	this.RECIPIENT_RECIPIENT_ASSOCNAME = dfn('recipientPersonEntry');
	
	this.REFERENCEABLE_ASPECT_SHORTNAME = dfn('referenceable');
	this.REFERENCEABLE_REFERENCE_PROPNAME = dfn("reference");
	this.REFERENCEABLE_INTERNAL_REFERENCE_PROPNAME = dfn("internalReference");
	
	this.DIGITIZABLE_ASPECT_SHORTNAME = dfn('digitizable');
	this.DIGITIZABLE_DIGITIZED_DATE_PROPNAME = dfn('digitizedDate');
	
	this.ASSIGNABLE_ASPECT_SHORTNAME = dfn('assignable');
	this.ASSIGNABLE_AUTHORITY_PROPNAME = dfn('searchableAuthority');
	this.ASSIGNABLE_AUTHORITY_ASSOCNAME = dfn('assignedAuthority');
	
	this.DISTRIBUTABLE_ASPECT_SHORTNAME = dfn('distributable');
	this.DISTRIBUTABLE_SHARES_PROPNAME = dfn('shares');
	this.DISTRIBUTABLE_PROCESS_KIND_PROPNAME = dfn('processKind');
	this.DISTRIBUTABLE_VALIDATE_DELIVERY_PROPNAME = dfn('validateDelivery');
	this.DISTRIBUTABLE_START_DELIVERY_PROPNAME = dfn('startDelivery');
	
	this.PRIORITIZABLE_ASPECT_SHORTNAME = dfn('prioritizable');
	this.PRIORITIZABLE_PRIORITY_PROPNAME = dfn('priority');
	
	this.DUEABLE_ASPECT_SHORTNAME = dfn('dueable');
	this.DUEABLE_DELAY_PROPNAME = dfn('delay');
	this.DUEABLE_DUE_DATE_PROPNAME = dfn('dueDate');
	
	this.PRIVACY_ASPECT_SHORTNAME = dfn('privacy');
	this.PRIVACY_PRIVACY_LEVEL_PROPNAME = dfn('privacyLevel');
	
	this.STATUSABLE_ASPECT_SHORTNAME = dfn('statusable');
	this.STATUSABLE_EXTENDED_ASSOCNAME = dfn('extendedStatus');
	this.STATUSABLE_STATUS_PROPNAME = dfn('status');

	this.EVENT_TYPE_SHORTNAME = dfn('event');
	this.EVENT_DATE_PROPNAME = dfn('eventDate');
	this.EVENT_EVENT_TYPE_PROPNAME = dfn('eventType');
	this.EVENT_DESCRIPTION_PROPNAME = dfn('eventDescription');
	this.EVENT_REFERRER_PROPNAME = dfn('referrer');
	this.EVENT_DELEGATE_PROPNAME = dfn('delegate');
	
	this.HISTORY_TYPE_SHORTNAME = dfn('history');
	this.HISTORY_EVENT_ASSOCNAME = dfn('events');
	
	this.HISTORIZABLE_ASPECT_SHORTNAME = dfn('historizable');
	this.HISTORIZABLE_HISTORY_ASSOCNAME = dfn('historyContainer');
	
	this.SERVICE_ASPECT_SHORTNAME = dfn('service');
	this.SERVICE_CAN_SIGN_PROPNAME = dfn('canSign');
	this.SERVICE_PARENT_ASSOCNAME = dfn('parentService');
	
	this.SENT_BY_EMAIL_ASPECT_SHORTNAME = dfn('sentByEmail');
	this.SENT_BY_EMAIL_SENT_DATE_PROPNAME = dfn('sentByEmailDate');
	this.SENT_BY_EMAIL_LAST_FAILURE_DATE_PROPNAME = dfn('lastSentByEmailFailureDate');
	
	this.FOLLOWING_ASPECT_SHORTNAME = dfn('following');
	this.FOLLOWING_FOLLOWED_BY_PROPNAME = dfn('followedBy');
	
	this.PROCESSED_ASPECT_SHORTNAME = dfn('processed');
	this.PROCESSED_BY_PROPNAME = dfn('processedBy');
	
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
//		this.DOCUMENT_STATE_VALIDATING_DELIVERY,
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
	this.ORIGINS = [
		this.ORIGIN_DIGITIZED,
		this.ORIGIN_MANUAL,
		this.ORIGIN_IMAP
	];
	
	this.TRAY_KIND_INBOX = 'INBOX';
	this.TRAY_KIND_OUTBOX = 'OUTBOX';
	this.TRAY_KIND_CCBOX = 'CCBOX';
	this.TRAY_KINDS = [
		this.TRAY_KIND_INBOX,
		this.TRAY_KIND_OUTBOX,
		this.TRAY_KIND_CCBOX
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


