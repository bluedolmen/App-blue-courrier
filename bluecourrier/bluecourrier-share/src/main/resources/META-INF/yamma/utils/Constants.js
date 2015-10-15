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
				title : 'Document',
				aspects : ['bluecourrier:document'],
				kind : 'document',
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
		
		this.MAIL_TYPE_DEFINITION = Ext.apply(
			{
				title : 'Courrier',
				aspects : ['bluecourrier:mail'],
				kind : 'mail'
			},
			this.getIconDefinition('email')
		);
		
		this.INBOUND_MAIL_TYPE_DEFINITION = Ext.apply(
			{
				title : 'Courrier entrant',
				aspects : ['bluecourrier:inboundDocument', 'bluecourrier:mail'],
				kind : 'incoming-mail'
			},
			this.getIconDefinition('email_in')
		);
		
		this.INBOUND_MAIL_FILLED_CONTENT_TYPE_DEFINITION = Ext.apply(
			{
				title : 'Message manuel entrant',
				aspects : ['bluecourrier:inboundDocument', 'bluecourrier:mail'],
				kind : 'incoming-mail!filled-content'
			},
			this.getIconDefinition('email_edit_in')
		);
		
		this.OUTBOUND_MAIL_TYPE_DEFINITION = Ext.apply(
			{
				title : 'Courrier sortant',
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
					title : 'Courrier entrant en attente',
					shortTitle : 'En attente'
				}, 
				this.getIconDefinition('mailbox')
//				this.getIconDefinition('hourglass')
			),
			
			'delivering' : Ext.apply(
				{
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
			
			'linkTo' : Ext.apply(
				{
					title : 'Lien entre documents',
					shortTitle : 'Lien'
				},
				this.getIconDefinition('link')
			),
			
			'restart' : Ext.apply(
				{
					title : 'Redémarrage du traitement',
					shortTitle : 'Ré-ouverture'
				},
				this.getIconDefinition('pencil_go')
			),
			
			'distribution' : Ext.apply(
				{
					title : 'Distribution du document',
					shortTitle : 'distribution'
				},
				this.getIconDefinition('lorry_go')
			), 
			
			'assignServices' : Ext.apply(
				{
					title : 'Distribution du document',
					shortTitle : 'distribution'
				},
				this.getIconDefinition('lorry_go')
			),
				
			'assignInstructor' : Ext.apply(
				{
					title : 'Assignation instructeur',
					shortTitle : 'assignation'
				},
				this.getIconDefinition('user_go')
			),
				
			'acceptProcessing' : Ext.apply(
				{
					title : 'Prise en charge du document',
					shortTitle : 'traitement'
				},
				this.getIconDefinition('pencil_go')
			),
			
			'refuseProcessing' : Ext.apply(
				{
					title : 'Refus prise en charge du document',
					shortTitle : 'traitement'
				},
				this.getIconDefinition('pencil_cross')
			),
				
			'sentWithoutValidation' : Ext.apply(
				{
					title : 'Transmission pour envoi postal',
					shortTitle : 'Envoi postal'
				},
				this.getIconDefinition('email_go')
			),
			
			'sentWithValidation' : Ext.apply(
				{
					title : 'Transmission pour validation',
					shortTitle : 'Envoi validation'
				},
				this.getIconDefinition('tick_go')
			),			
			
			'markAsSent' : Ext.apply(
				{
					title : 'Envoi postal effectué',
					shortTitle : 'Envoi effectué'
				},
				this.getIconDefinition('stamp')
			), 
			
			'close' : Ext.apply(
				{
					title : 'Traitement terminé',
					shortTitle : 'Terminé'
				},
				this.getIconDefinition('thumb_up_go')			
			),
			
			'validation!reject' : Ext.apply(
				{
					title : 'Document rejeté',
					shortTitle : 'Document rejeté'
				},
				this.getIconDefinition('cross')	
			),
			
			'validation!accept' : Ext.apply(
				{
					title : 'Validé',
					shortTitle : 'Validé'
				},
				this.getIconDefinition('tick')			
			),
			
			'validation!abandon' : Ext.apply(
				{
					title : 'Abandon de la validation',
					shortTitle : 'Abandon validation'
				},
				this.getIconDefinition('cancel')			
			),
			
			'UNKNOWN' : Ext.apply(
				{
					title : 'Évènement inconnu',
					shortTitle : 'inconnu'
				},
				this.getIconDefinition('gear')
			),
			
			
			
			// OBSOLETED
			
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
			
			'archive' : Ext.apply(
				{
					title : 'Archivage du courrier',
					shortTitle : 'archivage'
				},
				this.getIconDefinition('package')			
			)
			
		},
		
		this.MIME_TYPE_DEFINITIONS = {
			
			'application/pdf' : Ext.apply(
				{
					title : 'Document PDF'
				}, 
				this.getIconDefinition('page_white_acrobat')
			),
			
			'application/pdf*signed' : Ext.apply(
				{
					title : 'Document PDF certifié'
				}, 
				this.getIconDefinition('page_white_acrobat_certified')
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
		
		
		this.WORKFLOW_TASK_DEFINITIONS = {
				
			'bcinwf:pendingTask' : Ext.apply(
				{
					title : 'Préparation du document',
					shortTitle : 'Préparation'
				},
				this.getIconDefinition('hourglass')
			),
			
			'bcwfincoming:Delivering' : Ext.apply(
				{
					title : 'Distribution du document',
					shortTitle : 'Distribution'
				},
				this.getIconDefinition('lorry_go')
			), 
			
			'bcwfincoming:Sharing' : Ext.apply(
				{
					title : 'Partage du document',
					shortTitle : 'Partage'
				},
				this.getIconDefinition('hand-share')
			),
			
			'bcwfincoming:Processing' : Ext.apply(
				{
					title : 'Traitement du document',
					shortTitle : 'Traitement'
				},
				this.getIconDefinition('pencil')
			),
			
			'bcwfincoming:Validating' : Ext.apply(
				{
					title : 'Validation de la distribution',
					shortTitle : 'Validation distribution'
				},
				this.getIconDefinition('tick')
			), 			
			
			'bcwfoutgoing:Processing' : Ext.apply(
				{
					title : 'Traitement document sortant',
					shortTitle : 'Traitement sortant'
				},
				this.getIconDefinition('pencil')
			),
			
			'blueparapheur:workflow_VisaEtape' : Ext.apply(
				{
					title : 'Validation document sortant',
					shortTitle : 'Validation sortant'
				},
				this.getIconDefinition('tick')
			),
			
			'blueparapheur:workflow_AvisEtape' : Ext.apply(
				{
					title : 'Avis validation document sortant',
					shortTitle : 'Avis sortant'
				},
				this.getIconDefinition('tick')
			),
			
			'bcwfoutgoing:Sending' : Ext.apply(
				{
					title : 'Envoi du document',
					shortTitle : 'Envoi'
				},
				this.getIconDefinition('stamp')
			),
			
			'default' : Ext.apply(
				{
					title : 'Tâche à traiter',
					shortTitle : 'Tâche'
				},
				this.getIconDefinition('cog')
			)			
			
		};
		
		
	},
	
	
	
	

	
});