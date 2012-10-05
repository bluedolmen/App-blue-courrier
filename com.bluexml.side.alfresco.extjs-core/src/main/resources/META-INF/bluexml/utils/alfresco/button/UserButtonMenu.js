Ext.define('Bluexml.utils.alfresco.button.UserButtonMenu', {

	extend : 'Ext.button.Button',
	alias : 'widget.userbuttonmenu',
	
	statics : {
		STATISTICS_URL : 'http://www.bluexml.com/bluecourrier/stats'
	},
	
	requires : [
		'Bluexml.model.PersonFactory',
		'Ext.Img'
	],
	
	text : Bluexml.Alfresco.getCurrentUserName(),
	icon : Yamma.Constants.getIconDefinition('user_suit').icon, // do not use iconCls since background style is set with '!important' and cannot be invalidated	
			
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
		
		return Ext.clean(
			[
				this.getProfileMenuItemDeclaration()
			].concat(
				this.getAdditionalMenuItems() || []
			).concat([
				this.getLogoutMenuItemDeclaration()
			])
		);
		
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
			btnIconEl.setStyle('background-image','none');
			
		}

	},
	
    onProfileMenuItemClicked : function() {    	
		var userProfileWindow = Ext.create('Bluexml.view.windows.UserProfileWindow');
		userProfileWindow.show();
    },
    
    onStatisticsMenuItemClicked : function() {
    	window.open(Bluexml.utils.alfresco.button.UserButtonMenu.STATISTICS_URL);
    }
	
	
});