Ext.define('Yaecma.model.children.Item', {

	extend : 'Ext.data.Model',
	
	fields : [
		{ name : 'version', type : 'string' },
		{ name : 'webdavUrl', type : 'string' },
		{ name : 'isFavourite', type : 'boolean' }
	],
	
	associations : [
		{ type : 'hasOne', model : 'Yaecma.model.children.Node', name : 'node'}
	]
	
});