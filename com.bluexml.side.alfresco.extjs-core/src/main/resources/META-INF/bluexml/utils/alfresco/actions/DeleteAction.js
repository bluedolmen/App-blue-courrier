Ext.define('Bluexml.utils.alfresco.actions.DeleteAction', {

	singleton : true,
	requires : [
		'Bluexml.Alfresco'
	],
	
	WS_URL : 'alfresco://api/node/workspace/SpacesStore/{nodeLocalId}', // + '/descendants'
	
	deleteConfirmed : function(config) {
		
		var me = this;
		var DELETE_BUTTON_TEXT = 'Effacer';
		var CANCEL_BUTTON_TEXT = 'Annuler';		
		
		var title = config.title || 'Suppression';
		var msg = config.msg || Ext.String.format('Vous êtes sur le point de supprimer le document{0}.', config.ref ? ' ' + config.ref : '');
		var nodeRef = config.nodeRef;
		if (!nodeRef) {
			throw new Error('IllegalArgumentException! The provided nodeRef is mandatory.');
		}
		var onSuccess = config.onSuccess;
		var isRecursive = config.recursive;
		
		var deleteDialog = Ext.create('Ext.window.MessageBox', {
			buttons : [
				{
					text : DELETE_BUTTON_TEXT,
					iconCls : 'icon-delete',
					handler : function() {
						
						me.deleteDocument(
							nodeRef,
							
							isRecursive,
						
							/* onDocumentDeleted */
							function() {
								if (onSuccess) onSuccess();
								deleteDialog.close();
							},
							
							/* onFailure */
							function(response) {
								deleteDialog.close();
	 							Ext.Msg.alert('Erreur durant la suppression!', response.responseText);
							}
						);
						
					}
				},
				
				{
					text : CANCEL_BUTTON_TEXT,
					handler : function() {
						deleteDialog.close();
					}
				}
			]
        }).show({
		    title : title,
			msg : msg,
			icon : Ext.Msg.QUESTION	        
        });		
		
		
	},
	
	deleteDocument : function(nodeRef, isRecursive, onDocumentDeleted, onFailure) {
		
		var nodeLocalId = Bluexml.Alfresco.getNodeId(nodeRef);
		
 		var url = Bluexml.Alfresco.resolveAlfrescoProtocol(
 			this.WS_URL.replace(/\{nodeLocalId\}/, nodeLocalId) + (isRecursive ? '/descendants' : '')
 		);
 		
 		Ext.Ajax.request({
 			url : url,
 			method : 'DELETE',
 			success : function(response) {
 				if (onDocumentDeleted) onDocumentDeleted();
 			},
 			failure : function(response) {
 				if (onFailure) onFailure(response);
 			}
 		});
 		
	}
	
	
});