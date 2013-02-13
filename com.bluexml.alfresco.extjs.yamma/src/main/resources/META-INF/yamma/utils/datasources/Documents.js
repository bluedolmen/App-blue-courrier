Ext.define('Yamma.utils.datasources.Documents', {

	singleton : true,
	
	DOCUMENT_NAME_QNAME : 'cm:name',
	DOCUMENT_NODEREF_QNAME : 'nodeRef',
	
	INBOUND_MAIL_QNAME : 'yamma-ee:InboundMail',
	
	MAIL_OBJECT_QNAME : 'yamma-ee:Mail_object',
	MAIL_ORIGIN_QNAME : 'yamma-ee:InboundDocument_origin',
	ASSIGNED_SERVICE_QNAME : 'yamma-ee:Assignable_service',
	ASSIGNED_AUTHORITY_QNAME : 'yamma-ee:Assignable_authority',
	DELIVERY_DATE_QNAME : 'yamma-ee:InboundDocument_deliveryDate',
	WRITING_DATE_QNAME : 'yamma-ee:Mail_writingDate',
	SENT_DATE_QNAME : 'yamma-ee:Mail_sentDate',
	DIGITIZED_DATE_QNAME : 'yamma-ee:Digitizable_digitizedDate',
	DUE_DATE_QNAME : 'yamma-ee:Dueable_dueDate',
	PRIORITY_QNAME : 'yamma-ee:Prioritizable_priority',
	STATUSABLE_STATE_QNAME : 'yamma-ee:Statusable_state',
	DOCUMENT_ISCOPY_QNAME : 'yamma-ee:Document_isCopy',
	DOCUMENT_HAS_DELEGATED_SITES_QNAME : 'yamma-ee:Document_hasDelegatedSites',
	CORREPONDENT_NAME : 'yamma-ee:Correspondent_name',
	CORREPONDENT_ADDRESS : 'yamma-ee:Correspondent_address',
	CORREPONDENT_MAIL : 'yamma-ee:Correspondent_contactEmail',
	CORREPONDENT_PHONE : 'yamma-ee:Correspondent_contactPhone',
	MAIL_HAS_REPLIES_QNAME : 'yamma-ee:Mail_hasReplies',
	MAIL_HAS_SIGNABLE_REPLIES_QNAME : 'yamma-ee:Mail_hasSignableReplies',
	ENCLOSING_SERVICE : 'enclosingService',
	
	DOCUMENT_LATE_STATE_QNAME : 'yamma-ee:Dueable_lateState',
	LATE_STATE_LATE_VALUE : 'late',
	LATE_STATE_HURRY_VALUE : 'hurry',
	LATE_STATE_ONTIME_VALUE : 'onTime',
	
	DOCUMENT_USER_CAN_DISTRIBUTE : 'yamma-ee:Document!Action_canDistribute',
	DOCUMENT_USER_CAN_PROCESS_DOCUMENT : 'yamma-ee:Document!Action_canTakeProcessing',
	DOCUMENT_USER_CAN_REPLY : 'yamma-ee:Document!Action_canReply',
	DOCUMENT_USER_CAN_SEND_OUTBOUND : 'yamma-ee:Document!Action_canSendOutbound',
	DOCUMENT_USER_CAN_SKIP_VALIDATION : 'yamma-ee:Document!Action_canSkipValidation',
	DOCUMENT_USER_CAN_VALIDATE : 'yamma-ee:Document!Action_canValidate',
	DOCUMENT_USER_CAN_MARK_AS_SIGNED : 'yamma-ee:Document!Action_canMarkAsSigned',
	DOCUMENT_USER_CAN_MARK_AS_SENT : 'yamma-ee:Document!Action_canMarkAsSent',
	DOCUMENT_USER_CAN_ARCHIVE : 'yamma-ee:Document!Action_canArchive'
	
	
});