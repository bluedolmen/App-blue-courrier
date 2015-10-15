/**
 * TODO: bpajot - 2015
 * This is a copy of the Yaecma equivalent, this should be factorized in the
 * extjs-integration project
 */
Ext.define('Yamma.view.mails.SortersMenu', {
	
	statics : {
		
		SORT_ASCENDING_ICON : Yamma.Constants.getIconDefinition('sort_ascending'),
		SORT_DESCENDING_ICON : Yamma.Constants.getIconDefinition('sort_descending'),
		TEXT_TYPE_ICON : Yamma.Constants.getIconDefinition('text_smallcaps'),
		DATE_TYPE_ICON : Yamma.Constants.getIconDefinition('date'),
		DEFAULT_LABEL : 'Trier par'
			
	},
	
	extend : 'Ext.container.Container',
	
	requires : [
		'Ext.button.Button'
	],
	layout : 'hbox',
    
    sortAscending : true,
    sortProperty : null,
    sortLabel : null,
    
    margin : 0,
    
    filterMenu : null,
    sortDirectionButton : null,
    
    sorters : [
	   {"property":"", "text": "Aucun", "iconCls" : Yamma.Constants.getIconDefinition('cancel').iconCls}
   	],
    
    initComponent : function() {
    	
    	this.filterMenu = Ext.create('Ext.button.Button', {
    		
    		text : Yamma.view.mails.SortersMenu.DEFAULT_LABEL,
    		
    		//plain : true,
    		
			menu : {
				xtype : 'menu',
				items : this.sorters,
			    listeners : {
			    	
			    	'click' : {
			    		fn : this._onMenuItemClick,
			    		scope : this
			    	}
			    	
			    }
			}
			
    	});
    	
    	this.sortDirectionButton = Ext.create('Ext.button.Button', {
    		
    		listeners : {
    			
    			'click' : {
    				fn : this._onSortButtonClick,
    				scope : this
    			}
    			
    		}
    		
    	});
    	
    	this.items = [this.filterMenu, this.sortDirectionButton];    	
    	this.callParent(arguments);
    	
    	this._udpateButtons();
    	
    	this.addEvents('sortby');
    	
    },
    
    reset : function(silent) {

    	this._onMenuItemClick(null /* menu */, {property : null, text : null}, null /* event */, silent);
    	
    },
    
    /**
     * @private
     */
    _udpateButtons : function() {
    	
    	var newIconCls = this.sortAscending ? this.statics().SORT_ASCENDING_ICON.iconCls : this.statics().SORT_DESCENDING_ICON.iconCls;
    	this.sortDirectionButton.setIconCls(newIconCls);
    	
    	if (this.sortLabel != this.filterMenu.getText()) {
	    	this.filterMenu.setText(this.sortLabel || this.statics().DEFAULT_LABEL);    		
    	}
    	
    },
    
    /**
     * @private
     */
    _onMenuItemClick : function(menu, item, event, silent) {
    	
    	this.sortProperty = item.property;
    	this.sortLabel = item.text;
    	this.sortAscending = true;
    	
    	this._udpateButtons();
    	if (true !== silent) {
    		this.fireEvent('sortby', this.sortProperty, this.sortAscending);
    	}
    	
    },
    
    /**
     * @private
     */
    _onSortButtonClick : function(button, event) {
    	
    	this.sortAscending = !this.sortAscending;
    	
    	this._udpateButtons();
    	this.fireEvent('sortby', this.sortProperty, this.sortAscending);
    	
    }
    
});