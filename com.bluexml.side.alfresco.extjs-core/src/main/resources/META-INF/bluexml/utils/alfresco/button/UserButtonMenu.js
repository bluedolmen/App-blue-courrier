Ext.define('Bluexml.utils.alfresco.button.UserButtonMenu', {

	extend : 'Ext.button.Button',
	alias : 'widget.userbuttonmenu',
	
	requires : [
		'Bluexml.model.PersonFactory',
		'Ext.Img'
	],
	
	text : Bluexml.Alfresco.getCurrentUserName(),
	iconCls : 'icon-user_suit',	
			
	initComponent : function() {
		this.customizeUserButtonLabel();
		this.menu = this.getMenuDefinition();
		this.callParent();
	},
	
	getMenuDefinition : function() {
		
		var items = this.getMenuItems();
		if (!items) return {};

		return {
			items : items
		};
	},
	
	getMenuItems : function() {
		
		var items = [];
		
		var profileMenu = this.getProfileMenuItemDeclaration();
		if (profileMenu) items.push(profileMenu);
		
		var additionalMenuItems = this.getAdditionalMenuItems();
		if (additionalMenuItems && Ext.isArray(additionalMenuItems)) {
			items = items.concat(additionalMenuItems);
		}
		
		var logoutMenu = this.getLogoutMenuItemDeclaration();
		if (logoutMenu) items.push(logoutMenu);
		
		return items;
	},
	
	getProfileMenuItemDeclaration : function() {
		
		return {
			id : 'profile',
			text : 'Profil',
			iconCls : 'icon-vcard',
			listeners : {
				click : this.onProfileMenuItemClicked
			}
		};
		
	},
	
	getLogoutMenuItemDeclaration : function() {
		return {
			id : 'logout',
			text : 'Déconnecter',
			iconCls : 'icon-door_out',
			href : 'dologout'
		};
	},
	
	getAdditionalMenuItems : function() {
		return [];
	},
	
	customizeUserButtonLabel : function() {
		
		var me = this;
		
		var username = Bluexml.Alfresco.getCurrentUserName();
		if (!username) return;
		
		Bluexml.model.PersonFactory.getPerson(username, onPersonAvailable);

		function onPersonAvailable(person) {
			
			var 
				firstName = person.get('firstName') || person.get('userName'),
				lastName = person.get('lastName') || '',
				displayName = firstName + (lastName ? ' ' + lastName : ''),
				btnIconEl = me.btnIconEl
			;			
			
			me.setText(displayName);
			
			if (!btnIconEl) return;
			
			me.setScale('large');
			Ext.create('Ext.Img', {
				src : person.getAvatarUrl(),
				renderTo : btnIconEl,
				width : '32px',
				height : '32px'
			});
			
		}

	},
	
    onProfileMenuItemClicked : function() {    	
		var userProfileWindow = Ext.create('Bluexml.view.windows.UserProfileWindow');
		userProfileWindow.show();
    }
	
	
});