Ext.define('Bluexml.view.forms.window.EditTaskWindow', {
	
	extend : 'Bluexml.view.forms.window.LongTimeRunningFormWindow',
	requires : [
		'Bluexml.view.forms.EditTaskFrame'	
	],
	
	title : 'Gérer la tâche',
	formxtype : 'edittaskframe'	

});