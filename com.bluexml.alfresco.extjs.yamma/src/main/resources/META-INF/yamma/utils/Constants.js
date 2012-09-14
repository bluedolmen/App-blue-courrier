/**
 * The Britair Site instance
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

	initResources : function() {
		
		/* TYPES */
		
		this.ABSTRACT_DOCUMENT_TYPE_DEFINITION = Ext.apply(
			{
				title : 'Document'	
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
				title : 'Courrier'
			},
			this.getIconDefinition('email')
		);
		
		this.OUTBOUND_MAIL_TYPE_DEFINITION = Ext.apply(
			{
				title : 'Courrier réponse'
			},
			this.getIconDefinition('email_go')
		);
				
		this.DOCUMENT_TYPE_DEFINITIONS = {
			
			'yamma-ee:InboundMail' : this.INBOUND_MAIL_TYPE_DEFINITION,
			'yamma-ee:OutboundMail' : this.OUTBOUND_MAIL_TYPE_DEFINITION
			
		};
		
		this.DOCUMENT_STATE_DEFINITIONS = {
			
			'pending' : Ext.apply(
				{
					title : 'En attente de routage',
					shortTitle : 'Attente'
				}, 
				this.getIconDefinition('hourglass')
			),
			
			'delivering' : Ext.apply(
				{
					title : 'En cours de routage',
					shortTitle : 'Routage'
				}, 
				this.getIconDefinition('lorry')
			),
			
			'processing' : Ext.apply(
				{
					title : 'En cours de traitement',
					shortTitle : 'Traitement'
				}, 
				this.getIconDefinition('cog_edit')
			),
			
			'validating!delivery' : Ext.apply(
				{
					title : 'En attente de validation de routage',
					shortTitle : 'Validation routage'
				}, 
				this.getIconDefinition('lorry_go')
			),
			
			'validating!processed' : Ext.apply(
				{
					title : 'En attente de validation de la réponse',
					shortTitle : 'Validation'
				}, 
				this.getIconDefinition('cog_tick')
			),
			
			'processed' : Ext.apply(
				{
					title : 'Traité et validé',
					shortTitle : 'Traité'
				},
				this.getIconDefinition('tick')
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
		
		this.MIME_TYPE_DEFINITIONS = {
			
			'application/pdf' : Ext.apply(
				{
					title : 'Document PDF'
				}, 
				this.getIconDefinition('page_white_acrobat')
			)
		}		
	}
	
	

	
});