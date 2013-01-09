// The one used by tree retrieval on Alfresco
Ext.define('Side.alfresco.NodeInterface', {
    extend: 'Ext.data.Model',
    idProperty : 'nodeRef',
    fields: [
		/* Fields from webservice */	    
    	{ name : 'nodeRef', type : 'string' },
    	{ name : 'name', type : 'string', mapping : 'name' },
    	{ name : 'description', type : 'description', mapping : 'description' },
    	{ name : 'hasChildren', type : 'boolean' },
    	
    	/* Current values for interface */
    	{ name : 'text', type : 'string', mapping : 'name' },
    	{ name : 'qtip', type : 'string' , mapping : 'description' },
    	{
    		name : 'leaf',
    		type : 'boolean',
    		convert: function(value, record) {
            	var hasChildren  = record.get('hasChildren');
                return ! hasChildren;
            }
    	}
    ]
});


Ext.define('Bluexml.utils.alfresco.Alfresco', {
	
	alternateClassName: ['Bluexml.Alfresco'],
	
	singleton : true,
	
	ALFRESCO_PROTOCOL : 'alfresco://',
	
	constructor : function() {

		function getProxyURL() {
			var message = 'The environment is not correctly configured since no Alfresco namespace is defined. ' +
				'This method is meant to be executed in a Share integration';
	
			if (undefined === Alfresco) {
				throw new Error(message);
			}
			
			var proxyURL = Alfresco.constants.PROXY_URI;
			if (null == proxyURL) {
				throw new Error(message);
			}
			
			var proxyURLLength = proxyURL.length;
	
			/*
			 * Add an extra '/' if not present
			 */
			return proxyURL + ('/' == proxyURL.charAt(proxyURLLength - 1) ? '' : '/');
			
		};
		
		var proxyURL = getProxyURL();
		
		this.getProxyURL = function() {
			return proxyURL;
		};
		
		return this;
	},
	
	resolveAlfrescoProtocol : function(url) {
		
		if (null == url) return null;

		if (url.indexOf(this.ALFRESCO_PROTOCOL) != 0) {
			return url;
		}
		
		// Remove alfresco://
		url = url.substring(this.ALFRESCO_PROTOCOL.length);
		
		if ('/' == url.charAt(0)) {
			// Remove starting '/'
			url = url.substring(1);
		}
		
		return this.getProxyURL() + url;
	},
	
	getAjax : function() {
		/*
		 * Maybe we could copy all the method in the current prototype
		 * in order to proxify all the methods. This would permit to
		 * define some kind of wrapper to process urls...
		 */
		return Alfresco.util.Ajax;
	},
	
	/**
	 * This method helps integrating the Alfresco Ajax requests Object
	 * (Alfresco.util.Ajax) by providing a generic error function which displays
	 * the error message in case something went wrong
	 */
	genericFailureManager : function(response) {
		
		var statusText = 'erreur inconnue';
		if (response.json) {
			statusText = response.json.message;
		} else if (response.serverResponse) {
			statusText = response.serverResponse.statusText;
		}
		
		Ext.MessageBox.show({
			title : "Échec de l'opération",
			msg : "Ne peut effectuer l'opération à cause de l\'erreur suivante :<br/>" + 
				'<i>' + statusText + '</i>',
			icon : Ext.MessageBox.ERROR,
			buttons : Ext.MessageBox.OK			
		});
			
	},
	
	genericSendMailFailureManager : function(jsonResponse) {
		if (!jsonResponse) return;
		
	    var status = jsonResponse.status;
	    if (!status) return;
	    
	    if ('sendMailFailure' != status) return;
	    
    	var message = jsonResponse.message;    	
    	var errorMessage =
			"Un incident s'est produit durant l'envoi des notifications par mail." +
			message
    			? (
    				"<br/>L'erreur retournée était la suivante : " +
    				"<i>" + message + "</i>"
    			)
    			: ''
    	;
    	
    	// Alert the user for failure during the sending of emails
    	Ext.MessageBox.show({
    		title : 'Problème durant la notification',
    		msg : errorMessage,
    		icon : Ext.MessageBox.WARNING,
    		buttons : Ext.MessageBox.OK
    	});
	},
	
	genericNoActionFailureManager : function(jsonResponse) {
		if (!jsonResponse) return;
		
	    var status = jsonResponse.status;
	    if (!status) return;
	    
	    if ('noaction' != status) return;
	    
    	var message = jsonResponse.message;    	
    	var errorMessage =
			message ? "<i>" + message + "</i>" : ''
    	;
    	
    	// Alert the user for failure during the sending of emails
    	Ext.MessageBox.show({
    		title : 'Aucune action réalisée',
    		msg : errorMessage,
    		icon : Ext.MessageBox.WARNING,
    		buttons : Ext.MessageBox.OK
    	});
		
	},
	
	
	// TODO: Stop using alfresco share wrapper and define an indepedent ws call
	// utility
	getAjaxCallConfig : function(config) {
		
		config = config || {};
				
		var 
			me = this,
			
			onSuccess = config.onSuccess || Ext.emptyFn,
			onFailure = config.onFailure || Ext.emptyFn,
			onSuccessScope = config.onSuccessScope || config.scope || this,
			onFailureScope = config.onFailureScope || config.scope || this,			
			
			defaultAjaxCallConfig = {
				
				url : null, // must be overridden
				
				failureCallback : {
					
					fn : function() {
						
						if (onFailure) {
							var failureExecResult = onFailure.apply(onFailureScope, arguments);
							if (false === failureExecResult) return;
						} 
						
						Bluexml.Alfresco.genericFailureManager.apply(this, arguments);
					}
					
				},
				
				successCallback : {
					
					fn : function(response) {
						var jsonResponse = response.json;
						if (!jsonResponse) {
							
							// Tries to interpret responseText as a json-response
							var 
								serverResponse = response.serverResponse,
								responseText = serverResponse ? serverResponse.responseText : null
							;
							
							if (responseText) {
								jsonResponse = Ext.JSON.decode(serverResponse.responseText, true);
								if (!jsonResponse) {
									Ext.log({
										msg : 'Cannot get a valid json-response from the server-response as text',
										level : 'warn'
									});
								}
							}
							
						}

						if (jsonResponse) {
							me.genericSendMailFailureManager(jsonResponse);
							me.genericNoActionFailureManager(jsonResponse);
						}
						
						if (onSuccess) onSuccess.call(onSuccessScope, jsonResponse || {});
					}
					
				}
			}
		
		;		
		
		delete config.onSuccess;
		delete config.onSuccessScope;
		delete config.onFailure;
		delete config.onFailureScope;
		
		var ajaxCallConfig = Ext.apply(defaultAjaxCallConfig, config);
		return ajaxCallConfig;
	},
	
	/**
	 * Provides a generic JsonPost (Ajax-call) method which relies upon
	 * Alfresco.util.Ajax.
	 * <p>
	 * The additional value of this method is to provide the integration of the
	 * generic failure manager if none is supplied
	 * 
	 * @param {Object}
	 *            config The overriding config of the Alfresco Ajax call
	 *            configuration
	 * @param {Function}
	 *            onSuccess callback function that should be called when the
	 *            call succeed (it is a shortcut when no advanced parameter is
	 *            necessary, e.g. scope of the handler)
	 */
	jsonPost : function(config, onSuccess, onFailure, scope) {
		
		config = config || {};
		config.method = 'POST';
		
		this.jsonRequest.apply(this, arguments);
	},
	
	/**
	 * This is a proxy to jsonRequest of Share alfresco.js utility library.
	 * 
	 * 
	 * @param {Object}
	 *            config
	 * @param {Function}
	 *            onSuccess
	 * @param {Function}
	 *            onFailure
	 */
	jsonRequest : function(config, onSuccess, onFailure, scope) {
		
		config.onSuccess = onSuccess || config.onSuccess;
		config.onFailure = onFailure || config.onFailure;
		
		var 
			ajaxCall = Bluexml.Alfresco.getAjax(),
			ajaxCallConfig = this.getAjaxCallConfig(config)
		;
			
		if (undefined === ajaxCallConfig.method) {
			ajaxCallConfig.method = 'GET';
		}
			
		ajaxCall.jsonRequest(ajaxCallConfig);
		
	},
	
	getCurrentUserName : function() {
		return Alfresco.constants.USERNAME;		
	},
	
	getCurrentUser : function(onPersonAvailable) {
		if (!onPersonAvailable || !Ext.isFunction(onPersonAvailable)) {
			throw new Error('This function has to be called with a callback function as parameter');
		}
		
		var currentUserName = this.getCurrentUserName();
		Bluexml.model.PersonFactory.getPerson(currentUserName, onPersonAvailable);
		
	},
	
	getCurrentUserHome : function(onUserHomeAvailable) {
		
		if (!onUserHomeAvailable || !Ext.isFunction(onUserHomeAvailable)) {
			throw new Error('IllegalArgumentException! The provided callback is not valid');
		}
		
		if (this.userHome) {
			onUserHomeAvailable(this.userHome);
			return;
		}
		
		var me = this;
		Bluexml.model.UserHome.load(null, {
			success : function(userHome) {
				me.userHome = userHome;
				onUserHomeAvailable(userHome);
			}
		});
		
	},
	
	NODEREF_REGEXP : /^(\w*):\/\/(\w*)\/([\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12})$/,
	
	isNodeRef : function(nodeRef) {
		
		if (!Ext.isString(nodeRef)) return false;
		return this.NODEREF_REGEXP.test(nodeRef);
		
	},
	
	getNodeId : function(nodeRef) {
		
		if (this.isNodeRef(nodeRef)) {
			var matching = nodeRef.match(this.NODEREF_REGEXP);
			return matching[3];
		}
		
		throw new Error('IllegalArgumentException! The provided nodeRef is not valid');
		
//		if (nodeRef && Ext.isString(nodeRef) && -1 != nodeRef.indexOf('://')) {
//			
//			var 
//				lastSlashIndex = nodeRef.lastIndexOf('/'),
//				nodeId = nodeRef.substr(lastSlashIndex + 1),
//				isValid = /[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}/.test(nodeId) 
//			;
//
//			if (isValid) return nodeId;
//		
//		}
		
	},
	
	
	/**
	 * Essentially a wrapper on {@link Ext.Ajax}.request
	 * <p>
	 * If the provided url starts with <code>alfresco://</code> then replace
	 * the protocol part by the Alfresco proxy address
	 * <p>
	 * if a <code>responseType</code> is present and if the value equals to
	 * <code>json</code>, then wrap the callback success function to directly
	 * return an Object corresponding to the returned JSON response
	 * 
	 * @deprecated DO USE Alfresco.util.Ajax Object instead
	 * @param {config}
	 *            The config as defined by {@link Ext.Ajax.request}
	 */
	callWebscript : function(config) {
		
		if (null == config) {
			throw 'The provided config is not valid (undefined)';
		}
		
		var webscriptURL = config.url;
		if (null == webscriptURL || '' == webscriptURL) {
			throw 'The provided URL is not valid (null, undefined or empty)';
		}		
		
		config.url = this.processAlfrescoProtocol(webscriptURL);
		
		/*
		 * This function replace config.success method with
		 * an encapsulation that extract the json string if
		 * the field config.responseType exists and is equals
		 * to 'json' 
		 */
		function processResponseType(config) {
			var responseType = config.responseType;
			if (undefined === responseType) return;
			config.responseType = undefined;
			if ('json' != responseType.toLowerCase()) return;
				
			var successCallback = config.success;
			if (undefined === successCallback) return;
			
 			config.success = function(response, options) {
 				
 				var responseType = response.responseType;
 				if ('json' != responseType) {
 					throw 'Unexpected result on getting site information';
 				}
 				
 				var responseText = response.responseText;
 				var responseObject = Ext.JSON.decode(responseText);
 				
 				successCallback(responseObject);
 			};
		}
		
		processResponseType(config);
		
		Ext.Ajax.request(config);		
	}
	
});

Ext.define('Bluexml.model.UserHome', {
	extend : 'Ext.data.Model',
	
	fields : [
		'userName',
		'userHomeQnamePath',
		'userHomeNodeRef'
	],
	
	proxy : {
		type : 'rest',
		url : Bluexml.Alfresco.getProxyURL() + 'britair/dinamex/userhome',
		reader : 'json'
	}	

});
