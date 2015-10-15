Ext.define('Yaecma.model.children.Node', {

	extend : 'Ext.data.Model',
	
	fields : [
		{ nmae : 'nodeRef', type : 'string' },
		{ name : 'isLink', type : 'boolean' },
		{ name : 'type', type : 'string' },
		{ name : 'isContainer', type : 'boolean' },
		{ name : 'isLocked', type : 'boolean'},
		{ name : 'aspects', type : 'auto' },
		{ name : 'properties', type : 'auto' }
	],
	
	associations : [
		{ type : 'hasOne', model : 'Yaecma.model.children.Permissions', name : 'permissions' }
	]
	
});
