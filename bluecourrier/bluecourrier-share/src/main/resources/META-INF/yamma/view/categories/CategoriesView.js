Ext.define('Yamma.view.categories.CategoriesView', {

	extend : 'Ext.tree.Panel',	
	alias : 'widget.categoriesview',
			
	requires : [
		'Yamma.store.categories.CategoriesTreeStore',
		'Ext.ux.tree.plugin.NodeDisabled'
	],
	
	uses : [
	    'Yamma.view.categories.CreateCategoryForm',
	    'Yamma.view.categories.UpdateCategoryForm'
	],
	
	title : false,
	iconCls : Yamma.Constants.getIconDefinition('tag_orange').iconCls,

	border : 1,
	rootVisible : false,
	preload : true,
	
	showDisabled : false,
	storeConfig : null,

	initialSelection : null,
	
	editable : false,
	
	viewConfig : {
		
		listeners : {
			
			highlightitem : function( view, node, eOpts ) {
				var me = this;
			}
			
		}
		
	},

	initComponent : function() {
		
		this.columns = this.getColumns();
		this.store = this.getTreeStore();
		
		if (true === this.showDisabled) {
			
			this.plugins = this.plugins || []; 
	    	this.plugins.push({
	    		ptype: 'dvp_nodedisabled',
	    		preventSelection : true
	        });
			
		}
		
		this.callParent();
		
	},
	
	hideHeaders : true,
	
	getColumns : function() {
		
		var
			me = this,
			columns = [{
				xtype: 'treecolumn', //this is so we know which column will show the tree
				text: 'Catégorie',
				flex: 2,
				sortable: true,
				dataIndex: 'text'
			}]
		;
		
		if (!this.editable) return columns;
		
		function can(record, operation) {
			
			if (!record) return false;
			var userAccess = record.get('userAccess');
			
			return userAccess && true == userAccess[operation];
			
		}
		
		function canCreate(record) {
			return can(record, 'create');
		}
		
		function canEdit(record) {
			return can(record, 'edit');
		}
		
		function canDelete(record) {
			return can(record, 'delete');
		}
		
		columns.push({
			
			text: 'Action',
			width : 30,
			xtype: 'alfrescoactioncolumn',
			
			items : [
				{
					icon: Yamma.Constants.getIconDefinition('add').icon,
					
					handler: function(grid, rowIndex, colIndex, actionItem, event, record, row) {

						me._createCategory(record);

					},
					
					getClass : function(value, meta, record) {
						
						return canCreate(record) ? '' : Ext.baseCSSPrefix + 'hide-display';

					}
					
				},
				{
					icon: Yamma.Constants.getIconDefinition('pencil').icon,
					
					handler: function(grid, rowIndex, colIndex, actionItem, event, record, row) {
						
						me._updateCategory(record);

					},
					
					getClass : function(value, meta, record) {
						
						return canEdit(record) ? '' : Ext.baseCSSPrefix + 'hide-display';

					}
				},
				{
					icon: Yamma.Constants.getIconDefinition('delete').icon,
					
					handler: function(grid, rowIndex, colIndex, actionItem, event, record, row) {
						
						me._deleteCategory(record);

					},
					
					getClass : function(value, meta, record) {
						
						return canDelete(record) ? '' : Ext.baseCSSPrefix + 'hide-display';

					}
					
				}
				
			]			
		
		});
		
		return columns;
		
	},
	
	_createCategory : function(record) {

		var
		
			me = this,
			
			nodeRef = record.get('id'),
			
			createCategoryForm = Ext.create('Yamma.view.categories.CreateCategoryForm', {
				categoryRef : nodeRef,
				title : false,
				onSuccess : function() {
					Ext.Function.defer(function() {me.getStore().load({ node : record.get('hasChildren') ? record : record.parentNode });});
					createCategoryWindow.close();
				}
			}),
			
			createCategoryWindow = Ext.create('Ext.window.Window', {
			
				title : 'Créer une nouvelle catégorie',
				renderTo : Ext.getBody(),
				layout : 'fit',
				
				items : [
					createCategoryForm
				]
			
			})
			
		;
		
		createCategoryWindow.show();
		
	},

	_updateCategory : function(record) {
		
		var
		
			me = this,
			
			nodeRef = record.get('id'),
			categoryName = record.get('name'),	
			
			updateCategoryForm = Ext.create('Yamma.view.categories.UpdateCategoryForm', {
				categoryRef : nodeRef,
				title : false,
				onSuccess : function() {
					Ext.Function.defer(function() {me.getStore().load({ node : record.parentNode });});
					updateCategoryWindow.close();
				}
			}),
			
			form = updateCategoryForm.getForm(),
			
			updateCategoryWindow = Ext.create('Ext.window.Window', {
			
				title : 'Mettre à jour une catégorie',
				renderTo : Ext.getBody(),
				layout : 'fit',
				
				items : [
					updateCategoryForm
				]
			
			})
			
		;
		
		form.setValues({
			name : categoryName
		});
		
		updateCategoryWindow.show();
		
	},
	
	_deleteCategory : function(record, skipConfirmation) {
		
		var 
			me = this,
			categoryRef = record.get('id')
		;
		
		if (!categoryRef) return;
		
		if (true === skipConfirmation) {
			deleteCategory();
			return;
		}
		
		Bluedolmen.windows.ConfirmDialog.INSTANCE.askConfirmation(
			'Supprimer la catégorie ?', /* title */
			'Etes-vous certain de vouloir supprimer la catégorie et ses descendants ?', /* message */
			deleteCategory /* onConfirmation */
		);
		
		function deleteCategory() {
			
			var
				url = Yamma.view.categories.CategoryForm.API_URL
					.replace(/\{categoryref\}/, categoryRef.replace(/\:\//, ''))
			;
			
			Bluedolmen.Alfresco.jsonRequest(
				{
					method : 'DELETE',
					url : Bluedolmen.Alfresco.resolveAlfrescoProtocol(url),
					onSuccess : function() {
						Ext.Function.defer(function() {me.getStore().load({ node : record.parentNode });});
					}
				}
			);
			
		}
		
	},
	
	getTreeStore : function() {
		
		var categoriesStore = Ext.create('Yamma.store.categories.CategoriesTreeStore', this.storeConfig || {});
		if (true === this.preload) {
			// pre-load the store (bug extjs 4.2.1 => the store won't be loaded without this)
			categoriesStore.load(); 			
		}
		
		return categoriesStore;
	},
	
	refreshView : function() {
		
		this.getStore().load();
		
	}
	
});