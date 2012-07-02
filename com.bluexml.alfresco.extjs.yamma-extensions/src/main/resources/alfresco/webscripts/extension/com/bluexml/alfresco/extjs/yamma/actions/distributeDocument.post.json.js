///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/alfresco/extjs/yamma/actions/common/common.lib.js">
///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/alfresco/extjs/yamma/actions/common/parseargs.lib.js">
///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/utils/utils.lib.js">
///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">

(function() {

	// PRIVATE
	var documentNode;
	
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
		
		main();
	});
	
	function main() {
		
		var assignedServiceTray = moveDocument();
		var copiedDocuments = copyDocument();
		
		setModel(assignedServiceTray, copiedDocuments);
	}	

	/**
	 * Move the document in the selected service tray
	 * @returns the tray-node in which the document was moved
	 */
	function moveDocument() {
		
		var assignedServiceNode = YammaUtils.getAssignedService(documentNode);
		var assignedServiceName = assignedServiceNode.name;
		var assignedServiceTray = getServiceTray(assignedServiceName, TraysUtils.INBOX_TRAY_NAME);		
		if (!assignedServiceTray) return;
		
		if (!documentNode.move(assignedServiceTray)) {
			logger.warn('Cannot move the document ' + documentNode + ' to the new tray ' + assignedServiceTray);
		}
		
		return assignedServiceTray;
	}
	
	function copyDocument() {
		
		var distributedServiceNodes = YammaUtils.getDistributedServices(documentNode);
		var distributedServiceTrays = Utils.map(distributedServiceNodes, function(distributedServiceNode) {
			var distributedServiceName = distributedServiceNode.name;
			return getServiceTray(distributedServiceName, TraysUtils.INBOX_TRAY_NAME);
		});
		
		var copiedFiles = Utils.map(distributedServiceTrays, function(tray) {
			return documentNode.copy(tray);
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