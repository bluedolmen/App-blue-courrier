Ext.define('Bluedolmen.utils.alfresco.button.UserButtonMenu', {

	extend : 'Ext.button.Button',
	alias : 'widget.userbuttonmenu',
	
	requires : [
		'Bluedolmen.model.PersonFactory',
		'Ext.Img'
	],
	
	text : Bluedolmen.Alfresco.getCurrentUserName(),
	icon : Bluedolmen.Constants.getIconDefinition('user_suit').icon, // do not use iconCls since background style is set with '!important' and cannot be invalidated	
	
	buttonImage : null,
			
	initComponent : function() {
		
		this.customizeUserButtonLabel();
		this.menu = {};
		this.callParent();
		
		this.loginUrl = window.location;
		
	},
	
	listeners : {
		
		render : function(button) {
			button.renderMenuItems();
		}
		
	},
	
	/**
	 * @private
	 */
	renderMenuItems : function() {
		
		var me = this;
		
		Bluedolmen.Alfresco.getCurrentUser(
		
			function onUserAvailable(currentUser) {
				
				var items = me.getMenuItems(currentUser);
				if (!items) return {};
				
				me.menu.add(items);
				
			}
		);

	},
	
	getMenuItems : function(currentUser) {
		
		return Ext.clean(
			[
				this.getProfileMenuItemDeclaration()
			].concat(
				this.getAdditionalMenuItems(currentUser) || []
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
		
	
		/*
		 * To logout and redirect to the yamma page, we
		 * need to use a particular method using a
		 * redirect based on the LogoutController from
		 * Spring Surf. The one used in 4.0.x is visibly
		 * buggy and MUST be called with two extra
		 * parameters (QueryKey and QueryValue) which
		 * adds extra parameters to the redirect-URL.
		 * Without this, a NullPointerException is
		 * generated. That's why we add an extra parameter
		 * (lastUser) that is not functionally useful. 
		 */
		
		return {
			id : 'logout',
			text : 'Déconnecter',
			iconCls : 'icon-door_out',
			href : 'dologout?redirectURL={redirectURL}&redirectURLQueryKey={queryKey}&redirectURLQueryValue={queryValue}'
				.replace(/\{redirectURL\}/, '/share/page/yamma')
				.replace(/\{queryKey\}/, 'lastUser')
				.replace(/\{queryValue\}/, Bluedolmen.Alfresco.getCurrentUserName())
		};
		
	},
	
	checkTicket : function() {
		
		var
			me = this,
			url = Bluedolmen.Alfresco.resolveAlfrescoProtocol('alfresco://com/bluexml/side/facetMap/ticket_user')
		;
		
    	Ext.Ajax.request({
    		
    	    url: url,
    	    
    	    success: function(response){
    	    	// do nothing
    	    },
    	    
    	    failure : function(response) {
    	    	// disconnected	if 401
    	    	
//    			Ext.create('Ext.Img', {
//    				src : person.getAvatarUrl(),
//    				renderTo : me.btnIconEl,
//    				height : '32px'
//    			});
    			
    	    }
    	});
		
	},
	
	getAdditionalMenuItems : function(currentUser) {
		return [];
	},
	
	customizeUserButtonLabel : function() {
		
		var me = this;
		
		var username = Bluedolmen.Alfresco.getCurrentUserName();
		if (!username) return;
		
		Bluedolmen.model.PersonFactory.getPerson(username, onPersonAvailable);

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
			me.buttonImage = Ext.create('Ext.Img', {
				src : person.getAvatarUrl(),
				renderTo : btnIconEl,
				height : '32px'
			});
			btnIconEl.setStyle('background-image','none');
			
		}

	},
	
    onProfileMenuItemClicked : function() {    	
		var userProfileWindow = Ext.create('Bluedolmen.view.windows.UserProfileWindow');
		userProfileWindow.show();
    }    
	
});