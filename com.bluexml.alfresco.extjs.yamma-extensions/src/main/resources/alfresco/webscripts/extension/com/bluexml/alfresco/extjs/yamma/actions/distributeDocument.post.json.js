///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/alfresco/extjs/yamma/actions/common/common.lib.js">
///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/alfresco/extjs/yamma/actions/common/parseargs.lib.js">
///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/utils/utils.lib.js">
///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">

(function() {
	
	const DISTRIBUTION_EVENT_TYPE = 'distribution';

	// PRIVATE
	var documentNode;
	var documentContainer;
	
	// MAIN LOGIC
	
	Common.securedExec(function() {
		var parseArgs = new ParseArgs({ name : 'nodeRef', mandatory : true});
		var documentNodeRef = parseArgs['nodeRef'];
		documentNode = search.findNode(documentNodeRef);
		if (!documentNode) {
			throw {
				code : '512',
				message : 'InvalidStateException! The provided nodeRef does not exist in the repository'
			}
		}
		documentContainer = YammaUtils.getDocumentContainer(documentNode);
		
		main();
	});
	
	function main() {
		
		var assignedServiceTray = moveDocumentToTray();
		if (null == assignedServiceTray) {
			setModel('',[]);
			return;
		}
			
		var copiedDocuments = copyDocumentToCCTrays();
		setModel(assignedServiceTray || '', copiedDocuments || []);
	}	

	/**
	 * Move the document in the selected service tray
	 * @returns the tray-node in which the document was moved
	 */
	function moveDocumentToTray() {
		
		var assignedServiceNode = YammaUtils.getAssignedService(documentNode);
		var assignedServiceName = assignedServiceNode.name;
		var currentTray = TraysUtils.getEnclosingTray(documentNode);
		var assignedServiceTray = getServiceTray(assignedServiceName, currentTray.name || 'inbox');		
		if (!assignedServiceTray) return;
		
		var document = documentContainer;
		if (!documentContainer) {
			logger.warn('Cannot find the container of document ' + document.nodeRef + '. Using the actual document instead.');
			document = documentNode;
		}
		
		if (!document.move(assignedServiceTray)) {
			logger.warn('Cannot move the document ' + document.name + ' to the new tray ' + assignedServiceTray);
			return null;
		}
		
		updateDocumentState();
		udpateDocumentHistory(assignedServiceName);
		
		return assignedServiceTray;
	}
	
	function updateDocumentState() {
		
		documentNode.properties[YammaModel.STATUSABLE_STATE_PROPNAME] = YammaModel.DOCUMENT_STATE_DELIVERING;
		documentNode.save();
		
	}
	
	function udpateDocumentHistory(assignedServiceName) {
		
		var message = msg.get('distribute.comment', [assignedServiceName]);
		// set a new history event
		HistoryUtils.addHistoryEvent(
			documentNode, 
			DISTRIBUTION_EVENT_TYPE, /* eventType */
			message /* comment */
		);
		
	}
	
	function copyDocumentToCCTrays() {
		
		var distributedServiceNodes = YammaUtils.getDistributedServices(documentNode);
		var distributedServiceTrays = Utils.map(distributedServiceNodes, function(distributedServiceNode) {
			var distributedServiceName = distributedServiceNode.name;
			return getServiceTray(distributedServiceName, TraysUtils.CCBOX_TRAY_NAME);
		});
		
		var copiedFiles = Utils.map(distributedServiceTrays, function(tray) {
			var documentCopy = documentNode.copy(tray);
			if (documentCopy == null) return null;
			
			if (documentCopy.addAspect(YammaModel.DOCUMENT_COPY_ASPECT_SHORTNAME)) {
				//success adding aspect, set the correct link
				documentCopy.createAssociation(documentNode, YammaModel.DOCUMENT_COPY_ORIGINAL_ASSOCNAME);
			}
			
			return documentCopy;
		});
		
		return copiedFiles;
		
	}	
	
	function getServiceTray(serviceName, trayName) {
		
		if (!serviceName) return null;
		
		var siteNode = getSiteNodeFromSiteLabel(serviceName); 		
		if (!siteNode) {
			logger.warn('Service assigned to document with nodeRef ' + documentNode.nodeRef + ' is set to an invalid service (no matching site): ' + serviceName);
			return null;			
		}
		
		return TraysUtils.getSiteTray(siteNode, trayName);
		
	}
	
	function getSiteNodeFromSiteLabel(siteLabel) {
		var site = siteService.getSite(siteLabel);
		if (site) return site.getNode();
		
		var query = '+TYPE:"st\:site" +@cm\\:title:"' + siteLabel + '"';
		var siteNodes = search.luceneSearch(query);
		if (siteNodes && siteNodes.length == 1) return siteNodes[0];
		
		return null;
	}
	
	
	function setModel(tray, newCopiedDocuments) {
		model.targetTrayNodeRef = '' + tray.nodeRef;
		model.newCopiedDocuments = newCopiedDocuments || []; 
	}
	
	
})();