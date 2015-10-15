/**
 * TODO: bpajot - 2015
 * Factorize
 */
Ext.define('Yamma.view.mails.GroupersMenu', {
	
	GROUP_ASCENDING_ICON : Yamma.Constants.getIconDefinition('shape_group'),
	GROUP_DESCENDING_ICON : Yamma.Constants.getIconDefinition('shape_group'),
	DEFAULT_LABEL : 'Grouper par',
	
	extend : 'Ext.container.Container',
	
	requires : [
		'Ext.button.Button'
	],
	layout : 'hbox',
    
    groupAscending : true,
    groupProperty : null,
    groupLabel : null,
    
    margin : 0,
    
    grouperMenu : null,
//    groupDirectionButton : null,

    groupers : [
	],
    
    initComponent : function() {
    	
    	var availableGroupers = [{
    		property : '',
    		text : 'Aucun',
    		iconCls : Yamma.Constants.getIconDefinition('cancel').iconCls
    	}].concat(this.groupers);
    	
    	this.grouperMenu = Ext.create('Ext.button.Button', {
    		
    		iconCls : this.GROUP_ASCENDING_ICON.iconCls,
    		text : this.DEFAULT_LABEL,
    		
			menu : {
				items : availableGroupers,
			    listeners : {
			    	
			    	'click' : {
			    		fn : this._onMenuItemClick,
			    		scope : this
			    	}
			    	
			    }
			}
			
    	});
    	
//    	this.groupDirectionButton = Ext.create('Ext.button.Button', {
//    		
//    		listeners : {
//    			
//    			'click' : {
//    				fn : this._onGroupButtonClick,
//    				scope : this
//    			}
//    			
//    		}
//    		
//    	});
    	
    	this.items = [
    	    this.grouperMenu 
//    	    this.groupDirectionButton
    	];
    	
    	this.callParent(arguments);
    	
    	this._udpateButtons();
    	
    	this.addEvents('groupby');
    	
    },
    
    /**
     * @private
     */
    _udpateButtons : function() {
    	
//    	var newIconCls = this.groupAscending ? this.GROUP_ASCENDING_ICON.iconCls : this.GROUP_DESCENDING_ICON.iconCls;
//    	this.groupDirectionButton.setIconCls(newIconCls);
    	
    	if (this.groupLabel != this.grouperMenu.getText()) {
	    	this.grouperMenu.setText(this.groupLabel || this.DEFAULT_LABEL);    		
    	}
    	
    },
    
    /**
     * @private
     */
    _onMenuItemClick : function(menu, item, event) {
    	
    	this.groupProperty = item.property;
    	this.groupLabel = item.text;
    	this.groupAscending = true;
    	this.selectedGroupItem = item;
    	
    	this._udpateButtons();
    	this.fireEvent('groupby', item, this.groupProperty, this.groupAscending);
    	
    },
    
    _onGroupButtonClick : function(button, event) {
    	
    	this.groupAscending = !this.groupAscending;
    	
    	this._udpateButtons();
    	this.fireEvent('groupby', this.selectedGroupItem, this.groupProperty, this.groupAscending);
    	
    }
    
});