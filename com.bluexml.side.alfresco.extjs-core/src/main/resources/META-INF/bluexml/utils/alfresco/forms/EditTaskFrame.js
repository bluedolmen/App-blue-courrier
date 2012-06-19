Ext.define('Bluexml.view.forms.EditTaskFrame',{

	extend : 'Bluexml.utils.alfresco.forms.FormFrame',
	alias : 'widget.edittaskframe',
	
	statics : {
		WS_URL : '/share/page/standaloneedittask' + 
		'?taskId={taskId}' +
		'&redirect={redirect}'
	},
	
	config : {
		taskId : null
	},
	
	constructor : function(config) {
		config = config || {};
		this.initConfig(config);
		this.callParent([config]);
	},
	
	onDocumentLoaded : function(component, frameElement) {
		
		this.hideTaskDetails();
		this.callParent(arguments);
		
	},
	
	hideTaskDetails : function() {
		var contentDocument = this.getContentDocument();
		if (!contentDocument) return;
		
		var contentDocumentBody = Ext.get(contentDocument.body);
		if (!contentDocumentBody) return;
		
		var workflowTabs = contentDocumentBody.query('.yui-nav li');
		if (!workflowTabs || 0 == workflowTabs.length) return;
		
		Ext.Array.forEach(workflowTabs, function(workflowTab){
			workflowTab = Ext.get(workflowTab);
			
			var ems = workflowTab.query('em');
			if (!ems || 0 == ems.length) return;
			
			var em = ems[0];
			var content = em.innerHTML || em.innerText || em.textContent;
			if (!content || content.indexOf('Détails du workflow') == -1) return;
			
			workflowTab.hide();
			return false; // stop iteration
		});
		
	},
	
	getSourceUrl : function() {
		
		var taskId = this.getTaskId();
		if (!taskId) throw new Error('IllegalStateException! The taskId must be defined');
		
		var url = 
			Bluexml.view.forms.EditTaskFrame.WS_URL
				.replace(/\{taskId\}/, taskId);
				
		return url;
	},
	
	onContentDocumentSubmitButtonClicked : function(event, button, eOpts) {
		// override => DO NOTHING
	}
	
	
});