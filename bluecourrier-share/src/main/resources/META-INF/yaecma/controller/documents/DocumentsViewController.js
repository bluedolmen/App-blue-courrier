Ext.define('Yaecma.controller.documents.DocumentsViewController', {
	
	extend : 'Ext.app.Controller',
	
	requires : [
		'Yaecma.view.display.DisplayView'
	],
	
	refs : [
		{
			ref : 'documentsView',
			selector : 'documentsview'
		},
		{
			ref : 'navigator',
			selector : 'navigator'
		}
	],
	
	init: function() {
		
		this.control({
			
			'documentsview': {
				fileselected : this.onFileSelected
			},
			
			'navigator' : {
				selectfolder : this.onSelectFolder
			}			

		});
	
		this.application.on({
	        searchPerformed : this.onSearchPerformed,
	        scope: this
	    });		
		
		this.callParent();
	},
	
	onSelectFolder : function(nodeRef, nodeRecord) {
		
		var documentsView = this.getDocumentsView();
		documentsView.displayContainerChildren(nodeRef);
		
	},
	
	onSearchPerformed : function(searchContext) {
		
		var 
			documentsView = this.getDocumentsView(),
			filters = searchContext.filters
		;
		
		if (!filters) return;
		
		documentsView.filter({
			filters : filters
		});
		
	},		
	
	onFileSelected : function(nodeRef, record) {

		var
			me = this,
			title = record.get('name'),
			mimeType = record.get('mimetype')
		;
		
		Ext.create('Bluedolmen.windows.PreviewWindow', {
			
			title : title,
			nodeRef : nodeRef,
			mimeType : mimeType,
			
			tools:[
				{
					type:'pin',
					tooltip: 'Garder sous le coude',
					handler: function(event, toolEl, header){
						var 
							previewWindow = header.ownerCt;
							previewFrame = previewWindow.query('previewframe')[0]
						;
						
						me.application.fireEvent('keepMe', nodeRef, record, previewFrame);
						Ext.defer(function() {previewWindow.close();}, 50);
				    }
				},
				{
					type:'restore',
					tooltip: 'Ouvrir dans une autre fenêtre',
					handler: function(event, toolEl, header){
						var 
							previewWindow = header.ownerCt;
							previewFrame = previewWindow.query('previewframe')[0],
							url = previewFrame ? previewFrame.src : null
						;
						if (!url) return;
						
						window.open(url);
						Ext.defer(function() {previewWindow.close();}, 50);
				    }
				}
			]
			
		}).maximize().show();
				
	}
	
});