Ext.define('Yamma.utils.datasources.Documents', {

	singleton : true,
	
	DOCUMENT_NAME_QNAME : 'cm:name',
	DOCUMENT_NODEREF_QNAME : 'nodeRef',
	
	MAIL_OBJECT_QNAME : 'bluecourrier:object',
	MAIL_ORIGIN_QNAME : 'bluecourrier:origin',
	ASSIGNED_SERVICE_QNAME : 'bluecourrier:assignedService', // does not exist anymore?
	ASSIGNED_AUTHORITY_QNAME : 'bluecourrier:assignedAuthority',
	DELIVERY_DATE_QNAME : 'bluecourrier:deliveryDate',
	WRITING_DATE_QNAME : 'bluecourrier:writingDate',
	SENT_DATE_QNAME : 'bluecourrier:sentDate',
	DIGITIZED_DATE_QNAME : 'bluecourrier:digitizedDate',
	DUE_DATE_QNAME : 'bluecourrier:dueDate',
	PRIORITY_QNAME : 'bluecourrier:priority',
	PRIVACY_QNAME : 'bluecourrier:privacyLevel',
	STATUSABLE_STATE_QNAME : 'bluecourrier:status',
	DOCUMENT_ISCOPY_QNAME : 'bluecourrier:documentIsCopy',
	MAIL_HAS_REPLIES_QNAME : 'bluecourrier:mailHasReplies',
	MAIL_HAS_SIGNABLE_REPLIES_QNAME : 'bluecourrier:mailHasSignableReplies',
	REFERENCEABLE_REFERENCE_QNAME : 'bluecourrier:reference',
	IS_FOLLOWED_QNAME : 'bluecourrier:isFollowed',
	ENCLOSING_SERVICE : 'enclosingService',
	PERMISSIONS : 'permissions',
	
	PROCESSED_BY_QNAME : 'bluecourrier:processedBy',
	PROCESS_KIND_QNAME : 'bluecourrier:processKind',
	
	DOCUMENT_LATE_STATE_QNAME : 'bluecourrier:lateState',
	LATE_STATE_LATE_VALUE : 'late',
	LATE_STATE_HURRY_VALUE : 'hurry',
	LATE_STATE_ONTIME_VALUE : 'onTime',
	
	DOCUMENT_USER_CAN_DISTRIBUTE : 'bluecourrier:document!Action_canDistribute',
	DOCUMENT_USER_CAN_PROCESS_DOCUMENT : 'bluecourrier:document!Action_canTakeProcessing',
	DOCUMENT_USER_CAN_REPLY : 'bluecourrier:document!Action_canReply',
	DOCUMENT_USER_CAN_SEND_OUTBOUND : 'bluecourrier:document!Action_canSendOutbound',
	DOCUMENT_USER_CAN_SKIP_VALIDATION : 'bluecourrier:document!Action_canSkipValidation',
	DOCUMENT_USER_CAN_VALIDATE : 'bluecourrier:document!Action_canValidate',
	DOCUMENT_USER_CAN_MARK_AS_SIGNED : 'bluecourrier:document!Action_canMarkAsSigned',
	DOCUMENT_USER_CAN_MARK_AS_SENT : 'bluecourrier:document!Action_canMarkAsSent',
	DOCUMENT_USER_CAN_ARCHIVE : 'bluecourrier:document!Action_canArchive',
	
	MAIL_KIND_QNAME : 'bluecourrier:mailKind',
	INCOMING_MAIL_KIND : 'incoming-mail',
	OUTGOING_MAIL_KIND : 'outgoing-mail',

	MAIL_QNAME : 'bluecourrier:mail',
	INBOUND_MAIL_QNAME : 'bluecourrier:inboundMail',
	
	SHARES : 'bluecourrier:shares'
	
});