Ext.define('Yaecma.view.documents.SortersMenu', {
	
	SORT_ASCENDING_ICON : Yaecma.Constants.getIconDefinition('sort_ascending'),
	SORT_DESCENDING_ICON : Yaecma.Constants.getIconDefinition('sort_descending'),
	DEFAULT_LABEL : 'Trier par',
	
	extend : 'Ext.container.Container',
	alias : 'widget.sortersmenu',
	
	requires : [
		'Ext.button.Button'
	],
	layout : 'hbox',
    
    sortAscending : true,
    sortProperty : null,
    sortLabel : null,
    
    //padding : '0 1 2 1',
    margin : 0,
    
    filterMenu : null,
    sortDirectionButton : null,
    
    initComponent : function() {
    	
    	this.filterMenu = Ext.create('Ext.button.Button', {
    		
    		text : this.DEFAULT_LABEL,
    		
    		//plain : true,
    		
			menu : {
				xtype : 'menu',
				items : [
			        {"property":"@cm:name", "text":"Nom"},
			        {"property":"@cm:title", "text":"Titre"},
			        {"property":"@cm:created", "text":"Création"},
			        {"property":"@cm:modified", "text":"Modification"},
			        {"property":"@cm:content.size", "text":"Taille"},
			        {"property":"@cm:content.mimetype", "text":"Type MIME"}
			        //{"property":"@TYPE", "text":"Type"}
				],
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
    
    /**
     * @private
     */
    _udpateButtons : function() {
    	
    	var newIconCls = this.sortAscending ? this.SORT_ASCENDING_ICON.iconCls : this.SORT_DESCENDING_ICON.iconCls;
    	this.sortDirectionButton.setIconCls(newIconCls);
    	
    	if (this.sortLabel != this.filterMenu.getText()) {
	    	this.filterMenu.setText(this.sortLabel || this.DEFAULT_LABEL);    		
    	}
    	
    },
    
    /**
     * @private
     */
    _onMenuItemClick : function(menu, item, event) {
    	this.sortProperty = item.property;
    	this.sortLabel = item.text;
    	this.sortAscending = true;
    	
    	this._udpateButtons();
    	this.fireEvent('sortby', this.sortProperty, this.sortAscending);
    },
    
    _onSortButtonClick : function(button, event) {
    	this.sortAscending = !this.sortAscending;
    	
    	this._udpateButtons();
    	this.fireEvent('sortby', this.sortProperty, this.sortAscending);    	
    }
    
});