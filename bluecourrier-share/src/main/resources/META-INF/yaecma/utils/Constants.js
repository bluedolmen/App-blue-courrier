/**
 * The Constants (icons, models, ...) used by the YaECMA application
 */
Ext.define('Yaecma.utils.Constants', {

	alternateClassName : [
		'Yaecma.Definitions',
		'Yaecma.Constants'		
	],
	
	mixins : [
		'Bluedolmen.utils.IconDefinition'
	],
	
	singleton : true,
	
	constructor : function() {
		
		this.initResources();
		this.callParent(arguments);
		
	},
	
	/* SYSTEM RESOURCES */
	BASE_ICON_PATH : '/share/res/yaecma/resources/icons/',	
	
	initResources : function() {
		
		var me = this;
		
	}
	
	
	
	

	
});