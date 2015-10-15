Ext.define('Bluedolmen.view.forms.window.SearchFormWindow', {
	
	extend : 'Bluedolmen.view.forms.window.FormWindow',
	
	requires : [
		'Bluedolmen.utils.alfresco.forms.SearchFormFrame'	
	],
	
	title : 'Rechercher',
	formxtype : 'searchformframe',
	
	onSearch : function(formData) {
		this.close();		
	}	
	

});