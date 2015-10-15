/**
 */
Ext.define('Bluedolmen.utils.alfresco.grid.AlfrescoStoreTablePanel', {
	
	mixins : {
		alfrescostoretable : 'Bluedolmen.utils.alfresco.grid.AlfrescoStoreTable'
	},
	
	uses : [
		'Ext.toolbar.Paging',		
		'Bluedolmen.utils.DirtyManager'
	],
	
	title : '', // should be overridden
	
	columns : [], // columns will be configured dynamically		
	plain : true,
	stateful : true,
	
	config : {
		hasPaging : true
	},
	
	/**
	 * @private
	 * @type Boolean
	 */
	loaded : false, // custom private use
	isDirty : false, // custom use
	
	initComponent : function(onInitComplete) {
		
		var me = this;
		
		syncRequiredActions(onActionsLoaded);
		
		function onActionsLoaded() {
			
			setColumns();
			setDockedItems();
			saveDefaultTitle();
			setPaging();

			me.viewConfig = Ext.Object.merge(me.viewConfig || {}, 
				{
					listeners : {
						'refresh' : {
							fn : me.onViewRefresh,
							scope : me
						}
					}
				}
			);

		    registerDirtyListener();
		    registerReconfigureListener();
		    registerItemContextMenuListener();

		    if (Ext.isFunction(onInitComplete)) {
		    	onInitComplete.call(me);
		    }
		    
		}
	    
	    // Meant to be used as a mixin, that's why we do not call this.callParent()
	    	    
	    /*
	     * PRIVATE INNER FUNCTIONS
	     */
	    
	    function setColumns() {
			var columns = me.getColumns();
			if (null == columns) return;
			
			me.columns = me.adaptColumns(columns);
	    }
	    
	    function setDockedItems() {
			var dockedItems = me.getDockedItemDefinitions();
			if (!dockedItems || dockedItems.length == 0) return;
			
			me.dockedItems = ([] || me.dockedItems).concat(dockedItems);
	    }
	    	    
	    function saveDefaultTitle() {
	    	if (!me.title) return;
	    	me.defaultTitle = me.title;
	    }
	    
	    function setPaging() {
	    	
	    	if (me.getHasPaging()) return;
	    		
			me.storeConfigOptions = Ext.apply(
				{
				
				    pageSize : -1, //no paging
				    remoteSort : false // sort will be performed locally
				    
				},
				me.storeConfigOptions
			);

	    }
	    
	    function registerDirtyListener() {
	    	
	    	Bluedolmen.utils.DirtyManager.on(
	    		'dirty',
	    		me.onDirty,
	    		me /* scope */
	    	);
	    	
	    	me.on('activate', function() {me.refreshDirty();}, me);
			
	    }
	    
	    function registerReconfigureListener() {
	    	me.on('reconfigure', me.onReconfigure, me);
	    }
	    
	    function registerItemContextMenuListener() {
	    	
	    	if (Ext.isEmpty(me.itemactions)) return;
	    	me.on('itemcontextmenu', me.onItemContextMenu, me);
	    	
	    }
	    
	    function syncRequiredActions(onActionsLoaded) {
	    	
	    	var 
	    		actions = (me.gridactions || []).concat(me.itemactions),
	    		stringActions = Ext.Array.filter(actions, function(action) {
					return Ext.isString(action);	    			
	    		})
	    	;
	    	
	    	Ext.syncRequire(stringActions, onActionsLoaded);
	    	
	    }
	    
	},	
    
    onReconfigure : function() {
    	
    	var pagingToolbar = this.getPagingToolbar();
    	if (!pagingToolbar) return;
    	
    	// Ensure that the paging-toolbar is also bound to store when the grid is reconfigured
    	pagingToolbar.bindStore(this.getStore());    
    	
    },
    
    getColumns : function() {
    	
    	return null;
    
    },
    
    adaptColumns : function(columns) {
    	
    	// Remove null or undefined column definitions
    	return Ext.Array.clean(columns);
    	
    },
    
    getPagingToolbar : function() {
    	
    	var pagingToolbars = this.getDockedItems('pagingtoolbar');
    	if (pagingToolbars.length > 0) return pagingToolbars[0];
    	
    },
    
    getDockedItemDefinitions : function() {
    	
    	if (!this.getHasPaging()) return [];
    	
		return [
			{
				xtype : 'pagingtoolbar',
				dock : 'bottom',
				displayInfo : true,
				displayMsg : 'Résultats {0} - {1} sur {2}',
				emptyMsg : 'Aucun résultat'
			}
		];
		
    },    
    
    /**
     * Refresh the list by applying a given filter
     * 
     * @deprecated This method should not be used anymore, using the load method directly is the prefererred method
     * @param {} filterConfiguration
     */
 	filter : function(filterConfiguration) {
 		
		var mappedFilters = this.mapFilters(filterConfiguration); // Apply filters if any
		this.load(
			{
				filters : mappedFilters
			},
			null,
			filterConfiguration.meta
		);
		
 	},
 	
 	load : function(storeConfigOptions, proxyConfigOptions, extraConfig) {
 		
 		extraConfig = extraConfig || {};
 		
		var newTitle = extraConfig.ref;
		if (!this.updateTitle(newTitle)) this.resetTitleToDefault();
 		
		var dirtyListeners = extraConfig.dirtyListeners;
 		if (undefined !== dirtyListeners) this.dirtyListeners = dirtyListeners;
 		this.setDirty(false);
		
 		this.mixins.alfrescostoretable.load.apply(this, arguments);
 		loaded = true;
 		
 	},
 	
	/**
	 * @return {Boolean} true if the title is updated
	 */
	updateTitle : function(newTitle) {
		
		if (!newTitle || 'string' != typeof newTitle) return false;
		
		if (newTitle.charAt(0) == '^') {
			// Replace-mode
			newTitle = newTitle.slice(1);
		} else {				
			newTitle = (this.defaultTitle || '') + ' ' + newTitle;
		}
		
		this.setTitle(newTitle);
		return true;
		
	},
	
	resetTitleToDefault : function() {
		
		var title = this.title;
		var defaultTitle = this.defaultTitle;
		if (!defaultTitle || title == defaultTitle) return;
		
		this.setTitle(defaultTitle);
		
	},
	
	/**
	 * Refresh the current list.
	 * 
	 * The keepSelection argument should be used to restore the selection but
	 * the dual implementation using a potential paging-toolbar is ineffective
	 * since the paging toolbar does not raise the refresh event on which we
	 * count on. This functionality is thus deactivated.
	 * 
	 * @param {Boolean}
	 *            keepSelection NOT USED YET
	 */
 	refresh : function(keepSelection, onRefreshPerformed) {
 		
 		if (!loaded) return; // no refresh if no store is defined yet
 		
 		this.onRefreshPerformed = onRefreshPerformed || null;
 		
 		if (keepSelection) {
 			this.rememberSelection();
 		}
 		
 		var pagingToolbar = this.getPagingToolbar();
 		if (pagingToolbar) pagingToolbar.doRefresh(); // using paging-toolbar context to refresh correctly
 		else this.mixins.alfrescostoretable.refresh.apply(this); // delegates to AlfrescoStoreTable mixin
 		 		
 		this.setDirty(false);
 		
 	},
 	
 	onViewRefresh : function() {
 		
 		this.refreshSelection();
 		
 		if (this.onRefreshPerformed) {
 			this.onRefreshPerformed.call(this);
 			this.onRefreshPerformed = null;
 		}
 		
 	},
 	
 	/**
 	 * Reset saved selection
 	 * @private
 	 */
 	resetSelection : function() {
 		
 		this.selectedRecords = null;
 		
 	},
 	
 	/**
 	 * Store the selection state
 	 * @private
 	 */
	rememberSelection : function() {
		
		if (!this.rendered || Ext.isEmpty(this.el)) { return; }

		this.selectedRecords = this.getSelectionModel().getSelection();
		this.getView().saveScrollState();
		
	},
	
	/**
	 * Restore the selection state from the previously saved
	 * @private
	 */
    refreshSelection : function() {
    	
		if (!this.selectedRecords || 0 >= this.selectedRecords.length) { return; }

		var newRecordsToSelect = [];
		for (var i = 0; i < this.selectedRecords.length; i++) {
			record = this.getStore().getById(this.selectedRecords[i].getId());
			if (!Ext.isEmpty(record)) {
				newRecordsToSelect.push(record);
			}
		}

		if (newRecordsToSelect.length == 0) {return; }; // Return if there is no records (else select produces an error)
		
		this.getSelectionModel().select(newRecordsToSelect);
		Ext.defer(
			this.setScrollTop, 30, this,
			[this.getView().scrollState.top]
		);
		
	},
 	
 	/**
 	 * This method abstract the underlying store to return a record given an id
 	 * 
 	 * @param id
 	 * @returns
 	 */
 	getRecordById : function(id) {

 		throw new Error('Unsupported! This method has to be overridden by a subclass');
 		
 	},
 	
 	findRecord : function(fieldName, value) {
 		
 		throw new Error('Unsupported! This method has to be overridden by a subclass');
 		
 	},
	
	/**
	 * This method visually updates the record designed by the given id by
	 * retrieving values from the configured proxy.
	 * 
	 * TODO: Brice => This method may be weak and subject to problems! (making a
	 * clean method would require a deep understanding of the ExtJS internals)
	 * 
	 * @param {String}
	 *            id the id of the refreshed element
	 */
	refreshSingle : function(id, idParam) {
		
		var 
			store = this.getStore(),
			proxy = store.getProxy(),
			currentRecord = this.getRecordById(id),
//			index = store.indexOf(currentRecord),
			options = {
				action : 'read',
				filters : [
					{
						property : idParam || 'id',
						value : id
					}
				]
			},
			operation
		;
		
		if (null == currentRecord) return; // The given element id is not available in the store
		
		operation = Ext.create('Ext.data.Operation', options);
		proxy.read(operation, onProxyPrefetch);
		
		function onProxyPrefetch(operation) {
			
			var 
				records = operation.getRecords(),
				newRecord = records ? records[0] : null,
				successful = operation.wasSuccessful()
			;
			
			if (!successful || !newRecord) return;
			
			store.loadRecords(records, {addRecords : true});
			
//			newRecord.beginEdit();
//			newRecord.fields.each(function(field){
//				var 
//					name = field.name,
//					newValue = newRecord.get(name)
//				;
//				currentRecord.set(name, newValue);
//				// Brice... Awful!!!! This is far too low-level and implementation-dependant
//				currentRecord.dirty = false;
//				currentRecord.modified = {};
//			});
//			newRecord.endEdit();

//			me.getView().refreshNode(index);
		}
		
	},
	
 	/**
	 * Helper function that maps inner filter definition to ExtJS filter
	 * definition
	 * <p>
	 * Subclasses may redefine or specialize this behavior to take care of
	 * additional information provided by the controller
	 * 
	 * @deprecated Used in conjunction with filter, this method is now
	 *             deprecated
	 */
	mapFilters : function(filterConfiguration) {
	
 		var filters = filterConfiguration.filters;
 		if (undefined === filters) return [];
 		if (!Ext.isArray(filters)) filters = [filters];
 		
 		return Ext.Array.map(filters,
 		
 			function(filter) {
 				return {
 					property : filter.id,
 					value : filter.value
 				};
 			}
 			
 		);
 		
 	},
 	
 	setDirty : function(isDirty) {
 		
 		this.isDirty = (undefined === isDirty) || isDirty;
 		this.refreshDirty();
 		
 	},
 	
 	onDirty : function(componentId) {
 		
 		if (!this.dirtyListeners) return;
 		if (!Ext.Array.contains(this.dirtyListeners, componentId)) return;
 		
 		this.setDirty(true);
 		
 	},
 	
 	refreshDirty : function() {
 		
 		if (!this.isDirty) return;
 		if (!this.isVisible()) return;
 		
 		this.refresh();
 		
 	},
 	
 	destroy : function() {
 		
    	Bluedolmen.utils.DirtyManager.un(
    		'dirty',
    		this.onDirty,
    		this /* scope */
    	);
 		
 	},
 	
 	/*
 	 * ACTIONS (COLUMN) MANAGEMENT
 	 */
 	
	getActionsColumnDefinition : function() {
		
		var 
			me = this,
			gridactions = me.gridactions,
			maxAvailableActions = me.maxAvailableActions || gridactions.length
		;
		
		if (null == gridactions) return null;
		gridactions = [].concat(gridactions);
		
		this.gridactions = gridactions = Ext.Array.map(gridactions, function(gridaction) {
			
			if (Ext.isString(gridaction)) {
				gridaction = Ext.create(gridaction);
			} 
				
			if (Ext.isFunction(gridaction.init)) {
				gridaction.init(me);
			}
			
			return gridaction;
			
		});
		
		var items = [], gridaction, i, len;
		for (i = 0, len = gridactions.length; i < len; i++) {
			gridaction = gridactions[i];
			items.push(gridaction.getActionDefinition(i /* index */));
		}
		
		var definition = this.applyDefaultColumnDefinition (
			{
				xtype : 'alfrescoactioncolumn',
				maxWidth : maxAvailableActions * 20 + 10,
				items : items				
			}
		);
		
		return definition;
		
	},
	
	
	onItemContextMenu : function(view, record, item, index, e) {
		
		e.preventDefault();
		
		var 
			me = this,
			item_ = item,
			view_ = view,
			contextMenu = buildContextMenu()
		;
		
		contextMenu.showAt(e.getXY());
		
		function buildContextMenu() {
			
			var items = [];
			
			Ext.Array.forEach(me.itemactions, function(actionDef) {
				
				var action = Ext.isString(actionDef) 
					? Ext.create(actionDef) 
					: actionDef;
				if (false === action.isAvailable) return;
				
				if (Ext.isFunction(action.init)) {
					action.init(me);
				}			
				
				action.setRecord(record);
				if (Ext.isFunction(action.isAvailable) && !action.isAvailable(record)) return;
				
				action.setHandler( Ext.bind(action.execute, me, [record, item_, view_]) );
				
				items.push(action);
				
			});
			
			var
				menu = Ext.create('Ext.menu.Menu',{
					items : items
				})
			;
			
			return menu;
			
		}
		
	}
 	
});
