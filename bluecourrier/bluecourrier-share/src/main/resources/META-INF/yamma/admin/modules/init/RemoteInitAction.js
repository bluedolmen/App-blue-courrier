Ext.define('Yamma.admin.modules.init.RemoteInitAction', {
	
	extend : 'Yamma.admin.modules.init.InitAction',
	
	statics : {
		INIT_STATUS_URL : 'alfresco://bluedolmen/init/{initId}',
		INIT_ACTION_URL : 'alfresco://bluedolmen/init/{initId}/action'
	},
	
    id : null, // to be overridden
    iconCls : Yamma.utils.Constants.getIconDefinition('gear').iconCls,
    
    constructor : function() {
    	
    	if (!this.id) {
    		Ext.Error.raise('The id property has to be defined to a unique string');
    	}
    	
    	this.callParent();
    	
    },
    
    install : function(onNewStateAvailable) {
    	this._actionCall('init', onNewStateAvailable);
    },

    uninstall : function(onNewStateAvailable) {
    	this._actionCall('clear', onNewStateAvailable);
    },
    
    _actionCall : function(actionId, onNewStateAvailable) {
    	
    	var
			me = this,
			url = Bluedolmen.Alfresco.resolveAlfrescoProtocol(
				Yamma.admin.modules.init.RemoteInitAction.INIT_ACTION_URL
					.replace(/\{initId\}/, this.id)
	    	),
	    	values = {
				action : actionId    	
    		}
	    ;
    	
    	Bluedolmen.Alfresco.jsonPost({
    		
		    url: url,
		    dataObj : values,
		    
		    onSuccess : function(jsonResponse) {
		    	
			    if (!jsonResponse) {
			    	setUndeterminedStatus();
			    	return;
			    }
			   
			    var 
			    	state = jsonResponse['state'],
			    	mappedState = me.mapStates(state)
			   	;
			    me.setNewState(onNewStateAvailable, mappedState);
		    	
		    },
		    
		    onFailure : function(jsonReponse) {
		    	setUndeterminedStatus();
		    }
		    
    	});
	
    	function setUndeterminedStatus() {
    		me.setNewState(onNewStateAvailable, Yamma.admin.modules.init.InitAction.INSTALLATION_STATES.UNDETERMINED);
    	}
    	
    },
    
    getState : function(onStateAvailable) {
    	
    	var
    		me = this,
    		url = Bluedolmen.Alfresco.resolveAlfrescoProtocol(
				Yamma.admin.modules.init.RemoteInitAction.INIT_STATUS_URL
					.replace(/\{initId\}/, this.id)
	    	)
	    ;
    	
    	Ext.Ajax.request({
    		
			url: url,
			
			method : 'GET',
			
			success: function(response){
				
			    var 
			    	text = response.responseText || '{}',
			    	jsonResponse = Ext.JSON.decode(text, true /* safe */)
			    ;
			    
			    if (!jsonResponse) {
			    	setUndeterminedStatus();
			    	return;
			    }
			   
			    var status = jsonResponse[me.id];
			    if (!status) {
			    	setUndeterminedStatus();
			    	return;
			    }
			    
			    // TODO: May check here the available actions to set uninstall function 
			    // to null in order to deactivate the availability
			    
			    var state = me.mapStates(status.state);
			    me.setNewState(onStateAvailable, state);
			    
			},
			
		    failure: function(response, options) {
		    	
		    	Bluedolmen.Alfresco.genericFailureManager(response);
		    	setUndeterminedStatus();
		    	
		    }			
			
		});
    	
    	function setUndeterminedStatus() {
    		me.setNewState(onStateAvailable, Yamma.admin.modules.init.InitAction.INSTALLATION_STATES.UNDETERMINED);
    	}
    	
    },
    
    setNewState : function(callback, state) {
    	
		if (!Ext.isFunction(callback)) return;
		callback.call(this, state);
		
    },
    
    mapStates : function(remoteState) {
    	
    	if (null == remoteState)
    		return Yamma.admin.modules.init.InitAction.INSTALLATION_STATES.UNDETERMINED;
    	
    	switch(remoteState) {
    	
    	case 'no':
    		return Yamma.admin.modules.init.InitAction.INSTALLATION_STATES.NO;
    		
    	case 'full':
    		return Yamma.admin.modules.init.InitAction.INSTALLATION_STATES.FULL;
    		
    	case 'partially':
    		return Yamma.admin.modules.init.InitAction.INSTALLATION_STATES.PARTIALLY;
    		
    	case 'modified':
    		return Yamma.admin.modules.init.InitAction.INSTALLATION_STATES.PARTIALLY;
    		break;
    		
    	case 'unknown':
    		break;
    	
    	}
    	
    	return Yamma.admin.modules.init.InitAction.INSTALLATION_STATES.UNDETERMINED;
    	
    }
    
    
});