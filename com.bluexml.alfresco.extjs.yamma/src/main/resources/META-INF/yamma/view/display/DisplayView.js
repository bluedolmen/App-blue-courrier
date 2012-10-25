Ext.define('Yamma.view.display.DisplayView', 
{

	extend : 'Ext.tab.Panel',
	alias : 'widget.displayview',

	requires: [
        'Bluexml.utils.tab.Tool',
        'Yamma.view.display.ReplyFilesButton'
    ],
    
    uses : [
		'Bluexml.view.utils.PreviewFrame'    
    ],
	
	title : 'Prévisualisation des fichiers',
	//layout : 'fit',
	plain : false,
	
    plugins: [
    
        Ext.create('Bluexml.utils.tab.Tool', {
            ptype : 'itstabtool',
            items: [
            	{
	            	xtype : 'replyfilesbutton',
	            	disabled : true
	            }
			]
        })
        
    ],
    
    initComponent : function() {
    	
    	var me = this;    	    	
    	installTabDblClickEvent();
    	this.callParent();
    	// end
    	
    	/**
		 * The following function installs a tab double-click listener which
		 * enable to provide a specific behaviour like maximizing the window.
		 */
    	function installTabDblClickEvent() {
    		
	    	me.addEvents('tabdblclick');
	    	me.on('add', 
	    		function(container, component, position) {
	    			
	    			component.on('afterrender',
	    				function(comp) {    					
	    					Ext.get(comp.getEl()).on('dblclick',
	    						function(event, el) {
	    							me.fireEvent('tabdblclick', me, comp);
	    						}
	    					);
	    				}
	    			);
	    			
	    		}
	    	);
    		
    	}
    	
    },
    
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
			
			nodeId = Bluexml.Alfresco.getNodeId(nodeRef),
			
			previewFrame = Ext.create('Bluexml.view.utils.PreviewFrame', {
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
								title : ' '
							})
						] 
					}
				;
				
				parent = this.add(newTab);
				
			}
		}
		
		var previewTab = parent.add(previewTabConfig);
		
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
	
	removePreviewTab : function(nodeRef) {
		
		if (!nodeRef) return;
		var previewTab = this.getPreviewTab(nodeRef);
		if (!previewTab) return;
		
		this.remove(previewTab);
	},
	
	getPreviewTab : function(nodeRef) {
		
		if (!nodeRef) return null;
		var 
			nodeId = Bluexml.Alfresco.getNodeId(nodeRef),
			previewTab = this.down('#' + nodeId);
			
		return previewTab;
		
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