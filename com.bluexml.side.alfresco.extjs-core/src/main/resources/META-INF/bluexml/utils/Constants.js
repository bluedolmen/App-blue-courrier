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
		
		this.defaultMimetypeIconDefinition = this._buildIconDefinition('page_white');
		
	},	
	
	 
	
	/**
	 * 
	 * @param {String} mimetype
	 * @param {Boolean} provideDefault[default=true] Whether to return a default value if the mimetype cannot be found
	 * @return {Object} { title, iconDef }
	 */
	getMimeTypeIconDefinition : function(mimetype, provideDefault /* default = true */) {
		
		var me = this;
		provideDefault = provideDefault !== false;
		
		function getDefault() {
			return provideDefault ? me.defaultMimetypeIconDefinition : null;
		}
		
		if (!mimetype) return getDefault();
		
		switch(mimetype) {
			case 'default':
				return getDefault();
			case 'text/plain':
				return this._buildIconDefinition('page_white_text', 'Document texte');
			case 'text/html':
				return this._buildIconDefinition('page_white_code', 'Document html');
			case 'application/pdf':
				return this._buildIconDefinition('page_white_acrobat', 'Document pdf');
			case 'application/zip':
				return this._buildIconDefinition('page_white_compressed', 'Archive compressée');
		};
		
		if (
			'application/msword' == mimetype ||
			/application\/.*officedocument.*/.test(mimetype) ||
			/application\/.vnd.ms-*/.test(mimetype) ||
			/application\/.vnd.ms-*/.test(mimetype)
		) {
			return this._buildIconDefinition('page_white_office', 'Document office');
		}
		
		
		if (/image.*/.test(mimetype)) {
			return this._buildIconDefinition('page_white_picture', 'Image');
		}
		
		return getDefault();		
		
	},
	
	/**
	 * @param {} icon
	 * @param {} title
	 * @return {}
	 * @private
	 */
	_buildIconDefinition : function(icon, title) {
		
		if (null == icon) {
			throw new Error('IllegalArgumentException! The icon has to be definend.');
		}
		
		title = title || '';
		
		return Ext.apply(
			{
				title : title
			},
			this.getIconDefinition(icon)
		);
	}
	
	
});