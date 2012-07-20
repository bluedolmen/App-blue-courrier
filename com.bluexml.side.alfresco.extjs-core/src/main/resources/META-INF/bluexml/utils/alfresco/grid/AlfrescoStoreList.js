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
			if (null == dockedItems) return;
			
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
 	
 	refresh : function(keepSelection) {
 		if (!loaded) return; // no refresh if no store is defined yet
 		
 		var selection = keepSelection ? this.getSelectionModel().getSelection() : null;
 		
 		var pagingToolbar = this.getPagingToolbar();
 		if (pagingToolbar) pagingToolbar.doRefresh(); // using paging-toolbar context to refresh correctly
 		else this.load();
 		
 		this.setDirty(false);
 		
 		if (selection && keepSelection) this.getSelectionModel().select(selection);
 	},
 	
 	/**
	 * Helper function that maps inner filter definition to ExtJS filter
	 * definition
	 * <p>
	 * Subclasses may redefine or specialize this behaviour to take care of
	 * additional information provided by the controller
	 * @deprecated Used in conjunction with filter, this method is now deprecated
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