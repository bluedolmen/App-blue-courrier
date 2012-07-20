Ext.define('Bluexml.utils.IconDefinition', {
	
	/**
	 * @private
	 */
	_initIconConstants : function() {
		if (this.ICON_DEFINITION) return;
			
		this.ICON_DEFINITION = {
			
			text : this.getIconDefinition('page_white_text'),
			pdf : this.getIconDefinition('page_white_acrobat'),
			compressed : this.getIconDefinition('page_white_compressed'),
			office : this.getIconDefinition('page_white_office'),
			picture : this.getIconDefinition('page_white_picture'),
			word : this.getIconDefinition('page_white_word')
			
		};
		
	},
	
	getIconDefinition : function(iconName) {
		
		if (undefined === this.BASE_ICON_PATH) {
			Ext.Error.raise('The BASE_ICON_PATH property has to be defined');
		};
		
		return {
			icon : this.BASE_ICON_PATH + iconName + '.png',
			iconCls : 'icon-' + iconName
		};
	},
	
	getMimeTypeIconDefinition : function(mimetype) {
		
		if (!mimetype) return null;
		
		var me = this;
		this._initIconConstants();
		
		var iconDef = null;
		
		switch(mimetype) {
			case 'text/plain' : 
				iconDef = me.ICON_DEFINITION.text;
				break;
			case 'application/pdf' :
				iconDef = me.ICON_DEFINITION.pdf;
				break;
			case 'application/zip' :
				iconDef = me.ICON_DEFINITION.compressed;
				break;
			case 'application/msword' :
				iconDef = me.ICON_DEFINITION.office;
				break
		};
		
		if (!iconDef) {
			if (/application\/.*officedocument.*/.test(mimetype)) iconDef = me.ICON_DEFINITION.office;
			else if (/application\/.*opendocument.*/.test(mimetype)) iconDef = me.ICON_DEFINITION.office;
			else if (/application\/.vnd.ms-*/.test(mimetype)) iconDef = me.ICON_DEFINITION.office;
			else if (/image.*/.test(mimetype)) iconDef = me.ICON_DEFINITION.picture;
		}
		
		return iconDef;
		
	},
	
	asIconPath : function(iconDefinition) {
		
		if (!iconDefinition) return null;		
		return iconDefinition.icon || null;
		
	}
	
});
