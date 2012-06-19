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