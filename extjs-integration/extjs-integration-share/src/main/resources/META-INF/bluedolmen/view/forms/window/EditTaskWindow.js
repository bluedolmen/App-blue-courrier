Ext.define('Bluedolmen.view.forms.window.EditTaskWindow', {
	
	extend : 'Bluedolmen.view.forms.window.LongTimeRunningFormWindow',
	requires : [
		'Bluedolmen.utils.alfresco.forms.EditTaskFrame'	
	],
	
	title : 'Gérer la tâche',
	formxtype : 'edittaskframe'	

});