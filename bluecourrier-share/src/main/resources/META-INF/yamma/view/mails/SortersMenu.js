/**
 * TODO: bpajot - 2015
 * This is a copy of the Yaecma equivalent, this should be factorized in the
 * extjs-integration project
 */
Ext.define('Yamma.view.mails.SortersMenu', {
	
	statics : {
		
		TEXT_TYPE_ICON : Yamma.Constants.getIconDefinition('text_smallcaps'),
		DATE_TYPE_ICON : Yamma.Constants.getIconDefinition('date'),
		KEY_TYPE_ICON : Yamma.Constants.getIconDefinition('key')
	},
	
	extend : 'Ext.container.Container',
	
	requires : [
		'Ext.button.Button'
	],
	
	layout : 'hbox',
    
	/*
	 * @config
	 */
	iconCls : null,
	
	/*
	 * @config
	 */
	showDirection : true,
	
	/*
	 * @config
	 */
	sortEventName : 'sortby',
	
	/*
	 * @config
	 */
	sortAscendingIcon : Yamma.Constants.getIconDefinition('sort_ascending'),
	sortDescendingIcon : Yamma.Constants.getIconDefinition('sort_descending'),
	
	/*
	 * @config
	 */
	defaultLabel : 'Trier par',
	
	/*
	 * @config
	 */
	showNoneSorter : false,
	
    sortAscending : true,
    sortProperty : null,
    sortLabel : null,
    
    margin : 0,
    
    sorterMenu : null,
    sortDirectionButton : null,
    
    sorters : [
	   {"property":"", "text": "Aucun", "iconCls" : Yamma.Constants.getIconDefinition('cancel').iconCls}
   	],
    
    initComponent : function() {
    	
    	var availableSorters = this.sorters; 
    	
    	if (this.showNoneSorter) {
    		availableSorters = [{
        		property : '',
        		text : 'Aucun',
        		iconCls : Yamma.Constants.getIconDefinition('cancel').iconCls
        	}].concat(availableSorters);
    	}
    	
    	this.sorterMenu = Ext.create('Ext.button.Button', {
    		
    		iconCls : this.iconCls,
    		text : this.defaultLabel,
    		
			menu : {
				xtype : 'menu',
				items : availableSorters,
			    listeners : {
			    	
			    	'click' : {
			    		fn : this._onMenuItemClick,
			    		scope : this
			    	}
			    	
			    }
			}
			
    	});
    	
    	this.items = [ this.sorterMenu ];
    	
    	if (this.showDirection) {
    		
        	this.sortDirectionButton = Ext.create('Ext.button.Button', {
        		
        		listeners : {
        			
        			'click' : {
        				fn : this._onSortButtonClick,
        				scope : this
        			}
        			
        		}
        		
        	});
        	
        	this.items.push(this.sortDirectionButton);
    		
    	}
    	
    	this.callParent(arguments);
    	
    	this._udpateButtons();
    	
    	this.addEvents(this.sortEventName);
    	    	
    },
    
    reset : function(silent) {

    	this._onMenuItemClick(null /* menu */, {property : null, text : null}, null /* event */, silent);
    	
    },
    
    select : function(property, sortAscending, silent) {
    	
    	var selectedItem = this._getItem(property);
    	if (!selectedItem) return;
    	
    	if (null != sortAscending) {
    		selectedItem.sortAscending = sortAscending;
    	}
    	
    	this._onMenuItemClick(null /* menu */, selectedItem, null /* event */, silent);
    	
    },
    
    /**
     * @private
     */
    _getItem : function(property) {

    	if (!this.sorterMenu) return;
    	
    	var 
    		menuItems = this.sorterMenu.menu.items,
    		selectedItem
    	;
    	if (!menuItems) return;
    	
    	return menuItems.findBy(function(item) {
    		return property == item.property;
    	});

    },
    
    /**
     * @private
     */
    _udpateButtons : function() {
    	
    	if (this.showDirection) {
        	var newIconCls = this.sortAscending ? this.sortAscendingIcon.iconCls : this.sortDescendingIcon.iconCls;
    		this.sortDirectionButton.setIconCls(newIconCls);
    	}
    	
    	if (this.sortLabel != this.sorterMenu.getText()) {
	    	this.sorterMenu.setText(this.sortLabel || this.defaultLabel);    		
    	}
    	
    },
    
    /**
     * @private
     */
    _onMenuItemClick : function(menu, item, event, silent) {
    	
    	this.sortProperty = item.property;
    	this.sortLabel = item.text;
    	this.sortAscending = undefined != item.sortAscending ? item.sortAscending : true;
    	this.selectedItem = item;
    	
    	this._udpateButtons();
    	if (true !== silent) {
    		this.fireEvent(this.sortEventName, this.sortProperty, this.sortAscending, this.selectedItem);
    	}
    	
    },
    
    /**
     * @private
     */
    _onSortButtonClick : function(button, event) {
    	
    	this.sortAscending = !this.sortAscending;
    	
    	this._udpateButtons();
    	this.fireEvent(this.sortEventName, this.sortProperty, this.sortAscending, this.selectedItem);
    	
    }
    
});