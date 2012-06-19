Ext.define('Bluexml.view.forms.SearchFormWindow', {
	
	extend : 'Bluexml.view.forms.FormWindow',
	requires : [
		'Bluexml.utils.alfresco.forms.SearchFormFrame'	
	],
	
	title : 'Rechercher',
	formxtype : 'searchformframe',
	
	onSearch : function(formData) {
		this.close();		
	}	
	

});