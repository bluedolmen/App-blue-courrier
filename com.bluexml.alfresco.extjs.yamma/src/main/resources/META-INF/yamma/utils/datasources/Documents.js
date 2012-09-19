Ext.define('Yamma.utils.datasources.Documents', {

	singleton : true,
	
	MAIL_OBJECT_QNAME : 'yamma-ee:Mail_object',
	MAIL_NAME_QNAME : 'cm:name',
	MAIL_NODEREF_QNAME : 'nodeRef',
	ASSIGNED_SERVICE_QNAME : 'yamma-ee:Assignable_service',
	ASSIGNED_AUTHORITY_QNAME : 'yamma-ee:Assignable_authority',
	DELIVERY_DATE_QNAME : 'yamma-ee:InboundDocument_deliveryDate',
	WRITING_DATE_QNAME : 'yamma-ee:Mail_writingDate',
	SENT_DATE_QNAME : 'yamma-ee:Mail_sentDate',
	DIGITIZED_DATE_QNAME : 'yamma-ee:Digitizable_digitizedDate',
	DUE_DATE_QNAME : 'yamma-ee:Prioritizable_dueDate',
	PRIORITY_QNAME : 'yamma-ee:Prioritizable_priority',
	STATUSABLE_STATE_QNAME : 'yamma-ee:Statusable_state',
	DOCUMENT_ISCOPY_QNAME : 'yamma-ee:Document_isCopy',
	DOCUMENT_HAS_REPLIES_QNAME : 'yamma-ee:Document_hasReplies',
	DOCUMENT_HAS_DELEGATED_SITES_QNAME : 'yamma-ee:Document_hasDelegatedSites',
	CORREPONDENT_NAME : 'yamma-ee:Correspondent_name',
	CORREPONDENT_ADDRESS : 'yamma-ee:Correspondent_address',
	CORREPONDENT_MAIL : 'yamma-ee:Correspondent_contactEmail',
	CORREPONDENT_PHONE : 'yamma-ee:Correspondent_contactPhone',
	
	DOCUMENT_LATE_STATE_QNAME : 'yamma-ee:Prioritizable_lateState',
	LATE_STATE_LATE_VALUE : 'late',
	LATE_STATE_HURRY_VALUE : 'hurry',
	LATE_STATE_ONTIME_VALUE : 'onTime',
	
	DOCUMENT_USER_CAN_DISTRIBUTE : 'yamma-ee:Document!Action_canDistribute',
	DOCUMENT_USER_CAN_PROCESS_DOCUMENT : 'yamma-ee:Document!Action_canTakeProcessing',
	DOCUMENT_USER_CAN_SEND_OUTBOUND : 'yamma-ee:Document!Action_canSendOutbound',
	DOCUMENT_USER_CAN_VALIDATE : 'yamma-ee:Document!Action_canValidate'
	
	
});