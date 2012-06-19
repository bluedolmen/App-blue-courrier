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
	headerPosition : 'left',
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