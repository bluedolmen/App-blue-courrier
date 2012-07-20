Ext.define('Yamma.utils.datasources.Documents', {

	singleton : true,
	
	MAIL_OBJECT_QNAME : 'yamma-ee:Mail_object',
	MAIL_NAME_QNAME : 'cm:name',
	MAIL_NODEREF_QNAME : 'nodeRef',
	ASSIGNED_SERVICE_QNAME : 'yamma-ee:Assignable_service',
	ASSIGNED_AUTHORITY_QNAME : 'yamma-ee:Assignable_authority',
	DELIVERY_DATE_QNAME : 'yamma-ee:Mail_deliveryDate',
	DUE_DATE_QNAME : 'yamma-ee:Prioritizable_dueDate',
	PRIORITY_QNAME : 'yamma-ee:Prioritizable_priority',
	STATUSABLE_STATE_QNAME : 'yamma-ee:Statusable_state',
	DOCUMENT_ISCOPY_QNAME : 'yamma-ee:Document_isCopy',
	DOCUMENT_HAS_REPLIES_QNAME : 'yamma-ee:Document_hasReplies',
	
	DOCUMENT_LATE_STATE_QNAME : 'yamma-ee:Prioritizable_lateState',
	LATE_STATE_LATE_VALUE : 'late',
	
	DOCUMENT_USER_CAN_DISTRIBUTE : 'yamma-ee:Document!Action_canDistribute',
	DOCUMENT_USER_CAN_PROCESS_DOCUMENT : 'yamma-ee:Document!Action_canTakeProcessing',
	DOCUMENT_USER_CAN_REPLY : 'yamma-ee:Document!Action_canReply',
	DOCUMENT_USER_CAN_VALIDATE : 'yamma-ee:Document!Action_canValidate'
	
	
});