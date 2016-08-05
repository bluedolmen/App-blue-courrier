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
			
			'certifying' : Ext.apply(
				{
					title : 'En cours de signature',
					shortTitle : 'Signature'				
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
			
//			'acceptProcessing' : Ext.apply(
//				{
//					title : 'Prise en charge du document',
//					shortTitle : 'traitement'
//				},
//				this.getIconDefinition('pencil_go')
//			),
				
			'addReply' : Ext.apply(
				{
					title : "Ajout d'une réponse",
					shortTitle : 'Ajout réponse'
				},
				this.getIconDefinition('email_add')
			),
				
			'archive' : Ext.apply(
				{
					title : 'Archivage du courrier',
					shortTitle : 'archivage'
				},
				this.getIconDefinition('package')			
			),
			
//			'assignInstructor' : Ext.apply(
//				{
//					title : 'Assignation instructeur',
//					shortTitle : 'assignation'
//				},
//				this.getIconDefinition('user_go')
//			),
				
//			'assignServices' : Ext.apply(
//				{
//					title : 'Distribution du document',
//					shortTitle : 'distribution'
//				},
//				this.getIconDefinition('lorry_go')
//			),

			'attachment!add' : Ext.apply(
				{
					title : "Ajout d'un attachement",
					shortTitle : 'Ajout attachement'
				},
				this.getIconDefinition('attach_add')
			),

			'attachment!delete' : Ext.apply(
				{
					title : "Suppression d'un attachement",
					shortTitle : 'Suppression attachement'
				},
				this.getIconDefinition('attach_delete')
			),
			
			'certify' : Ext.apply(
				{
					title : 'Certification',
					shortTitle : 'Certification'
				},
				this.getIconDefinition('text_signature')			
			),
			
			'circulate' : Ext.apply(
				{
					title : "Diffusion",
					shortTitle : 'Diffusion'
				},
				this.getIconDefinition('transmit')
			),

//			'close' : Ext.apply(
//				{
//					title : 'Traitement terminé',
//					shortTitle : 'Terminé'
//				},
//				this.getIconDefinition('thumb_up_go')			
//			),
				
			'completeDelivering' : Ext.apply(
				{
					title : 'Fin de la distribution',
					shortTitle : 'Fin distribution'
				},
				this.getIconDefinition('lorry')
			),

			'completeOutgoingProcessing' : Ext.apply(
				{
					title : 'Fin du traitement',
					shortTitle : 'Fin traitement'
				},
				this.getIconDefinition('tick_go')
			),

			'completeProcessing' : Ext.apply(
				{
					title : 'Fin du traitement',
					shortTitle : 'Fin traitement'
				},
				this.getIconDefinition('thumb_up_go')
			),

			'completeValidating' : Ext.apply(
				{
					title : 'Fin de la validation',
					shortTitle : 'Fin validation'
				},
				this.getIconDefinition('tick')
			),
			
			
//			'distribution' : Ext.apply(
//				{
//					title : 'Distribution du document',
//					shortTitle : 'distribution'
//				},
//				this.getIconDefinition('lorry_go')
//			), 
			
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
				
//			'forward-reply' : Ext.apply(
//				{
//					title : 'Transmission au service',
//					shortTitle : 'Transmission service'
//				},
//				this.getIconDefinition('group_go')			
//			),
			
			'linkTo' : Ext.apply(
				{
					title : 'Lien entre documents',
					shortTitle : 'Lien'
				},
				this.getIconDefinition('link')
			),
			
//			'markAsSent' : Ext.apply(
//				{
//					title : 'Envoi postal effectué',
//					shortTitle : 'Envoi effectué'
//				},
//				this.getIconDefinition('stamp')
//			), 

			'reassign' : Ext.apply(
				{
					title : "Réassignation du traitement d'une tâche",
					shortTitle : 'Réassignation'
				},
				this.getIconDefinition('user_edit')
			),
			
//			'refuse-reply' : Ext.apply(
//				{
//					title : 'Refus de la réponse',
//					shortTitle : 'Refus'
//				},
//				this.getIconDefinition('cross')			
//			),
			
//			'refuseProcessing' : Ext.apply(
//				{
//					title : 'Refus prise en charge du document',
//					shortTitle : 'traitement'
//				},
//				this.getIconDefinition('pencil_cross')
//			),
			
			'removeReply' : Ext.apply(
				{
					title : "Suppression d'une réponse",
					shortTitle : 'Suppression réponse'
				},
				this.getIconDefinition('email_cross')
			),
				
//			'restart' : Ext.apply(
//				{
//					title : 'Redémarrage du traitement',
//					shortTitle : 'Ré-ouverture'
//				},
//				this.getIconDefinition('pencil_go')
//			),
			
			'send-outbound!sendOut' : Ext.apply(
				{
					title : 'Envoi courrier sortant',
					shortTitle : 'Envoi'
				},
				this.getIconDefinition('email_go')
			),

			'send-outbound!sendToValidation' : Ext.apply(
				{
					title : 'Envoi courrier sortant en validation',
					shortTitle : 'Envoi'
				},
				this.getIconDefinition('tick_go')
			),
			
			'sent-outbound' : Ext.apply(
				{
					title : 'Envoi postal effectué',
					shortTitle : 'Envoi effectué'
				},
				this.getIconDefinition('stamp')
			), 
			
//			'sentWithoutValidation' : Ext.apply(
//				{
//					title : 'Transmission pour envoi postal',
//					shortTitle : 'Envoi postal'
//				},
//				this.getIconDefinition('email_go')
//			),
			
//			'sentWithValidation' : Ext.apply(
//				{
//					title : 'Transmission pour validation',
//					shortTitle : 'Envoi validation'
//				},
//				this.getIconDefinition('tick_go')
//			),
			
			'sharedWith' : Ext.apply(
				{
					title : "Partagé avec",
					shortTitle : 'Partagé'
				},
				this.getIconDefinition('transmit')
			),
			
			'signing!approve' : Ext.apply(
				{
					title : 'Approbation',
					shortTitle : 'Approbation par signature électronique'
				},
				this.getIconDefinition('text_signature')
			),
			
			'signing!certify' : Ext.apply(
				{
					title : 'Certification',
					shortTitle : 'Certification par signature électronique'
				},
				this.getIconDefinition('rosette')
			),
			
			'signing!reject' : Ext.apply(
				{
					title : 'Rejet',
					shortTitle : 'Rejet du document'
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
			
			'startDelivery' : Ext.apply(
				{
					title : 'Démarrage de la distribution',
					shortTitle : 'Démarrage distribution'
				},
				this.getIconDefinition('lorry_go')
			),
			
			'startProcessing' : Ext.apply(
				{
					title : 'Démarrage du traitement',
					shortTitle : 'Démarrage traitement'
				},
				this.getIconDefinition('pencil_go')
			),
			
//			'validation!abandon' : Ext.apply(
//				{
//					title : 'Abandon de la validation',
//					shortTitle : 'Abandon validation'
//				},
//				this.getIconDefinition('cancel')			
//			),
			
			'validation!accept' : Ext.apply(
				{
					title : 'Validé',
					shortTitle : 'Validé'
				},
				this.getIconDefinition('tick')			
			),
			
			'validation!reject' : Ext.apply(
				{
					title : 'Document rejeté',
					shortTitle : 'Document rejeté'
				},
				this.getIconDefinition('cross')	
			),
			
			'UNKNOWN' : Ext.apply(
				{
					title : 'Évènement inconnu',
					shortTitle : 'inconnu'
				},
				this.getIconDefinition('gear')
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
			
			'bcinwf:deliveringTask' : Ext.apply(
				{
					title : 'Distribution du document',
					shortTitle : 'Distribution'
				},
				this.getIconDefinition('lorry_go')
			), 
			
			'bcinwf:processingTask' : Ext.apply(
				{
					title : 'Traitement du document',
					shortTitle : 'Traitement',
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
					title : 'Validation de la distribution',
					shortTitle : 'Validation distribution'
				},
				this.getIconDefinition('tick')
			), 			
			
			'bcogwf:processingTask' : Ext.apply(
				{
					title : 'Traitement document sortant',
					shortTitle : 'Traitement sortant'
				},
				this.getIconDefinition('pencil')
			),
			
			'bcinwf:validatingTask' : Ext.apply(
				{
					title : 'Validation document sortant',
					shortTitle : 'Validation'
				},
				this.getIconDefinition('tick')
			),
				
			'bcogwf:certifyingTask' : Ext.apply(
				{
					title : 'Certification du document',
					shortTitle : 'Certification'
				},
				this.getIconDefinition('rosette')
			),
				
			'bcogwf:sendingTask' : Ext.apply(
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