Ext.define('Bluexml.view.windows.UserProfileWindow', {
	
	extend : 'Ext.window.Window',
	alias : 'widget.userprofile',
	
	requires : [
		'Bluexml.view.windows.UserProfileForm'
	],
	
	iconCls : 'icon-user_suit',	
	title : 'Profil utilisateur',
	width : 450,
	height : 300,
	layout : 'fit',
	headerPosition : Yamma.utils.Preferences.getPV(Yamma.utils.Preferences.PREFERED_HEADER_POSITION),
	renderTo : Ext.getBody(),
	border : false,
	
	items : [
		{
			xtype : 'userprofileform',
			title : '',
			border : false
		}
	]

});