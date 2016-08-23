/**
 * The Constants (icons, models, ...) used by the YaMma application
 */
Ext.define('Yamma.utils.Constants', {

	alternateClassName : [
		'Yamma.Definitions',
		'Yamma.Constants'		
	],

	
	mixins : [
		'Bluedolmen.utils.IconDefinition'
	],
	
	singleton : true,
	
	constructor : function() {
		
		this.initResources();
		this.callParent(arguments);
		
	},
	
	/* SYSTEM RESOURCES */
	BASE_ICON_PATH : '/share/res/yamma/resources/icons/',	
	
	/* MODEL */
	YAMMA_NAMESPACE_PREFIX : 'bluecourrier',
	YAMMA_NAMESPACE : 'http://www.bluedolmen.org/model/content/bluexml/yamma/1.0',

	CONFIG_SITE_SHORTNAME : 'bluecourrier',
	
	YAMMA_SEARCH_FORMID : 'bluecourrier-mail-search',
	
	getHistoryEventDefinition : function(eventKey) {
		
		var 
			definition = this.HISTORY_EVENT_DEFINITIONS[eventKey],
			defaultDefinition = this.HISTORY_EVENT_DEFINITIONS['UNKNOWN'],
			prefixMatch, prefixKey
		;
		
		if (undefined !== definition) return definition;
		
		prefixMatch = eventKey.match(/(.*)!(.*)/);
		if (null == prefixMatch) return defaultDefinition;
		
		prefixKey = prefixMatch[1];
		return this.HISTORY_EVENT_DEFINITIONS[prefixKey] || defaultDefinition;
		
	},
	
	initResources : function() {
		
		var me = this;
		
		/* TYPES */
		
		this.ABSTRACT_DOCUMENT_TYPE_DEFINITION = Ext.apply(
			{
				title : i18n.t('utils.constants.resources.definition.document'),
				aspects : ['bluecourrier:document'],
				kind : 'document',
				"abstract" : true
			}, 
			this.getIconDefinition('page_white')
		);
		
		this.UNKNOWN_TYPE_DEFINITION = Ext.apply(
			{
				title : i18n.t('utils.constants.resources.definition.unknowns'),
			},
			this.getIconDefinition('page_white')
		);
		
		this.MAIL_TYPE_DEFINITION = Ext.apply(
			{
				title : i18n.t('utils.constants.resources.definition.mail'),
				aspects : ['bluecourrier:mail'],
				kind : 'mail'
			},
			this.getIconDefinition('email')
		);
		
		this.INBOUND_MAIL_TYPE_DEFINITION = Ext.apply(
			{
				title : i18n.t('utils.constants.resources.definition.incomming-mail'),
				aspects : ['bluecourrier:inboundDocument', 'bluecourrier:mail'],
				kind : 'incoming-mail'
			},
			this.getIconDefinition('email_in')
		);
		
		this.INBOUND_MAIL_FILLED_CONTENT_TYPE_DEFINITION = Ext.apply(
			{
				title : i18n.t('utils.constants.resources.definition.incomming-mail-filtered'),
				aspects : ['bluecourrier:inboundDocument', 'bluecourrier:mail'],
				kind : 'incoming-mail!filled-content'
			},
			this.getIconDefinition('email_edit_in')
		);
		
		this.OUTBOUND_MAIL_TYPE_DEFINITION = Ext.apply(
			{
				title : i18n.t('utils.constants.resources.definition.outgoing-mail'),
				aspects : ['bluecourrier:outboundDocument', 'bluecourrier:mail'],
				kind : 'outgoing-mail'
			},
			this.getIconDefinition('email_go')
		);
				
		this.DOCUMENT_TYPE_DEFINITIONS = {};
		Ext.Array.forEach([
			this.ABSTRACT_DOCUMENT_TYPE_DEFINITION,
			this.MAIL_TYPE_DEFINITION,
	        this.INBOUND_MAIL_TYPE_DEFINITION,
	        this.OUTBOUND_MAIL_TYPE_DEFINITION
		], function(typeDefinition) {
			var kind = typeDefinition.kind;
			if (!kind) return;
			
			me.DOCUMENT_TYPE_DEFINITIONS[kind] = typeDefinition;
		});
		
		this.DOCUMENT_STATE_DEFINITIONS = {
			
			'pending' : Ext.apply(
				{
					title : i18n.t('utils.constants.resources.state.pending.title'),
					shortTitle : i18n.t('utils.constants.resources.state.pending.shortTitle')
				}, 
				this.getIconDefinition('mailbox')
//				this.getIconDefinition('hourglass')
			),
			
			'delivering' : Ext.apply(
				{
					title : i18n.t('utils.constants.resources.state.delivering.title'),
                    shortTitle : i18n.t('utils.constants.resources.state.delivering.shortTitle')
				}, 
				this.getIconDefinition('lorry')
			),
			
			'validating!delivery' : Ext.apply(
				{
					title : i18n.t('utils.constants.resources.state.validating-delivery.title'),
                    shortTitle : i18n.t('utils.constants.resources.state.validating-delivery.shortTitle')
				}, 
				this.getIconDefinition('lorry_go') // TODO: should be lorry_tick (but does not exist yet)
			),
			
			'processing' : Ext.apply(
				{
                    title : i18n.t('utils.constants.resources.state.processing.title'),
                    shortTitle : i18n.t('utils.constants.resources.state.processing.shortTitle')
				}, 
				this.getIconDefinition('pencil')
			),
			
			'revising' : Ext.apply(
				{
                    title : i18n.t('utils.constants.resources.state.revising.title'),
                    shortTitle : i18n.t('utils.constants.resources.state.revising.shortTitle')
				}, 
				this.getIconDefinition('pencil_cross')
			),
			
			'validating!processed' : Ext.apply(
				{
                    title : i18n.t('utils.constants.resources.state.validating-processed.title'),
                    shortTitle : i18n.t('utils.constants.resources.state.validating-processed.shortTitle')
				}, 
				this.getIconDefinition('tick')
			),
			
			'certifying' : Ext.apply(
				{
                    title : i18n.t('utils.constants.resources.state.certifying.title'),
                    shortTitle : i18n.t('utils.constants.resources.state.certifying.shortTitle')
				},
				this.getIconDefinition('text_signature')
			),
			
			'sending' : Ext.apply(
				{
                    title : i18n.t('utils.constants.resources.state.sending.title'),
                    shortTitle : i18n.t('utils.constants.resources.state.sending.shortTitle')
				},
				this.getIconDefinition('mail_send')
			),
			
			'processed' : Ext.apply(
				{
                    title : i18n.t('utils.constants.resources.state.processed.title'),
                    shortTitle : i18n.t('utils.constants.resources.state.processed.shortTitle')
				},
				this.getIconDefinition('thumb_up')
			),
			
			'archived' : Ext.apply(
				{
                    title : i18n.t('utils.constants.resources.state.archived.title'),
                    shortTitle : i18n.t('utils.constants.resources.state.archived.shortTitle')
				},
				this.getIconDefinition('package')
			),
			
			'UNKNOWN' : Ext.apply(
				{
                    title : i18n.t('utils.constants.resources.state.UNKNOWN.title'),
                    shortTitle : i18n.t('utils.constants.resources.state.UNKNOWN.shortTitle')
				}, 
				this.getIconDefinition('exclamation')
			)			
		},
		
		// TODO: these definitions should probably be homogeneized with action definitions
		this.HISTORY_EVENT_DEFINITIONS = {
			
//			'acceptProcessing' : Ext.apply(
//				{
//					title : 'Prise en charge du document',
//					shortTitle : 'traitement'
//				},
//				this.getIconDefinition('pencil_go')
//			),
				
			'addReply' : Ext.apply(
				{
					title : i18n.t('utils.constants.resources.history-event.addReply.title'),
					shortTitle : i18n.t('utils.constants.resources.history-event.addReply.shortTitle')
				},
				this.getIconDefinition('email_add')
			),
				
			'archive' : Ext.apply(
				{
					title : i18n.t('utils.constants.resources.history-event.archive.title'),
					shortTitle : i18n.t('utils.constants.resources.history-event.archive.shortTitle')
				},
				this.getIconDefinition('package')			
			),
			'attachment!add' : Ext.apply(
				{
					title : i18n.t('utils.constants.resources.history-event.attachment-add.title'),
					shortTitle : i18n.t('utils.constants.resources.history-event.attachment-add.shortTitle')
				},
				this.getIconDefinition('attach_add')
			),

			'attachment!delete' : Ext.apply(
				{
					title : i18n.t('utils.constants.resources.history-event.attachment-delete.title'),
					shortTitle : i18n.t('utils.constants.resources.history-event.attachment-delete.shortTitle')
				},
				this.getIconDefinition('attach_delete')
			),
			
			'certify' : Ext.apply(
				{
					title : i18n.t('utils.constants.resources.history-event.certify.title'),
					shortTitle : i18n.t('utils.constants.resources.history-event.certify.shortTitle')
				},
				this.getIconDefinition('text_signature')			
			),
			
			'circulate' : Ext.apply(
				{
					title : i18n.t('utils.constants.resources.history-event.circulate.title'),
					shortTitle : i18n.t('utils.constants.resources.history-event.circulate.shortTitle')
				},
				this.getIconDefinition('transmit')
			),
			'completeDelivering' : Ext.apply(
				{
					title : i18n.t('utils.constants.resources.history-event.completeDelivering.title'),
					shortTitle : i18n.t('utils.constants.resources.history-event.completeDelivering.shortTitle')
				},
				this.getIconDefinition('lorry')
			),

			'completeOutgoingProcessing' : Ext.apply(
				{
					title : i18n.t('utils.constants.resources.history-event.completeOutgoingProcessing.title'),
					shortTitle : i18n.t('utils.constants.resources.history-event.completeOutgoingProcessing.shortTitle')
				},
				this.getIconDefinition('tick_go')
			),

			'completeProcessing' : Ext.apply(
				{
					title : i18n.t('utils.constants.resources.history-event.completeProcessing.title'),
					shortTitle : i18n.t('utils.constants.resources.history-event.completeProcessing.shortTitle')
				},
				this.getIconDefinition('thumb_up_go')
			),

			'completeValidating' : Ext.apply(
				{
					title : i18n.t('utils.constants.resources.history-event.completeValidating.title'),
					shortTitle : i18n.t('utils.constants.resources.history-event.completeValidating.shortTitle')
				},
				this.getIconDefinition('tick')
			),
			'forward-for-sending' : Ext.apply(
				{
					title : i18n.t('utils.constants.resources.history-event.forward-for-sending.title'),
					shortTitle : i18n.t('utils.constants.resources.history-event.forward-for-sending.shortTitle')
				},
				this.getIconDefinition('email_go')
			),
			
			'forward-for-signing' : Ext.apply(
				{
					title : i18n.t('utils.constants.resources.history-event.forward-for-signing.title'),
					shortTitle : i18n.t('utils.constants.resources.history-event.forward-for-signing.shortTitle')
				},
				this.getIconDefinition('text_signature_tick')
			),
			'linkTo' : Ext.apply(
				{
					title : i18n.t('utils.constants.resources.history-event.linkTo.title'),
					shortTitle : i18n.t('utils.constants.resources.history-event.linkTo.shortTitle')
				},
				this.getIconDefinition('link')
			),
			'reassign' : Ext.apply(
				{
					title : i18n.t('utils.constants.resources.history-event.reassign.title'),
					shortTitle : i18n.t('utils.constants.resources.history-event.reassign.shortTitle')
				},
				this.getIconDefinition('user_edit')
			),
			'removeReply' : Ext.apply(
				{
					title : i18n.t('utils.constants.resources.history-event.removeReply.title'),
					shortTitle : i18n.t('utils.constants.resources.history-event.removeReply.shortTitle')
				},
				this.getIconDefinition('email_cross')
			),
			'send-outbound!sendOut' : Ext.apply(
				{
					title : i18n.t('utils.constants.resources.history-event.send-outbound-sendOut.title'),
					shortTitle : i18n.t('utils.constants.resources.history-event.send-outbound-sendOut.shortTitle')
				},
				this.getIconDefinition('email_go')
			),

			'send-outbound!sendToValidation' : Ext.apply(
				{
					title : i18n.t('utils.constants.resources.history-event.send-outbound-sendToValidation.title'),
					shortTitle : i18n.t('utils.constants.resources.history-event.send-outbound-sendToValidation.shortTitle')
				},
				this.getIconDefinition('tick_go')
			),
			
			'sent-outbound' : Ext.apply(
				{
					title : i18n.t('utils.constants.resources.history-event.sent-outbound.title'),
					shortTitle : i18n.t('utils.constants.resources.history-event.sent-outbound.shortTitle')
				},
				this.getIconDefinition('stamp')
			),
			'sharedWith' : Ext.apply(
				{
					title : i18n.t('utils.constants.resources.history-event.sharedWith.title'),
					shortTitle : i18n.t('utils.constants.resources.history-event.sharedWith.shortTitle')
				},
				this.getIconDefinition('transmit')
			),
			'signing!approve' : Ext.apply(
				{
					title : i18n.t('utils.constants.resources.history-event.signing-approve.title'),
					shortTitle : i18n.t('utils.constants.resources.history-event.signing-approve.shortTitle')
				},
				this.getIconDefinition('text_signature')
			),
			'signing!certify' : Ext.apply(
				{
					title : i18n.t('utils.constants.resources.history-event.signing-certify.title'),
					shortTitle : i18n.t('utils.constants.resources.history-event.signing-certify.shortTitle')
				},
				this.getIconDefinition('rosette')
			),
			
			'signing!reject' : Ext.apply(
				{
					title : i18n.t('utils.constants.resources.history-event.signing-reject.title'),
					shortTitle : i18n.t('utils.constants.resources.history-event.signing-reject.shortTitle')
				},
				this.getIconDefinition('cross')
			),
			
			'signed-outbound' : Ext.apply(
				{
					title : i18n.t('utils.constants.resources.history-event.signed-outbound.title'),
					shortTitle : i18n.t('utils.constants.resources.history-event.signed-outbound.shortTitle')
				},
				this.getIconDefinition('text_signature_tick')			
			),
			
			'startDelivery' : Ext.apply(
				{
					title : i18n.t('utils.constants.resources.history-event.startDelivery.title'),
					shortTitle : i18n.t('utils.constants.resources.history-event.startDelivery.shortTitle')
				},
				this.getIconDefinition('lorry_go')
			),
			
			'startProcessing' : Ext.apply(
				{
					title : i18n.t('utils.constants.resources.history-event.startProcessing.title'),
					shortTitle : i18n.t('utils.constants.resources.history-event.startProcessing.shortTitle')
				},
				this.getIconDefinition('pencil_go')
			),
			'validation!accept' : Ext.apply(
				{
					title : i18n.t('utils.constants.resources.history-event.validation-accept.title'),
					shortTitle : i18n.t('utils.constants.resources.history-event.validation-accept.shortTitle')
				},
				this.getIconDefinition('tick')			
			),
			
			'validation!reject' : Ext.apply(
				{
					title : i18n.t('utils.constants.resources.history-event.validation-reject.title'),
					shortTitle : i18n.t('utils.constants.resources.history-event.validation-reject.shortTitle')
				},
				this.getIconDefinition('cross')	
			),
			
			'UNKNOWN' : Ext.apply(
				{
					title : i18n.t('utils.constants.resources.history-event.UNKNOWN.title'),
					shortTitle : i18n.t('utils.constants.resources.history-event.UNKNOWN.shortTitle')
				},
				this.getIconDefinition('gear')
			)
			
		},
		
		this.MIME_TYPE_DEFINITIONS = {
			
			'application/pdf' : Ext.apply(
				{
					title : i18n.t('utils.constants.resources.mimetype.application-pdf')
				}, 
				this.getIconDefinition('page_white_acrobat')
			),
			
			'application/pdf*signed' : Ext.apply(
				{
					title : i18n.t('utils.constants.resources.mimetype.application-pdf-signed')
				}, 
				this.getIconDefinition('page_white_acrobat_certified')
			),
			
			'text/html' : Ext.apply(
				{
					title : i18n.t('utils.constants.resources.mimetype.text-html')
				}, 
				this.getIconDefinition('page_white_code')
			),
			
			'text/plain' : Ext.apply(
				{
					title : i18n.t('utils.constants.resources.mimetype.text-plain')
				}, 
				this.getIconDefinition('page_white_text')
			),
				
			'default' : Ext.apply(
				{
					title : ''
				},
				this.getIconDefinition('page_white')				
			)
		};
		
		
		this.WORKFLOW_TASK_DEFINITIONS = {
				
			'bcinwf:pendingTask' : Ext.apply(
				{
					title : i18n.t('utils.constants.resources.workflowtask.bcinwf-pendingTask.title'),
					shortTitle : i18n.t('utils.constants.resources.workflowtask.bcinwf-pendingTask.shortTitle')
				},
				this.getIconDefinition('hourglass')
			),
			
			'bcinwf:deliveringTask' : Ext.apply(
				{
					title : i18n.t('utils.constants.resources.workflowtask.bcinwf-deliveringTask.title'),
					shortTitle : i18n.t('utils.constants.resources.workflowtask.bcinwf-deliveringTask.shortTitle')
				},
				this.getIconDefinition('lorry_go')
			), 
			
			'bcinwf:processingTask' : Ext.apply(
				{

					title : i18n.t('utils.constants.resources.workflowtask.bcinwf-processingTask.title'),
					shortTitle : i18n.t('utils.constants.resources.workflowtask.bcinwf-processingTask.shortTitle'),
					renderTitle : function(record) {
						
						if (!record) return '';
						var properties = record.get('properties');
						if (!properties) return '';
						
						var serviceRole = properties[Yamma.utils.DeliveryUtils.PROP_SERVICE_ROLE];
						if (!serviceRole) return '';
						
						return 'Traitement du document (' + Yamma.utils.DeliveryUtils.ROLE_TITLE[serviceRole] + ')';
						
					},
					renderIconCls : function(record) {
						
						if (!record) return '';
						var properties = record.get('properties');
						if (!properties) return '';
						
						var serviceRole = properties[Yamma.utils.DeliveryUtils.PROP_SERVICE_ROLE];
						if (!serviceRole) return '';
						
						return (Yamma.Constants.getIconDefinition(Yamma.utils.DeliveryUtils.ICON_CLS_BASENAME[serviceRole]) || {}).iconCls || '';
						
					}
						
				},
				this.getIconDefinition('pencil')
			),
			
			'bcinwf:validatingTask' : Ext.apply(
				{
					title : i18n.t('utils.constants.resources.workflowtask.bcinwf-validatingTask.title'),
					shortTitle : i18n.t('utils.constants.resources.workflowtask.bcinwf-validatingTask.shortTitle')
				},
				this.getIconDefinition('tick')
			), 			
			
			'bcogwf:processingTask' : Ext.apply(
				{
					title : i18n.t('utils.constants.resources.workflowtask.bcogwf-processingTask.title'),
					shortTitle : i18n.t('utils.constants.resources.workflowtask.bcogwf-processingTask.shortTitle')
				},
				this.getIconDefinition('pencil')
			),
			
			'bcogwf:validatingTask' : Ext.apply(
				{
					title : i18n.t('utils.constants.resources.workflowtask.bcogwf-validatingTask.title'),
					shortTitle : i18n.t('utils.constants.resources.workflowtask.bcogwf-validatingTask.shortTitle')
				},
				this.getIconDefinition('tick')
			),
				
			'bcogwf:certifyingTask' : Ext.apply(
				{
					title : i18n.t('utils.constants.resources.workflowtask.bcogwf-certifyingTask.title'),
					shortTitle : i18n.t('utils.constants.resources.workflowtask.bcogwf-certifyingTask.shortTitle')
				},
				this.getIconDefinition('rosette')
			),
				
			'bcogwf:sendingTask' : Ext.apply(
				{
					title : i18n.t('utils.constants.resources.workflowtask.bcogwf-sendingTask.title'),
					shortTitle : i18n.t('utils.constants.resources.workflowtask.bcogwf-sendingTask.shortTitle')
				},
				this.getIconDefinition('stamp')
			),
			
			'default' : Ext.apply(
				{
					title : i18n.t('utils.constants.resources.workflowtask.default.title'),
					shortTitle : i18n.t('utils.constants.resources.workflowtask.default.shortTitle')
				},
				this.getIconDefinition('cog')
			)			
			
		};
		
		
	},
	
	
	
	

	
});