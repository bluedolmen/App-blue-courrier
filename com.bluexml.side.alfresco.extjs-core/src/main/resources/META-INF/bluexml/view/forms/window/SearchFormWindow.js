Ext.define('Bluexml.view.forms.window.SearchFormWindow', {
	
	extend : 'Bluexml.view.forms.window.FormWindow',
	
	requires : [
		'Bluexml.utils.alfresco.forms.SearchFormFrame'	
	],
	
	title : 'Rechercher',
	formxtype : 'searchformframe',
	
	onSearch : function(formData) {
		this.close();		
	}	
	

});