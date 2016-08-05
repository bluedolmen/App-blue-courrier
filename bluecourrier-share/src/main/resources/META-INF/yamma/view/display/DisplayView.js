Ext.require([
    'Yamma.view.display.DblClickTabHandler',
    'Yamma.view.display.YammaTabActionMenu'
], function() {

Ext.define('Yamma.view.display.DisplayView', 
{

	extend : 'Ext.tab.Panel',
	alias : 'widget.displayview',

	requires: [
        'Bluedolmen.utils.tab.Tool'
    ],
    
    uses : [
		'Bluedolmen.view.utils.PreviewFrame'    
    ],
	
	title : 'Prévisualisation des fichiers',
	plain : false,
	
    plugins: [
              
       	Ext.create('Bluedolmen.utils.tab.Tool', {
       		
       		position : 'before',
       		items : [
				{
					xtype : 'button',
					itemId : 'synchronize',
					tooltip : 'Synchroniser la prévisualisation',
					iconCls : Yamma.Constants.getIconDefinition('synchronize').iconCls,
					enableToggle : true
				}
			]
       		
       	}),
    
    	Ext.create('Yamma.view.display.YammaTabActionMenu'),
        Ext.create('Yamma.view.display.DblClickTabHandler')        
        
    ],
    
    /**
     * 
     * @param config {Object} The configuration of the new tab:
     * - nodeRef (String): the Alfresco nodeRef of the displayed element
     * - mimetype (String): the mimetype of the displayed element (may be used to call the fitted previewer)
     * - tabConfig (Object): additional configuration of the new tab
     * - setActive (Boolean): whether to make the new tab active 
     * 
     * @returns
     */
	addPreviewTab : function(config) {
		
		if (Ext.isString(config)) {
			config = {
				nodeRef : config
			};
		}
		
		var
			nodeRef = config.nodeRef,
			mimetype = config.mimetype,
			tabConfig = config.tabConfig,
			setActive = !!config.setActive,
			parentRef = config.parentRef,
			position = config.position,
			
			nodeId = Bluedolmen.Alfresco.getNodeId(nodeRef),
			
			previewFrame = Ext.create('Bluedolmen.view.utils.PreviewFrame', {
	        	nodeRef : nodeRef,
	        	mimeType : mimetype
			}),
			
			defaultTabConfig = {
				xtype : 'container',
				itemId : nodeId,
				title : '',
				layout : 'fit',
				border : 0,
				
				items : [
					previewFrame
				]
			},
			
			previewTabConfig = Ext.apply(defaultTabConfig, tabConfig),
			parent = this
		;
		
		if (parentRef) {
			
			parent = this.getPreviewTab(parentRef) || parent;			
			if ('container' == parent.xtype) {
				// No inside tabpanel => create one
				
				this.remove(parent, false /* autoDestroy */);				
				
				var 
					newTab = {
						title : parent.title,
						iconCls : parent.iconCls,
						itemId : parent.itemId,
						context : parent.context,
						xtype : 'tabpanel',
						tabPosition : 'bottom',
						border : 0,
						items : [
							Ext.apply(parent, {
								title : '&nbsp;'
							})
						] 
					}
				;
				
				parent = this.add(newTab);
				
			}
		}
		
		var previewTab = Ext.isNumber(position) 
			? parent.insert(position, previewTabConfig)  
			: parent.add(previewTabConfig);
		
		if (setActive) {
			var ancestorTabPanel = parent.up('tabpanel');
			if (ancestorTabPanel) {
				ancestorTabPanel.setActiveTab(parent);
			}
			
			parent.setActiveTab(previewTab);
		}
		
		previewFrame.load();
		
		return previewTab;
		
	},
	
	refreshPreviewTab : function(nodeRef) {
		
		if (!nodeRef) return;
		
		var previewTab = this.getPreviewTab(nodeRef);
		if (!previewTab) return;
		
		var previewFrame = previewTab.down('previewframe');
		if (!previewFrame) return;
		
		previewFrame.refresh();
		
	},
	
	removePreviewTab : function(nodeRef) {
		
		if (!nodeRef) return;
		var previewTab = this.getPreviewTab(nodeRef);
		if (!previewTab) return;
		
		this.remove(previewTab);
	},
	
	getPreviewTab : function(config) {

		var me = this;
		
		if (!config) return;
		
		if (Ext.isString(config)) {
			return getPreviewTabByNodeRef(config);
		} else if (Ext.isFunction(config)) {
			return getPreviewTabByContext(config);
		}
		
		function getPreviewTabByNodeRef(nodeRef) {
			var 
				nodeId = Bluedolmen.Alfresco.getNodeId(nodeRef),
				previewTab = me.down('#' + nodeId);
				
			return previewTab;
		}
		
		function getPreviewTabByContext(acceptFunction) {
			
			var 
				tabs = me.query('.tab') || []
			;
			
			return Ext.Array.filter(tabs, function(tab) {
				
				var card = tab.card;
				if (!card) return false;
				
				var context = card.context;
				if (!context) return false;
				
				return true === acceptFunction(context);
				
			});
			
		}
		
	},


	/**
	 * Display the preview tab given the nodeRef of the document to display.
	 * 
	 * If a tab already exists with that nodeRef, then set active this tab
	 * else create the new tab.
	 * 
	 * @param {String}
	 *            nodeRef the Alfresco nodeRef
	 * @param {String}
	 *            mimetype the mimetype of the displayed document (if
	 *            available)
	 * @param tabConfig
	 *            {Object} the tab-configuration (e.g., title, icon, ...)
	 *            
	 * @returns {Ext.tab.Tab} the tab which is either created or shown
	 */
	showPreviewTab : function(config) {

		if (Ext.isString(config)) {
			config = {
				nodeRef : config
			};
		}
		
		config = Ext.apply(config, { setActive : true} );

		var previewTab = this.getPreviewTab(config.nodeRef);
		if (previewTab) {
			var parentTabPanel = previewTab.up('tabpanel');
			if (parentTabPanel) {
				parentTabPanel.setActiveTab(previewTab);
				return previewTab;				
			}
		}
		
		return this.addPreviewTab(config);
		
	},
	
	getPreviewFrame : function(arg) {
		
		var previewTab = Ext.isString(arg) ? this.getPreviewTab(arg /* nodeRef */) : arg;
		if (!previewTab) return null;
		
		return previewTab.child('previewframe');
		
	},
	
	clear : function() {
		
		this.removeAll();
		
	}
	
});

});
