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
		Ext.Error.raise('IllegalStateException! This method has to be overloaded by the including class.');
	},
	
	onReveal : function() {
		
		if (this.dirty) {
			this.dload.apply(this, this.dirtyArgs);
		}
		
	}
	
	
});