//TODO: Externalize this code to the generic framework?
//TODO: Refactor as a grid plugin?
/**
 * Meant to be used as a mixin to get the batch-actions on a grid
 */
Ext.define('Yamma.view.mails.BatchActionable', {
	
	statics : {
		
		actionsButton : {
			xtype : 'button',
			scale : 'small',
			iconCls : Yamma.Constants.getIconDefinition('lightning').iconCls,
			itemId : 'actions-button',
			tooltip : 'Actions disponibles sur les éléments sélectionnés',
			showEmptyMenu : true,
			menu : []
		}
		
	},
	
	thingsHaveChanged : false,
	
	init : function() {
	
		var me = this;
	
		this._setTickMenuItems();
		this.viewConfig = this.viewConfig || {};
		this.viewConfig.markDirty = false;
		
		this.on('viewready', function() {
			
			var actionsButton = me.getActionsButton();
			if (null == actionsButton.menu) { // that shouldn't happen
				actionsButton.menu = Ext.create('Ext.menu.Menu');
			}
			
			me.mon(actionsButton.menu, {
				scope : me,
				beforeShow : me.updateAvailableActions,
				click : me.onActionsButtonMenuClick
			})
			
			this.updateActionsButtonState();
			
		});
				
	},
	
    getTickColumnDefinition : function() {
    	
    	var 
    		me = this
    	;
    	
    	return this.applyDefaultColumnDefinition(
	    	{
	    		xtype : 'checkcolumn',
	    		itemId : 'select-column',
	    		width : 30,
	    		tooltip : 'Sélectionner le document',
	    		plugins : Ext.create('Bluedolmen.utils.grid.column.HeaderImage', {iconCls : Yamma.Constants.getIconDefinition('checkbox').iconCls}),
	    		resizable : false,
				menuDisabled : true,
	    		menuText : '(Dé)Selectionner',
				sortable : false,
				groupable : false,
				hideable : false,
				dataIndex : 'selected',
				listeners : {
					checkchange : function(column, rowIndex, isChecked){
						me.updateActionsButtonState(isChecked);
			        },
			        headerclick : function(ct, column, e, t, eOpts) {
			        	
			        	me.setAllCheckState(!column.checkState);

//			        	// TODO: Changing the icon does not work yet => Remove?
//			        	column.setIconCls(column.allChecked 
//			        		? Yamma.Constants.getIconDefinition('checkbox').iconCls
//			        		: Yamma.Constants.getIconDefinition('checkbox_unchecked').iconCls
//			        	);
			        	
			        	return false;
			        }
				}
	    		
	    	}	
    	);
    	
    },
	
    /**
     * This method will be called in the initComponent to install the
     * appropriate select/unselect menu
     * @private
     */
    _setTickMenuItems : function() {
    	
    	var me = this;
    	
		// Manager the select/unselect menu-items on the corresponding column
		// menu.
		// TODO: Refactor all this to get a select grid feature
		this.headerCt.on('menucreate', function(ct, menu) {
			menu.on('beforeshow', showHeaderMenu);
        	menu.add([
	        	{
	        		xtype : 'menuseparator',
	        		itemId : 'select-submenu-separator'
	        	},
        		{
        			text : 'Sélectionner tout',
        			itemId : 'select-all',
        			iconCls : Yamma.Constants.getIconDefinition('checkbox').iconCls,
        			handler : function() {
        				me.setAllCheckState(true /* checkState */);
        				
        			}
        		},
        		{
        			text : 'Déselectionner tout',
        			itemId : 'unselect-all',
        			iconCls : Yamma.Constants.getIconDefinition('checkbox_unchecked').iconCls,
        			handler : function() {
        				me.setAllCheckState(false /* checkState */);
        			}
        		}
        	]);
		}, this);
		
		function showHeaderMenu(menu) {
			
			var 
				columnDataIndex = menu.activeHeader.dataIndex,
				isSelectedColumn = 'selected' != columnDataIndex,
				selectAllItem = menu.queryById('select-all'),
				unselectAllItem = menu.queryById('unselect-all'),
				separator = menu.queryById('select-submenu-separator')
			;

			selectAllItem.setVisible(!isSelectedColumn);
			unselectAllItem.setVisible(!isSelectedColumn);
			separator.setVisible(!isSelectedColumn);
			
		}
    	
    },
    
    getActionsButton : function() {
    	if (null == this.actionsButton) {
    		this.actionsButton = this.queryById('actions-button');
    	}
    	return this.actionsButton;
    },
    
    getDerivedFields : function() {
    	return [
	    	{
	    		name : 'selected',
	    		type : 'boolean',
	    		defaultValue : false
	    	}
    	];
    	
    },
	
	getSelectedRecords : function() {
		
		var
			store = this.getStore(),
			data = store.data,
			selectedFilter = new Ext.util.Filter({
				filterFn: function(record) {
					return true === record.get('selected');
				}
			}),
			selectedRecords = data.filter(selectedFilter) 
		;
		
		return selectedRecords.items;
		
	},
	
	setAllCheckState : function(checkState) {
		
		var
			store = this.getStore(),
			data = store.data,
			selectColumn = this.queryById('select-column')
		;
		selectColumn.checkState = checkState; 
		
		data.each(function(record) {
			record.set('selected', checkState); // Beware! Does not fire beforecheckchange/checkchange events
		});
		
		this.updateActionsButtonState(checkState);
	},	
	
	hasSelectedRecords : function() {
		return null != this.findRecord('selected', true); 
	},
	
	getAvailableActionsFromSelectedRows : function() {
		
		var
			selectedRecords = this.getSelectedRecords(),
			context = {}
		;
		
		if (Ext.isEmpty(selectedRecords)) return [];
		
		return Ext.Array.filter(this.gridactions,
			function(action) {
				return (true == action.supportBatchedNodes) && action.isBatchAvailable(selectedRecords, context);
			}
		);		
		
	},	
	
	/**
	 * Update the available actions in the actions-menu.
	 * @param {Boolean} [false] showMenu Whether to show the menu once updated
	 * @return {Boolean} whether there is at least one available batchable action
	 */
	updateAvailableActions : function(showMenu) {
		
		if (!this.thingsHaveChanged) return; // Nothing has changed, no need to recompute the available actions

		var 
			availableActions = this.getAvailableActionsFromSelectedRows(),
			actionsButton = this.getActionsButton(),
			selectedRecords = this.getSelectedRecords(),
			firstSelectedRecord = selectedRecords[0],
			menuItems = Ext.Array.map(availableActions, function(action) {
				
				return ({
					text : action.title || action.tooltip || ( Ext.isFunction(action.getTip) ? action.getTip(firstSelectedRecord) : '' ),
					icon : action.icon,
					iconCls : Ext.isFunction(action.getIconCls) ? action.getIconCls(firstSelectedRecord) : undefined,
					action : action,
					hideOnClick : (true !== action.managerAction)

				});
			})
		;
		
		actionsButton.menu.removeAll();		
		this.thingsHaveChanged = false;
		
		if (Ext.isEmpty(menuItems)) return false;

		actionsButton.menu.add(menuItems);
		if (true === showMenu) {
			actionsButton.showMenu();
		}			
		
		return true;

	},
	
	updateActionsButtonState : function(forceEnable) {
		
		var actionsButton = this.getActionsButton();
		if (null == actionsButton) return;
		
		actionsButton[ true === forceEnable || this.hasSelectedRecords() ? 'enable' : 'disable' ]();
		
		this.thingsHaveChanged = true;
		
	},
	
	onActionsButtonMenuClick : function(menu, item, e) {
		
		if (!item) return;
		
		var
			action = item.action,
			selectedRecords = this.getSelectedRecords()
		;
		
		if (null == action) return;
		action.launchAction(selectedRecords, item, e);
	
	}
	
});