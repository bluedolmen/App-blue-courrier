Ext.define('Yamma.utils.datasources.Replies', {

	singleton : true,
	
	OUTBOUND_MAIL_QNAME : 'bluecourrier:outboundMail',
	
	REPLY_NODEREF_QNAME : 'nodeRef',
	REPLY_MIMETYPE_QNAME : 'mimetype',
	REPLY_NAME_QNAME : 'cm:name',
	REPLY_TITLE_QNAME : 'cm:title',
	REPLY_AUTHOR_QNAME : 'bluecourrier:reply_author',
	REPLY_WRITING_DATE_QNAME : 'bluecourrier:reply_writingDate',
	REPLY_SENT_DATE_QNAME : 'bluecourrier:reply:sentDate',
	
	REPLY_CAN_UPDATE : 'canUpdate',
	REPLY_CAN_DELETE : 'canDelete',
	REPLY_CAN_ATTACH : 'canAttach',
	REPLY_CAN_BE_SIGNED : 'canBeSigned'

});