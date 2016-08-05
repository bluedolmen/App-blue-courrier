Ext.define('Yamma.controller.mails.MailFiltersViewController', {
	
	extend : 'Ext.app.Controller',
	
	views : [
  		'mails.MailFiltersView'
  	],    

	refs : [
	
	    {
	    	ref : 'mailFiltersView',
	    	selector : '#mailfiltersview'
	    }
	    
	],
	
	init: function() {
		
		this.control({
			
			'mailfiltersview' : {
				'filterschanged' : this.onMailFiltersChanged
			}
			
		});
		
	},
	
	onMailFiltersChanged : function(view, context) {
		this.application.fireEvent('contextChanged', context);
	}
	

});