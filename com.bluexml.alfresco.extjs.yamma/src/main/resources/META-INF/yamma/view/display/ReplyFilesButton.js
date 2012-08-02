Ext.define('Yamma.view.display.ReplyFilesButton', {

	extend : 'Ext.button.Button',
	alias : 'widget.replyfilesbutton',
	
	iconCls: 'icon-email',
	
	/**
	 * Update the status of the button.
	 * 
	 * @param {String}
	 *            documentNodeRef the document nodeRef on which to provide a
	 *            file-selection menu
	 */
	updateStatus : function(documentNodeRef) {
		
		if (null == documentNodeRef) {
			this.clearMenu();
			return;
		}
		
		Yamma.store.YammaStoreFactory.requestNew({
		
			storeId : 'Replies',
			onStoreCreated : Ext.bind(this.createMenu, this), 
			proxyConfig : {
    			extraParams : {
    				'@nodeRef' : documentNodeRef
    			}
    		}
			
		});
		
	},
	
	/**
	 * Clear the menu and disable the button
	 * 
	 * @private
	 */
	clearMenu : function() {
		
		if (this.menu) { Ext.destroy(this.menu); }
		this.setTooltip('');
		this.disable();
		
	},
	
	/**
	 * @private
	 * @param {Ext.menu.Menu}
	 *            menu
	 */
	updateMenu : function(menu) {
		
		if (!menu) {
			this.clearMenu();
			return;
		}
		
		var 
			replyNumber = menu.items.length,
			tooltipText = replyNumber + ' fichier(s) en réponse'
		;
		
		this.menu = menu;
		this.setTooltip(tooltipText);
		this.enable();
		
	},
	
	/**
	 * @private
	 * @param {Bluexml.store.AlfrescoStore}
	 *            store
	 */
	createMenu : function(store) {
		
		var me = this;
		
		store.load({
		    scope   : this,
		    callback: function(records, operation, success) {
		    	if (!success) return;
		    	
		    	var menu = buildMenu(records);
		    	me.updateMenu(menu);
		    	
		    }
		});

		
		function buildMenu(records) {
			
			if (!Ext.isArray(records)) return null;
		
			var menuItems = Ext.Array.map(records, function(record) {
				
				var 
					mimetype = record.get('mimetype'),
					iconDefinition = Yamma.Constants.getMimeTypeIconDefinition(mimetype) || {}
				;
				
				return {
					itemId : record.get('nodeRef'),
					text : record.get('cm:title') || record.get('cm:name'),
					iconCls : iconDefinition.iconCls,
					mimetype : mimetype,
					context : record
				};
				
			});
			
			if (0 == menuItems.length) return null;
			
			return Ext.create('Ext.menu.Menu', {
			    items: menuItems
			});
			
		};

		
	}
	
});