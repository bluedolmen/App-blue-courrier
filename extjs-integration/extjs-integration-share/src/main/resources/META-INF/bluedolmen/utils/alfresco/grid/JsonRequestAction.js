Ext.define('Bluedolmen.utils.alfresco.grid.JsonRequestAction', {
	
	actionUrl : null,
	method : 'GET',

	jsonRequest : function(dataObj, scope, handlerArgs) {
		
		dataObj = dataObj || this.getArguments();
		scope = scope || this;
		handlerArgs = handlerArgs || [];
		
		var 
			me = this,
			actionUrl = me.getActionUrl(dataObj), 
			url = Bluedolmen.Alfresco.resolveAlfrescoProtocol(actionUrl)
		;
		
		if (this.showBusy) {
			this.setBusy(true);
		}
		
		Bluedolmen.Alfresco.jsonRequest(
			{
				method : this.method,
				url : url,
				dataObj : dataObj,
				onSuccess : Ext.bind(me.onSuccess, scope, handlerArgs, true),
				onFailure : Ext.bind(me.onFailure, scope, handlerArgs, true)
			}
		);
		
	},	
	
	getActionUrl : function(dataObj) {
		return this.actionUrl;
	},
	
	getArguments : function() {
		return {};
	},
	
	onSuccess : function() {
		
		this.fireEvent('actionComplete', 'success', arguments);
		
		if (this.showBusy) {
			this.setBusy(false);
		}
		
	},
	
	onFailure : function() {
		
		this.fireEvent('actionComplete', 'failure', arguments);
		
		if (this.showBusy) {
			this.setBusy(false);
		}
		
	}
	
});