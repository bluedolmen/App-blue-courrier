Ext.define('Yamma.view.mails.MailFiltersView', {
	
	extend : 'Ext.panel.Panel',
	alias : 'widget.mailfiltersview',
	
	requires : [
	    'Yamma.view.mails.ServiceFiltersCombo'
	],
	
	layout : 'vbox',
	
	defaults : {
		
		width : '100%',
		margin : 3,
		border : false,
//		split : true,
		flex : 1
		
	},
	
	initComponent : function() {
		
		var
			me = this,
		
			serviceFilterTree = Ext.create('Ext.tree.Panel', {
				
				itemId : 'servicemailsfilter',
				header : false,
				rootVisible : true,
				store : Ext.create('Yamma.view.mails.ServiceFiltersCombo').getTreeStore(),
				border : false,
				
				listeners : {
		    		'select' : me.onNewFilterSelected,
		    		scope : me					
				}
				
			})
		;
		
		this.serviceMailsFilterTree_ = serviceFilterTree; 
		
		this.items = [
		    {
		    	title : 'Services',
		    	itemId : 'servicefilter',
		    	xtype : 'servicesview',
		    	header : false,
		    	rootVisible : true,
		    	showDisabled : true,
			    maxHeight : 200,
			    selModel : Ext.create('Ext.selection.RowModel', {
					mode : 'MULTI',
					ignoreRightMouseSelection : true
				}),
				
				storeConfig : {
					rootLabel : '<b>Tous les services</b>',
					showMembership : true,
					computeAvailableAncestors : true,
					disabledConvertFunction : function(value, record) {
						
						if (false === value) return false; // called when trying to force value on root 
						
						var 
							membership = record.get('membership'),
							role = null
						;
						if (membership) {
							for (role in membership) {
								if (true === membership[role]) return false;
							}
						}
						
						return true;
						
					}	
				},
				viewConfig: {
				    getRowClass: function(record, rowIndex, rowParams, store){
				        return record.get('root') || record.get("isAvailableAncestor") ? "" : Ext.baseCSSPrefix + 'hide-display';
				    }
				},
		    	listeners : {
		    		
		    		'selectionchange' : me.onNewFilterSelected,
		    		
		    		'itemcontextmenu' : function(view, record, item, index, event){
		    			
		    			event.stopEvent();
		    			
		    			var menu = this.getContextMenu();
		    			menu.record = record;
		    			
		    			menu.showAt(event.getXY());
		    			return false;
		    			
				    },
				    
		    		scope : me
		    		
		    	}
		    },
		    {
		    	xtype : 'splitter',
		    	margin : 0,
		    	flex : 0,
		    	border : 1
		    },
		    serviceFilterTree
		];
		
		this.callParent();
		
		this.serviceFilterTree_ = this.queryById('servicefilter');
		
	},
	
	getContextMenu : function() {
		
		var me = this;
		
		function selectAllDescendants() {
			
			var 
				selectedNodes = me.serviceFilterTree_.getSelectedServiceNodes(),
				descendants = [],
				ownerTree 
			;

			/*
			 * The logic wants that you "reselect"
			 * all the descendants of the current
			 * node (and only this one) if the node
			 * is not yet selected ; else it is
			 * considered as a multiple selection
			 * from which we want all the
			 * descendants
			 */
			if (!Ext.Array.contains(selectedNodes, me.contextMenu.record)) {
				selectedNodes = [me.contextMenu.record];
			}
 			
			Ext.Array.forEach(selectedNodes, function(node) {
				
				descendants.push(node);
				node.expandChildren();
				
				node.cascadeBy(function(child){
					descendants.push(child);
				});
				
			});
			
			if (Ext.isEmpty(descendants)) return;
			
			ownerTree = descendants[0].getOwnerTree()
			ownerTree.getSelectionModel().select(descendants, false /* keepSelection */, true /* suppressEvent */);
			
			me.onNewFilterSelected(); // simulate event => a more complex logic should be implemented to check whether the selected services changed
			
		}
		
		if (null == this.contextMenu) {
			
			this.contextMenu = Ext.create('Ext.menu.Menu', {
				closeAction : 'hide',
			    plain: true,
			    renderTo: Ext.getBody(),
			    items : [
					{
						text : 'Sélectionner tous les sous-services',
						iconCls : Yamma.Constants.getIconDefinition('group_mail').iconCls,
						handler : selectAllDescendants
					}
				]
			});
			
		} 
		
		return this.contextMenu;
		
	},

	onNewFilterSelected : function() {
		
		var
			selectedServiceNames = this.serviceFilterTree_.getSelectedServiceNames(),
			firstSelectedMailFilterRecord = this.serviceMailsFilterTree_.getSelectionModel().getSelection()[0] || null,
			contextFilters = firstSelectedMailFilterRecord ? firstSelectedMailFilterRecord.get('filters') : null,
			context = null
		;
		
		if (Ext.isEmpty(selectedServiceNames)) return;
		
		context = Ext.create('Yamma.utils.Context', {
			service : selectedServiceNames.join(','),
			kind : contextFilters ? contextFilters.type : undefined,
			state : contextFilters ? contextFilters.state : undefined
		});
		
		this.fireEvent('filterschanged', this, context);
		
	},
	
	clearFilterSelection : function(suppressEvents) {
		
		this.serviceFilterTree_.getSelectionModel().deselectAll(suppressEvents);
		this.serviceMailsFilterTree_.getSelectionModel().deselectAll(suppressEvents);
		
	}
	
});