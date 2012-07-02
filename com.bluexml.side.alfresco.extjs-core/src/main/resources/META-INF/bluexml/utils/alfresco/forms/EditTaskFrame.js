Ext.define('Bluexml.view.forms.EditTaskFrame',{

	extend : 'Bluexml.utils.alfresco.forms.FormFrame',
	alias : 'widget.edittaskframe',
	
	sourceUrl : Alfresco.constants.URL_PAGECONTEXT + 'standaloneedittask',

	defaultFormConfig : {
		taskId : null
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
	
	onContentDocumentSubmitButtonClicked : function(event, button, eOpts) {
		// override => DO NOTHING
	}
	
	
});