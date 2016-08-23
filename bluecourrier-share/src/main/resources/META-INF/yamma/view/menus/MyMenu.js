Ext.define('Yamma.view.menus.MyMenu', {

	extend : 'Ext.tree.Panel',
	alias : 'widget.mymenu',
	
	requires : [
		'Yamma.view.mails.gridactions.*'
	],
	
	id : 'my-menu',
	
	title : i18n.t('view.menu.mymenu.title'),
	iconCls : 'icon-house',
	
	rootVisible : false,

	initComponent : function() {
		this.root = this.getRootDefinition();
		this.callParent();
	},
	
	getRootDefinition : function() {
	
		return {
			text : '',
			expanded : true,
			children : [
			
//				{
//					text : 'Mes documents',
//					expanded : true,
//					iconCls : 'icon-page_white_user',
//					
//					children : getMyDocumentsActions()					
//				}
				
				
//				{
//					text : 'Mes actions',
//					expanded : true,
//					iconCls : 'icon-cog_user',
//					id : 'myActions!' + getAvailableActions().join(','),
//					
//					children : getMyActions()
//					
//				}

				{
					text : 'Mes tâches',
					expanded : true,
					iconCls : Yamma.Constants.getIconDefinition('cog_user').iconCls,
					id : 'myTasks'
				}

			]
		};
		
		
		function getMyDocumentsActions() {
			
			myDocumentsActions = [];
			
			myDocumentsActions.push(
				{
					text : 'Assignés',
					iconCls : 'icon-user',
					id : 'myDocuments!state!delivering',
					leaf : true
				}
			);
			
			Ext.Array.forEach(
				[
					'processing',
//					'revising',
					'validating!processed',
//					'signing',
					'sending',
					'processed'
				],
				function(stateName) {
					
					var stateDefinition = Yamma.Constants.DOCUMENT_STATE_DEFINITIONS[stateName];
					if (!stateDefinition) return;					
					
					myDocumentsActions.push({
						text : stateDefinition.title,
						iconCls : stateDefinition.iconCls,
						id : 'myDocuments!state!' + stateName,
						leaf : true
					});
					
				}
			);
			
			myDocumentsActions.push(						
				{
					text : 'En retard',
					iconCls : 'icon-exclamation',
					id : 'myDocuments!late!true',
					leaf : true
				}
			);
			
			return myDocumentsActions;
			
		}
		
		function getAvailableActions() {
			return [
				'Distribute',
				'StartProcessing',
				'SendOutbound',
				'ForwardReply',
				'MarkAsSigned',
				'MarkAsSent',
				'Archive'
			];
		}
		
		
		function getMyActions() {
			
			return Ext.Array.clean(Ext.Array.map(
				getAvailableActions(),
				
				function(actionClassName) {
					var actionClass = Yamma.view.mails.gridactions[actionClassName];
					if (!actionClass) return; // continue ignoring mapping
					
					var 
						matcher = /Action_can(.*)/.exec(actionClass.FIELD) || [],
						id = matcher[1]
					;
					
					if (!id) return;
					
					return {
						text : actionClass.LABEL,
						iconCls : actionClass.ICON.iconCls,
						id : 'myActions!' + id,
						leaf : true
					};
					
				}
			));
			
		}
				
		
	}
	
	
});