Ext.define('Yamma.store.services.ServicesTreeStore.ServiceTrays', {
	
	extend : 'Yamma.store.services.ServicesTreeStore',
	
	showMembership : true,
	
	getFieldsDefinition : function() {
		
		return [
			'membership',
			{
				name : 'isMember',
				type : 'boolean',
				convert : function(value, record) {
					var membership = record.get('membership');
					if (!membership) return false;
					
					for (var role in membership) {
						if (true === membership[role]) return true;
					}
					
					return false;
				}
			},
			{ name : 'id', type : 'string', mapping : 'name'},
			{ name : 'kind', type : 'string', defaultValue : 'st:site' },
			{ name : 'name', type : 'string' }, 
	    	{ 
				name : 'text', 
				type : 'string' , 
				mapping : 'title'
			},
	    	{
	    		name : 'leaf',
	    		type : 'boolean',
	    		convert: function(value, record) {
	    			var hasChildren = record.get('hasChildren');
	    			if (undefined !== hasChildren) return !hasChildren;
	    			
	    			return value;
	    		}
	    	},
	    	{
	    		name : 'iconCls',
	    		type : 'string',
	    		defaultValue : Yamma.Constants.getIconDefinition('group').iconCls
	    	},
	    	{
	    		name : 'expanded',
	    		type : 'boolean',
	    		convert : function(value, record) {
	    			//var kind = record.get('kind');
	    			
	    			return true;
	    		}
	    	},
	    	{
	    		name : 'disabled',
	    		type : 'boolean',
	    		defaultValue : false
	    	}
	    ];
	    
	},	
	
	listeners : {
		
		'beforeappend' : function(store, node) {
			
			if ('root' == node.get('id')) return;
			
			var 
				serviceName = node.get('name'),
				isMember = node.get('isMember')
			;
			
			if (!isMember) {
				node.set('disabled', true);
				return;
			}
			
			addStateTray('pending');
			addCopyTray();
			addStateTrays();
			
			function addStateTrays() {
				
				Ext.Array.forEach(
					[
						'delivering',
						'processing',
						'revising',
						'validating!processed',
						'signing',
						'sending',
						'processed'
					],
					
					addStateTray
					
				);
				
			}
						
			function addStateTray(stateName) {
				
				var stateDefinition = Yamma.Constants.DOCUMENT_STATE_DEFINITIONS[stateName];
				if (!stateDefinition) return;					
				
				var newNode = {
					text : stateDefinition.shortTitle,
					iconCls : stateDefinition.iconCls,
					id : serviceName + '|' + stateName,
					kind : 'state-tray',
					leaf : true
				};
				
				node.appendChild(newNode);
				
			}
			
			function addCopyTray() {
				
				var newNode = {
					text : 'Copies',
					iconCls : Yamma.Constants.getIconDefinition('page_white_stack').iconCls,
					id : serviceName + '|' + 'ccbox',
					kind : 'tray',
					leaf : true
				};
				
				node.appendChild(newNode);
				
			}
			
		}
	}
	
});

Ext.define('Yamma.view.menus.SiteTraysMenu', {

	extend : 'Ext.tree.Panel',
	alias : 'widget.sitetraysmenu',
	
	requires : [
		'Yamma.store.menus.SiteTraysTreeStore',
		'Ext.ux.tree.plugin.NodeDisabled'
	],
	
	plugins: [{
        ptype: 'dvp_nodedisabled'
    }],	
			
	id : 'sitetrays-menu',
	
	title : 'Bannettes',
	iconCls : 'icon-folder_page_white',

	border : 1,
	rootVisible : false,
	
	initComponent : function() {
		this.store = this.getTreeStore();
		this.callParent();
	},
	
	getTreeStore : function() {
		var treeStore = Ext.create('Yamma.store.services.ServicesTreeStore.ServiceTrays');
		return treeStore;
		
	}
	
});