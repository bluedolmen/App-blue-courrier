Ext.define('Yamma.admin.modules.services.SitesAdminUtils', {

	singleton : true,
	
	SET_AS_SERVICE_URL : 'alfresco://bluedolmen/yamma/services/{serviceName}',
	
	/**
	 * 
	 * @param {String} siteName
	 * @param {Object} serviceDefinition
	 * @param {String} serviceDefinition.parentServiceName
	 * @param {Boolean} serviceDefinition.serviceCanSign
	 * @param {Object} config
	 * @param {Function} config.onSuccess
	 * @param {Ext.LoadMask} config.loadingMask
	 */
	setAsService : function(siteName, serviceDefinition, config) {
		
		if (null == siteName) {
			Ext.Error.raise(i18n.t('admin.modules.services.siteadminutils.error.sitename'));
		}
		
		serviceDefinition = serviceDefinition || {};
		config = config || {};
		
		var
			onSuccess = config.onSuccess,
			url = Bluedolmen.Alfresco.resolveAlfrescoProtocol(this.SET_AS_SERVICE_URL)
				.replace(/\{serviceName\}/,siteName),
			loadMaskTarget = config.loadMaskTarget,
			loadingMask = config.loadingMask || (loadMaskTarget ? new Ext.LoadMask(loadMaskTarget, {msg:i18n.t('admin.modules.services.siteadminutils.message.add.inprogress')}) : null)
		;
		
		if (loadingMask) loadingMask.show();
		Bluedolmen.Alfresco.jsonPost(
			{
				url : url,
				
				dataObj : {
					parentName : serviceDefinition.parentServiceName || undefined,
					canSign : serviceDefinition.serviceCanSign
				},
				
				onSuccess : function(response, options) {
					if (loadingMask) loadingMask.hide();
					if (null != onSuccess) {
						onSuccess();
					}
				},
				
				onFailure : function(response, options) {
					if (loadingMask) loadingMask.hide();
					Bluedolmen.Alfresco.genericFailureManager(response);
				}
			}
		);
		
	},
	
	unsetAsService : function(siteName, config) {
		
		if (null == siteName) {
			Ext.Error.raise(i18n.t('admin.modules.services.siteadminutils.error.sitename'));
		}
		
		config = config || {};
		
		var
			onSuccess = config.onSuccess,
			url = Bluedolmen.Alfresco.resolveAlfrescoProtocol(this.SET_AS_SERVICE_URL)
				.replace(/\{serviceName\}/, siteName),
			loadMaskTarget = config.loadMaskTarget,
			loadingMask = config.loadingMask || (loadMaskTarget ? new Ext.LoadMask(loadMaskTarget, {msg:"Suppression du service '" + siteNaem + "' en cours..."}) : null)
		;
		
		if (loadingMask) loadingMask.show();
		
 		Ext.Ajax.request({
 			url : url,
 			method : 'DELETE',
 			success : function(response) {
				if (loadingMask) loadingMask.hide();
				if (null != onSuccess) {
					onSuccess();
				} 				
 			},
 			failure : function(response) {
				if (loadingMask) loadingMask.hide();
				Bluedolmen.Alfresco.genericFailureManager(response);			
 			}
 		});		
		
	}
	
	
});