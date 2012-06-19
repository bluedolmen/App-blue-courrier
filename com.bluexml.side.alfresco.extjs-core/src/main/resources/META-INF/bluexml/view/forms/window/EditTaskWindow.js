Ext.define('Bluexml.view.forms.EditTaskWindow', {
	
	extend : 'Bluexml.view.forms.LongTimeRunningFormWindow',
	requires : [
		'Bluexml.view.forms.EditTaskFrame'	
	],
	
	title : 'Gérer la tâche',
	formxtype : 'edittaskframe'	

});