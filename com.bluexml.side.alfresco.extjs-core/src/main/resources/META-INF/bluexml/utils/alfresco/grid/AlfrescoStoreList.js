/**
 * The behavior of this abstract class consist in offering the capability of
 * filtering a list.
 * <p>
 * This class also set the default behavior of most of the list views
 * (retrieving columns, setting a paging-toolbar, etc...)
 * <p>
 * TODO: Most of the initial material of this list is now factorized in
 * BritairStoreGrid. This class should be renamed with a more significant name
 * like FilteringList...
 */
Ext.define('Bluexml.utils.alfresco.grid.AlfrescoStoreList', {
	
	extend : 'Ext.grid.Panel',
	alias : 'widget.alfrescostorelist',
	
	requires : [
		'Bluexml.Store',
		'Bluexml.utils.alfresco.grid.AlfrescoStoreGrid'
	],
	
	mixins : {
		alfrescostoregrid : 'Bluexml.utils.alfresco.grid.AlfrescoStoreGrid'
	},
	
	uses : [
		'Ext.toolbar.Paging'
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
	
	
	initComponent : function() {
		
		var me = this;
		
		setColumns();
		setDockedItems();
		saveDefaultTitle();
		setPaging();
	    this.callParent();
	    
	    var view = this.getView();
	    view.on('refresh', this.onViewRefresh, this);
	    
	    changeHeaderMenuLabels(); // change sorting labels (french ones)
	    registerDirtyListener();
	    registerReconfigureListener();
	    	    
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
	    	if (!me.getHasPaging()) {
	    		
				me.storeConfigOptions = Ext.apply(
					{
					
					    pageSize : -1, //no paging
					    remoteSort : false // sort will be performed locally
					    
					},
					me.storeConfigOptions
				);
	    		
	    	}
	    }
	    
	    function changeHeaderMenuLabels() {
	    	var headerCt = me.headerCt;
		    if (null == headerCt) return;
			headerCt.sortAscText = 'Trier croissant';
	    	headerCt.sortDescText = 'Trier décroissant';
	    }
	    
	    function registerDirtyListener() {
	    	
	    	Bluexml.utils.DirtyManager.on(
	    		'dirty',
	    		me.onDirty,
	    		me /* scope */
	    	);
	    	
	    	me.on('activate', function() {me.refreshDirty();}, me);
			
	    }
	    
	    function registerReconfigureListener() {
	    	me.on('reconfigure', me.onReconfigure, me);
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
		
 		this.mixins.alfrescostoregrid.load.apply(this, arguments);
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
 		
 		var me = this;
 		
 		this.onRefreshPerformed = onRefreshPerformed || null;
 		
// 		if (onRefreshPerformed) {
// 			
// 			me.getView().on('refresh', function() {
// 				onRefreshPerformed.call(me);
// 				me.un('refresh')
// 			}, me);
// 			
// 		}
 		
// 		if (undefined !== keepSelection) {
// 			Ext.log('Warning! keepSelection argument is not supported yet!');
// 		}
 		
// 		var view = this.getView();
// 		var me = this;
// 		var callback = function() {
// 			Ext.MessageBox.alert(this.id + ' : view ready');
// 			console.log(this.id + ' : view ready');
// 			view.mun('viewready', callback, me);
// 		};
// 		view.mon('viewready', callback, this);
// 		view.mon('refresh', callback, this);
 		
 		if (keepSelection) {
 			this.rememberSelection();
 		}
 		
// 		var 
// 			me = this,
// 			store = this.getStore();
// 			
// 		store.on('load', function() {
// 			me.getView().refresh();
// 		}, me);
 		
 		var pagingToolbar = this.getPagingToolbar();
 		if (pagingToolbar) pagingToolbar.doRefresh(); // using paging-toolbar context to refresh correctly
 		else this.mixins.alfrescostoregrid.refresh.apply(this); // delegates to AlfrescoStoreGrid mixin
 		
 		
// 		this.refreshSelection();
// 		this.resetSelection();
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
			me = this,
			store = this.getStore(),
			proxy = store.getProxy(),
			index = store.indexOfId(id),
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
		
		if (-1 == index) return; // The given element id is not available in the store

        operation = Ext.create('Ext.data.Operation', options);
		proxy.read(operation, onProxyPrefetch);
				
		function onProxyPrefetch(operation) {
			
			var 
				records = operation.getRecords(),
				newRecord = records[0],
				currentRecord = store.getAt(index),
				successful = operation.wasSuccessful()
			;
			
			if (!successful || !newRecord) return;
			
			newRecord.fields.each(function(field){
				var 
					name = field.name,
					newValue = newRecord.get(name)
				;
				currentRecord.set(name, newValue);
				// Brice... Berk!!!! This is far too low-level
				currentRecord.dirty = false;
				currentRecord.modified = {};
			});

			me.getView().refreshNode(index);
		}
		
	},
	
 	/**
	 * Helper function that maps inner filter definition to ExtJS filter
	 * definition
	 * <p>
	 * Subclasses may redefine or specialize this behaviour to take care of
	 * additional information provided by the controller
	 * 
	 * @deprecated Used in conjunction with filter, this method is now
	 *             deprecated
	 */
	mapFilters : function(filterConfiguration) {
	
 		var filters = filterConfiguration.filters;
 		if (undefined === filters) return [];
 		
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
 		
    	Bluexml.utils.DirtyManager.un(
    		'dirty',
    		this.onDirty,
    		this /* scope */
    	);
 		
 		this.callParent(arguments);
 	}
 	
});