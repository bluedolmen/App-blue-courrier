Ext.define('Yamma.view.edit.EditDocumentForm', {
	
	extend : 'Ext.panel.Panel',
	alias : 'widget.editdocumentform',
	
	mixins : {
		deferredloading : 'Yamma.view.edit.DeferredLoading'
	},
	
	uses : [
		'Bluedolmen.view.forms.panel.EditFormPanel'
	],
	
	title : 'Métadonnées',
	iconCls : 'icon-page_white_edit',
	
	layout : 'card',
	
	/**
	 * @private
	 * @type String
	 */
	editedDocumentNodeRef : null,
	
	loadInternal : function() {
		
		this.loadDocument.apply(this, arguments);
		
	},
	
	loadDocument : function(nodeRef, formId, forceLoad, permissions) {
		
		var 
			me = this,
			nodeId = Bluedolmen.Alfresco.getNodeId(nodeRef),
			form = this.getExistingForm(nodeRef),
			hasWritePermission = false
		;
		
		if (null != form) { // Form already loaded
			
			this.getLayout().setActiveItem(form);
			if (true !== forceLoad) return;
			
		}
		else {
			
			form = Ext.create('Bluedolmen.view.forms.panel.EditFormPanel', {
				itemId : nodeId,
				header : false,
				
				
				onSuccess : function() {
					
					var eventArgs = ['successfulEdit', form, nodeRef];
					me.fireEvent.apply(me, eventArgs);
					
				}
			
			});
			
			this.add(form);
			this.getLayout().setActiveItem(form);
			
		}
		
		hasWritePermission = true === (permissions || {})['Write'];
		
		form.loadNode(
			nodeRef,
			{
				formConfig : {
					showCancelButton : false,
					formId : formId,
				} ,
				title : hasWritePermission ? 'Éditer' : 'Visualiser',
				formxtype : hasWritePermission ? 'editformframe' : 'viewformframe'
			} /* extra-config */
		);		
		
	},
	
	getExistingForm : function(nodeRef) {
		
		var nodeId = Bluedolmen.Alfresco.getNodeId(nodeRef);
		return this.queryById(nodeId) || null;
		
	},
	
	clear : function() {
		
		this.removeAll();
		
	}

	
});