var YammaModel = new (function(){
	
	var me = this;
	
	this.YAMMA_NS_PREFIX = 'yamma-ee';
	this.YAMMA_PREFIX = '';
	
	this.TRAY_TYPE_SHORTNAME = dfn('Tray');
	
	// DOCUMENT TYPE DEFINITION
	this.DOCUMENT_TYPE_SHORTNAME = dfn('Document');
	
	this.DOCUMENT_COPY_ASPECT_SHORTNAME = dfn('DocumentCopy');
	this.DOCUMENT_COPY_ORIGINAL_ASSOCNAME = dfna(this.DOCUMENT_COPY_ASPECT_SHORTNAME, this.DOCUMENT_TYPE_SHORTNAME, 'original');
	
	this.DOCUMENT_CONTAINER_SHORTNAME = dfn('DocumentContainer');
	this.DOCUMENT_CONTAINER_REFERENCE_ASSOCNAME = dfna(this.DOCUMENT_CONTAINER_SHORTNAME, this.DOCUMENT_TYPE_SHORTNAME, 'reference');

	// INBOUND_DOCUMENT TYPE DEFINITION
	this.INBOUND_DOCUMENT_TYPE_SHORTNAME = dfn('InboundDocument');
	this.INBOUND_DOCUMENT_DELIVERY_DATE_PROPNAME = dfnp(this.INBOUND_DOCUMENT_TYPE_SHORTNAME, 'deliveryDate');
	
	// INBOUND_MAIL TYPE DEFINITION
	this.INBOUND_MAIL_TYPE_SHORTNAME = dfn('InboundMail');
	
	// OUTBOUND_MAIL_DEFINITION
	this.OUTBOUND_MAIL_TYPE_SHORTNAME = dfn('OutboundMail');
	
	// REPLY TYPE DEFINITION
	this.REPLY_TYPE_SHORTNAME = dfn('Reply');
	this.REPLY_REPLY_TO_DOCUMENT_ASSOCNAME = dfna(this.REPLY_TYPE_SHORTNAME, this.INBOUND_DOCUMENT_TYPE_SHORTNAME, 'replyTo');
	
	// DATALISTS TYPE DEFINITIONS
	this.ASSIGNABLE_SITE_TYPE_SHORTNAME = dfn('AssignableSite');
	this.DELAY_TYPE_SHORTNAME = dfn('Delay');
	this.DELAY_DELAY_PROPNAME = dfnp(this.DELAY_TYPE_SHORTNAME, 'delay');
	this.PRIORITY_TYPE_SHORTNAME = dfn('Priority');
	this.PRIORITY_LEVEL_PROPNAME = dfnp(this.PRIORITY_TYPE_SHORTNAME, 'level');
	this.PRIVACY_LEVEL_TYPE_SHORTNAME = dfn('PrivacyLevel');
	this.STATUS_LEVEL_TYPE_SHORTNAME = dfn('Status');	
	
	// ASPECTS DEFINITIONS
	
	this.MAIL_ASPECT_SHORTNAME = dfn('Mail');
	this.MAIL_SENT_DATE_PROPNAME = dfnp(this.MAIL_ASPECT_SHORTNAME, 'sentDate');
	this.MAIL_WRITING_DATE_PROPNAME = dfnp(this.MAIL_ASPECT_SHORTNAME, 'writingDate');
	this.MAIL_OBJECT_PROPNAME = dfnp(this.MAIL_ASPECT_SHORTNAME, 'object');
	
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
	
	this.DIGITIZABLE_ASPECT_SHORTNAME = dfn('Digitizable');
	this.DIGITIZABLE_DIGITIZED_DATE_PROPNAME = dfnp(this.DIGITIZABLE_ASPECT_SHORTNAME, 'digitizedDate');
	
	this.REFERENCEABLE_ASPECT_SHORTNAME = dfn('Referenceable');
	this.REFERENCEABLE_REFERENCE_PROPNAME = dfnp(this.REFERENCEABLE_ASPECT_SHORTNAME, 'reference');
	
	this.ASSIGNABLE_ASPECT_SHORTNAME = dfn('Assignable');
	this.ASSIGNABLE_AUTHORITY_PROPNAME = dfnp(this.ASSIGNABLE_ASPECT_SHORTNAME, 'searchableAuthority');
	this.ASSIGNABLE_SERVICE_ASSOCNAME = dfna(this.ASSIGNABLE_ASPECT_SHORTNAME, this.ASSIGNABLE_SITE_TYPE_SHORTNAME, 'service');
	this.ASSIGNABLE_AUTHORITY_ASSOCNAME = dfna(this.ASSIGNABLE_ASPECT_SHORTNAME, 'cm:authority', 'authority');
	
	this.DISTRIBUTABLE_ASPECT_SHORTNAME = dfn('Distributable');
	this.DISTRIBUTABLE_SERVICES_ASSOCNAME = dfna(this.DISTRIBUTABLE_ASPECT_SHORTNAME, this.ASSIGNABLE_SITE_TYPE_SHORTNAME, 'services');
	
	this.PRIORITIZABLE_ASPECT_SHORTNAME = dfn('Prioritizable');
	this.PRIORITIZABLE_DELAY_ASSOCNAME = dfna(this.PRIORITIZABLE_ASPECT_SHORTNAME, this.DELAY_TYPE_SHORTNAME, 'delay');
	this.PRIORITIZABLE_PRIORITY_ASSOCNAME = dfna(this.PRIORITIZABLE_ASPECT_SHORTNAME, this.PRIORITY_TYPE_SHORTNAME, 'priority');
	this.PRIORITIZABLE_DUE_DATE_PROPNAME = dfnp(this.PRIORITIZABLE_ASPECT_SHORTNAME, 'dueDate');
	
	
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
	
	this.HISTORIZABLE_ASPECT_SHORTNAME = dfn('Historizable');
	this.HISTORIZABLE_HISTORY_ASSOCNAME = dfna(this.HISTORIZABLE_ASPECT_SHORTNAME, this.EVENT_TYPE_SHORTNAME, 'history');
	
	this.HIERARCHICAL_SERVICE_ASPECT_SHORTNAME = dfn('HierarchicalService');
	this.HIERARCHICAL_SERVICE_PARENT_ASSOCNAME = dfna(this.HIERARCHICAL_SERVICE_ASPECT_SHORTNAME, 'st:site', 'parent');
	
	
	
	this.DOCUMENT_STATE_PENDING = 'pending';
	this.DOCUMENT_STATE_DELIVERING = 'delivering';
	this.DOCUMENT_STATE_PROCESSING = 'processing';
	this.DOCUMENT_STATE_VALIDATING_DELIVERY = 'validating!delivery';
	this.DOCUMENT_STATE_VALIDATING_PROCESSED = 'validating!processed';
	this.DOCUMENT_STATE_PROCESSED = 'processed';
	this.DOCUMENT_STATE_ARCHIVED = 'archived';
	this.DOCUMENT_STATE_UNKNOWN = 'unknown';
	this.DOCUMENT_STATES = [
		this.DOCUMENT_STATE_PENDING,
		this.DOCUMENT_STATE_DELIVERING,
		this.DOCUMENT_STATE_VALIDATING_DELIVERY,
		this.DOCUMENT_STATE_PROCESSING,
		this.DOCUMENT_STATE_PROCESSED,
		this.DOCUMENT_STATE_VALIDATING_PROCESSED,
		this.DOCUMENT_STATE_ARCHIVED
	];
	
	this.LATE_STATE_UNDETERMINED = 'undetermined';
	this.LATE_STATE_LATE = 'late';
	this.LATE_STATE_ONTIME = 'onTime';
	this.LATE_STATES = [
		this.LATE_STATE_UNDETERMINED,
		this.LATE_STATE_LATE,
		this.LATE_STATE_ONTIME
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


