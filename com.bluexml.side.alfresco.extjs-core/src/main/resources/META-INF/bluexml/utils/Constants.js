/**
 * The Constants (icons, models, ...) used by the YaMma application
 */
Ext.define('Bluexml.utils.Constants', {

	alternateClassName : [
		'Bluexml.Constants'		
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
	BASE_ICON_PATH : '/share/res/bluexml/resources/icons/',	
	
	initResources : function() {
		
	},	
	
	/**
	 * 
	 * @param {String} mimetype
	 * @param {Boolean} provideDefault[default=true] Whether to return a default value if the mimetype cannot be found
	 * @return {Object} { title, iconDef }
	 */
	getMimeTypeIconDefinition : function(mimetype, provideDefault /* default = true */) {
		
		if (!mimetype) return null;
		
		var me = this;
		provideDefault = provideDefault !== false;
		
		switch(mimetype) {
			case 'default':
				return buildIconDefinition('page_white');
			case 'text/plain':
				return buildIconDefinition('page_white_text', 'Document texte');
			case 'text/html':
				return buildIconDefinition('page_white_code', 'Document html');
			case 'application/pdf':
				return buildIconDefinition('page_white_acrobat', 'Document pdf');
			case 'application/zip':
				return buildIconDefinition('page_white_compressed', 'Archive compressée');
		};
		
		if (
			'application/msword' == mimeType ||
			/application\/.*officedocument.*/.test(mimetype) ||
			/application\/.vnd.ms-*/.test(mimetype) ||
			/application\/.vnd.ms-*/.test(mimetype)
		) {
			return buildIconDefinition('page_white_office', 'Document office');
		}
		
		
		if (/image.*/.test(mimetype)) {
			return buildIconDefinition('page_white_picture', 'Image');
		}
		
		return provideDefault ? buildIconDefinition('page_white') : null;
		
		
		function buildIconDefinition(icon, title) {
			if (null == icon) {
				throw new Error('IllegalArgumentException! The icon has to be definend.');
			}
			title = title || '';
			
			return {
				title : title,
				icon : me.getIconDefinition(icon)
			};
		}
		
	}	
	
});