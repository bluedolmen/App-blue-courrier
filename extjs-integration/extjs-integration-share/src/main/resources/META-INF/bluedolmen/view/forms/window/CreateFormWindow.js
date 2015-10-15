Ext.define('Bluedolmen.view.forms.window.CreateFormWindow', {
	
	extend : 'Bluedolmen.view.forms.window.LongTimeRunningFormWindow',
	requires : [
		'Bluedolmen.utils.alfresco.forms.CreateFormFrame'	
	],
	
	title : 'Créer',
	formxtype : 'createformframe',
	
	updateItemConfig : function(config) {

		if (undefined === config.destination && undefined !== this.destination) {
			config.destination = this.destination;
		}
		
		this.callParent(arguments);
	}	

});