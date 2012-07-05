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
	YAMMA_NAMESPACE_PREFIX : 'yamma',
	YAMMA_NAMESPACE : 'http://www.bluexml.com/model/content/bluexml/yamma/1.0',

	initResources : function() {
		
		/* TYPES */
		
		this.UNKNOWN_TYPE_DEFINITION = Ext.apply(
			{
				title : 'Unknown'
			},
			this.getIconDefinition('page_white')
		);
		
		this.DOCUMENT_TYPE_DEFINITIONS = {
			
		},
		
		this.DOCUMENT_STATE_DEFINITIONS = {
			
			'pending' : Ext.apply(
				{
					title : 'En attente de routage'
				}, 
				this.getIconDefinition('hourglass')
			),
			
			'delivering' : Ext.apply(
				{
					title : 'En cours de routage'
				}, 
				this.getIconDefinition('lorry')
			),
			
			'processing' : Ext.apply(
				{
					title : 'En cours de traitement'
				}, 
				this.getIconDefinition('cog_edit')
			),
			
			'validating!delivery' : Ext.apply(
				{
					title : 'En attente de validation de routage'
				}, 
				this.getIconDefinition('lorry_go')
			),
			
			'validating!processed' : Ext.apply(
				{
					title : 'En attente de validation de la réponse'
				}, 
				this.getIconDefinition('cog_tick')
			),
			
			'UNKNOWN' : Ext.apply(
				{
					title : 'Etat inconnu'
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