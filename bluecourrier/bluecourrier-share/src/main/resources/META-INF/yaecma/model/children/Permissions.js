Ext.define('Yaecma.model.children.Permissions', {

	extend : 'Ext.data.Model',
	
	fields : [
		{ name : 'roles', type : 'auto' },
		{ name : 'inherited', type : 'boolean' },
		{ name : 'user', type : 'auto' }
	]
	
});
