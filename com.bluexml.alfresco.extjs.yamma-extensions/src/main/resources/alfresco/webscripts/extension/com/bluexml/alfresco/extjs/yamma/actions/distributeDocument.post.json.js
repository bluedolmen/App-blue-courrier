///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/actions/common.lib.js">
///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/actions/parseargs.lib.js">
///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/alfresco/extjs/yamma/actions/nodeaction.lib.js">

(function() {
	
	Yamma.Actions.DistributeAction = Utils.Object.create(Yamma.Actions.DocumentNodeAction, {
		
		eventType : 'distribution',
		documentContainer : null,
		
		isExecutable : function(node) {
			
			return ActionUtils.canDistribute(node, this.fullyAuthenticatedUserName);
			
		},
		
		doExecute : function(node) {
			
			var assignedServiceTray = this.moveDocumentToTray();
			if (null == assignedServiceTray) return;
				
			var copiedDocuments = this.copyDocumentToCCTrays();			
		},
		
		prepare : function() {
			
		},
		
		/**
		 * Move the document in the selected service tray
		 * @returns the tray-node in which the document was moved
		 */
		moveDocumentToTray : function() {
			
			var 
				documentContainer = DocumentUtils.getDocumentContainer(this.node),
				assignedServiceName = DocumentUtils.getAssignedServiceName(this.node),
				currentTray = TraysUtils.getEnclosingTray(this.node),
				currentTrayName = null != currentTray ? currentTray.name : TraysUtils.INBOX_TRAY_NAME,
				assignedServiceTray = TraysUtils.getSiteTray(assignedServiceName, currentTrayName ),
				document = documentContainer
			;
			
			if (null == assignedServiceTray) return;
			if (null == documentContainer) {
				logger.warn('Cannot find the container of document ' + document.nodeRef + '. Using the actual document instead.');
				document = this.node;
			}
			
			if (!document.move(assignedServiceTray)) {
				throw {
					code : '512',
					message : 'IllegalStateException! Cannot move the document ' + document.name + ' to the new tray ' + assignedServiceTray
				}
			}
			
			this.updateDocumentState(YammaModel.DOCUMENT_STATE_DELIVERING);
			
			this.updateDocumentHistory(
				'distribute.comment', 
				[
					Utils.Alfresco.getSiteTitle(assignedServiceName), 
					assignedServiceTray.properties.title || assigneServiceTray.name
				]
			);
			
			return assignedServiceTray;
			
		},
				
		copyDocumentToCCTrays : function() {
			
			var
				me = this,
				distributedServiceNodes = DocumentUtils.getDistributedServices(this.node),
				successfulServicesNodes = [],
				
				copiedFiles = Utils.map(distributedServiceNodes, function(serviceNode) {
					
					var 
						serviceName = serviceNode.name,
						tray = getServiceTray(serviceName, TraysUtils.CCBOX_TRAY_NAME)
					;
					if (null == tray) return;
					
					var documentCopy = me.node.copy(tray);
					if (null == documentCopy) return;
					
					successfulServicesNodes.push(serviceNode);
		
					// if the copy correctly performed herebefore then the cm:copiedfrom
					// is already set as expected.
					// So this piece of code may be superfluous
					if (!documentCopy.hasAspect('cm:copiedfrom')) {
						documentCopy.addAspect('cm:copiedfrom');
						documentCopy.createAssociation(documentNode, 'cm:original');
					}
					
					return documentCopy;
				})
			;
	
			if (Utils.isArrayEmpty(copiedFiles)) return [];
			
			
			// Update history
			var 
			
				servicesTitles = Utils.map(successfulServicesNodes, function(serviceNode) {
					var serviceTitle = Utils.Alfresco.getSiteTitle(serviceNode) || serviceNode.name;
					return serviceTitle;
				}),
				
				formattedServicesTitle = Utils.String.join(servicesTitles, ',')
			;
			
			this.updateDocumentHistory('copy.comment', [formattedServicesTitle]);
			
			return copiedFiles;
			
		}
		
	});

	Yamma.Actions.DistributeAction.execute();	
	
	
})();