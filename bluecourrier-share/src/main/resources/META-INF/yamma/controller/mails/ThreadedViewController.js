Ext.define('Yamma.controller.mails.ThreadedViewController', {
	
	extend : 'Yamma.controller.mails.MailContextAwareController',
	
	views : [
  		'mails.ThreadedView'
  	],    

	refs : [
	
	    {
			ref : 'mailsView',
	    	selector : 'mailsview'
	    },
	    
	    {
	    	ref : 'threadedView',
	    	selector : 'threadedview'
	    },
	    
	    {
	    	ref : 'displayView',
	    	selector : 'displayview'
	    }	    
	    
	],
	
	init: function() {
		
		this.control({
			
			'threadedview': {
				select : this.onSelect,
				itemclick : this.onItemClick,
				operation : this.onDowncomingOperation
			}
			
		});
		
		this.application.on({
			operation : this.onOperation,
			scope : this
		});		
		
		this.callParent(arguments);
		
	},
	
	onDowncomingOperation : function(operationKind, context) {
		
		this.application.fireEvent('operation', operationKind, context);
		
	},
	
	onOperation : function(operationKind, context) {

		var 
			threadedView = this.getThreadedView(),
			record = threadedView.findRecord('nodeRef' /* fieldName */, context /* value */)
		;
		
		if (record) {
			threadedView.refresh(false);
		}
		
	},
	
	/**
	 * Visually updates the selection to reflect the changed context
	 */
	onMailContextChanged : function(mailRecord) {
		
		if (null == mailRecord) return;
		
		var
			threadedView = this.getThreadedView(),
			selectionModel = threadedView.getSelectionModel();
		;
		
//		this.setTabbedViewVisible();
		selectionModel.select(mailRecord, false /* keepExisting */, true /* suppressEvent */);
		
	},
	
	setTabbedViewVisible : function() {
		
		var
			threadedView = this.getThreadedView(),
			ancestorTabPanel = threadedView.up('tabpanel')
		;
		if (!ancestorTabPanel) return;
		
		ancestorTabPanel.setActiveTab(threadedView);

	},
	
	/**
	 * This part manages the re-selection of a selected item.
	 * This is necessary since a selected item may not be opened
	 * in the display view.  
	 * 
	 */
	onItemClick : function(view, record, item, index, e) {
		
		var 
			selectionModel = view.getSelectionModel(),
			nodeRef = record.get("nodeRef"),
			isSelected = selectionModel.selected.findBy(function(item) {
				return nodeRef = item.get("nodeRef");
			}) != null;
		;
		
		if (!isSelected) return;
		
		this.application.fireEvent('mailcontextchanged', record);
		e.stopPropagation();
		
	},
	
	onSelect : function(view, record) {
		
		this.application.fireEvent('mailcontextchanged', record);
		
	}	

});