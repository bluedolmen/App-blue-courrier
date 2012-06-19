Ext.define('Bluexml.view.forms.CreateFormWindow', {
	
	extend : 'Bluexml.view.forms.LongTimeRunningFormWindow',
	requires : [
		'Bluexml.utils.alfresco.forms.CreateFormFrame'	
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