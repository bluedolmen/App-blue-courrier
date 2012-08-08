Ext.define('Yamma.view.display.DisplayView', {

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
	layout : 'fit',
	plain : true,
	
    plugins: [
    
        Ext.create('Bluexml.utils.tab.Tool', {
            ptype : 'itstabtool',
            items: [
            	{
	            	xtype : 'button',
	            	id : 'attachedFilesButton',
	            	iconCls: 'icon-attach',
	            	disabled : true
	            },
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
    
    
	addPreviewTab : function(nodeRef, mimetype, tabConfig, setActive) {
		
		setActive = !!setActive;
		
		var 
			nodeId = Bluexml.Alfresco.getNodeId(nodeRef),
			
			previewFrame = Ext.create('Bluexml.view.utils.PreviewFrame'),
			
			defaultTabConfig = {
				itemId : nodeId,
				title : '',
				layout : 'fit',
				items : [
					previewFrame
				],
				getSourceUrl : function() {
					return child('previewframe').src;
				}
			},
			
			previewTab = this.add(Ext.apply(defaultTabConfig, tabConfig))
		;
		
		previewFrame.load({
			nodeRef : nodeRef,
			mimetype : mimetype
		});
		
		if (setActive) this.setActiveTab(previewTab);
		return previewTab;
		
	},
	
	getPreviewTab : function(nodeRef) {
		
		if (!nodeRef) return null;
		var 
			nodeId = Bluexml.Alfresco.getNodeId(nodeRef),
			previewTab = this.child('#' + nodeId);
			
		return previewTab;
		
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