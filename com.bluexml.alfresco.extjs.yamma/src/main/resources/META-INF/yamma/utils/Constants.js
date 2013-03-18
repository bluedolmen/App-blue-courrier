/**
 * The Constants (icons, models, ...) used by the YaMma application
 */
Ext.define('Yamma.utils.Constants', {

	alternateClassName : [
		'Yamma.Definitions',
		'Yamma.Constants'		
	],
	
	mixins : [
		'Bluexml.utils.IconDefinition'
	],
	
	singleton : true,
	
	constructor : function() {
		
		this.initResources();
		this.callParent(arguments);
		
	},
	
	/* SYSTEM RESOURCES */
	BASE_ICON_PATH : '/share/res/yamma/resources/icons/',	
	
	/* MODEL */
	YAMMA_NAMESPACE_PREFIX : 'yamma-ee',
	YAMMA_NAMESPACE : 'http://www.bluexml.com/model/content/bluexml/yamma/1.0',

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
				title : 'Document',
				typeShort : 'yamma-ee:Document',
				"abstract" : true
			}, 
			this.getIconDefinition('page_white')
		);
		
		this.UNKNOWN_TYPE_DEFINITION = Ext.apply(
			{
				title : 'Unknown'
			},
			this.getIconDefinition('page_white')
		);
		
		this.INBOUND_MAIL_TYPE_DEFINITION = Ext.apply(
			{
				title : 'Courrier entrant',
				typeShort : 'yamma-ee:InboundMail'
			},
			this.getIconDefinition('email_in')
		);
		
		this.INBOUND_MAIL_FILLED_CONTENT_TYPE_DEFINITION = Ext.apply(
			{
				title : 'Message manuel entrant',
				typeShort : 'yamma-ee:InboundMail'
			},
			this.getIconDefinition('email_edit_in')
		);
		
		this.OUTBOUND_MAIL_TYPE_DEFINITION = Ext.apply(
			{
				title : 'Courrier sortant',
				typeShort : 'yamma-ee:OutboundMail'
			},
			this.getIconDefinition('email_go')
		);
				
		this.DOCUMENT_TYPE_DEFINITIONS = {};
		Ext.Array.forEach([
			this.ABSTRACT_DOCUMENT_TYPE_DEFINITION,
	        this.INBOUND_MAIL_TYPE_DEFINITION,
	        this.OUTBOUND_MAIL_TYPE_DEFINITION
		], function(typeDefinition) {
			var typeShort = typeDefinition.typeShort;
			if (!typeShort) return;
			
			me.DOCUMENT_TYPE_DEFINITIONS[typeShort] = typeDefinition;
		});
		
		this.DOCUMENT_STATE_DEFINITIONS = {
			
			'pending' : Ext.apply(
				{
//					title : 'En attente de routage',
//					shortTitle : 'Attente'
					title : 'Courrier entrant en attente',
					shortTitle : 'Courrier entrant'
				}, 
				this.getIconDefinition('hourglass')
			),
			
			'delivering' : Ext.apply(
				{
//					title : 'En cours de routage',
//					shortTitle : 'Routage'
					title : 'En cours de distribution',
					shortTitle : 'Distribution'
				}, 
				this.getIconDefinition('lorry')
			),
			
			'validating!delivery' : Ext.apply(
				{
					title : 'En attente de validation de routage',
					shortTitle : 'Validation routage'
				}, 
				this.getIconDefinition('lorry_go') // TODO: should be lorry_tick (but does not exist yet)
			),
			
			'processing' : Ext.apply(
				{
					title : 'En cours de traitement',
					shortTitle : 'Traitement'
				}, 
				this.getIconDefinition('pencil')
			),
			
			'revising' : Ext.apply(
				{
					title : 'En correction',
					shortTitle : 'Correction'
				}, 
				this.getIconDefinition('pencil_cross')
			),
			
			'validating!processed' : Ext.apply(
				{
					title : 'En validation du courrier sortant',
					shortTitle : 'Validation'
				}, 
				this.getIconDefinition('tick')
			),
			
			'signing' : Ext.apply(
				{
//					title : 'En signature',
//					shortTitle : 'Signature'					
					title : 'En cours de paraphage',
					shortTitle : 'Parapheur'				
				},
				this.getIconDefinition('text_signature')
			),
			
			'sending' : Ext.apply(
				{
					title : "En cours d'envoi postal",
					shortTitle : 'Envoi postal'
				},
				this.getIconDefinition('mail_send')
			),
			
			'processed' : Ext.apply(
				{
					title : 'Traité et validé',
					shortTitle : 'Traité'
				},
				this.getIconDefinition('thumb_up')
			),
			
			'archived' : Ext.apply(
				{
					title : 'Archivé',
					shortTitle : 'Archivé'
				},
				this.getIconDefinition('package')
			),
			
			'UNKNOWN' : Ext.apply(
				{
					title : 'Etat inconnu',
					shortTitle : 'Inconnu'
				}, 
				this.getIconDefinition('exclamation')
			)			
			
		},
		
		// TODO: these definitions should probably be homogeneized with action definitions
		this.HISTORY_EVENT_DEFINITIONS = {
			
			'distribution' : Ext.apply(
				{
					title : 'Distribution du document',
					shortTitle : 'distribution'
				},
				this.getIconDefinition('lorry_go')
			), 
			
			'take-processing' : Ext.apply(
				{
					title : 'Prise en charge du document',
					shortTitle : 'traitement'
				},
				this.getIconDefinition('pencil_go')
			),
			
			'send-outbound!sendOut' : Ext.apply(
				{
					title : 'Transmission pour envoi postal',
					shortTitle : 'Envoi postal'
				},
				this.getIconDefinition('email_go')
			),
			
			'send-outbound!sendToValidation' : Ext.apply(
				{
					title : 'Transmission pour validation',
					shortTitle : 'Envoi validation'
				},
				this.getIconDefinition('tick_go')
			),
			
			'forward-reply' : Ext.apply(
				{
					title : 'Transmission au service',
					shortTitle : 'Transmission service'
				},
				this.getIconDefinition('group_go')			
			),
			
			'forward-for-sending' : Ext.apply(
				{
					title : 'Transmission pour envoi postal',
					shortTitle : 'Envoi postal'
				},
				this.getIconDefinition('email_go')
			),
			
			'forward-for-signing' : Ext.apply(
				{
					title : 'Transmission pour signature par l\'élu',
					shortTitle : 'Transmission signature'
				},
				this.getIconDefinition('text_signature_tick')
			),
			
			'refuse-reply' : Ext.apply(
				{
					title : 'Refus de la réponse',
					shortTitle : 'Refus'
				},
				this.getIconDefinition('cross')			
			),
			
			'signed-outbound' : Ext.apply(
				{
					title : 'Signature de la réponse',
					shortTitle : 'Signature'
				},
				this.getIconDefinition('text_signature_tick')			
			),
			
			'sent-outbound' : Ext.apply(
				{
					title : 'Envoi postal effectué',
					shortTitle : 'Envoi effectué'
				},
				this.getIconDefinition('stamp')
			), 
			
			'archive' : Ext.apply(
				{
					title : 'Archivage du courrier',
					shortTitle : 'archivage'
				},
				this.getIconDefinition('package')			
			),
			
			'UNKNOWN' : Ext.apply(
				{
					title : 'Évènement inconnu',
					shortTitle : 'inconnu'
				},
				this.getIconDefinition('exclamation')
			)
			
		},
		
		this.MIME_TYPE_DEFINITIONS = {
			
			'application/pdf' : Ext.apply(
				{
					title : 'Document PDF'
				}, 
				this.getIconDefinition('page_white_acrobat')
			),
			
			'text/html' : Ext.apply(
				{
					title : 'Document HTML'
				}, 
				this.getIconDefinition('page_white_code')
			),
			
			'text/plain' : Ext.apply(
				{
					title : 'Document texte'
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
		
	}
	
	

	
});