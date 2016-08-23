Ext.define('Yamma.view.edit.DeferredLoading', {
	
	listeners : {
		expand : function(panel, eOpts) { this.onReveal(); }
	},	

	dirty : true,
	dirtyArgs : [],
	
	dload : function() {
		
		if (!!this.collapsed) {
			this.dirty = true;
			this.dirtyArgs = arguments;
			return; // defer loading
		}
		
		this.loadInternal.apply(this, arguments);
		this.dirty = false;
		
	},
	
	loadInternal : function() {
		Ext.Error.raise(i18n.t('view.edit.deferredlogin.errors.notoverloaded'));
	},
	
	dclear : function() {
		this.clearInternal();
		this.clear();
	},
	
	clearInternal : function() {
		// do nothing by default
	},
	
	onReveal : function() {
		
		if (this.dirty) {
			this.dload.apply(this, this.dirtyArgs);
		}
		
	}
	
	
});