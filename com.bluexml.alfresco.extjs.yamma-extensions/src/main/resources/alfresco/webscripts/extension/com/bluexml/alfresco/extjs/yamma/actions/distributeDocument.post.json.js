///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/alfresco/extjs/yamma/actions/common/common.lib.js">
///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/alfresco/extjs/yamma/actions/common/parseargs.lib.js">
///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/utils/utils.lib.js">
///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-utils.js">

(function() {

	// PRIVATE
	var documentNode;
	var assignedServiceTray;
	
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
		
		assignedServiceTray = getAssignedServiceTray(TraysUtils.INBOX_TRAY_NAME);
		if (!assignedServiceTray) return;
		
		moveDocument();
	}
	
	function getAssignedServiceTray(trayName) {
		
		var assignedServiceNodes = documentNode.assocs[ASSIGNABLE_SERVICE_ASSOCNAME];
		if (!assignedServiceNodes) return null;
		if (0 == assignedServiceNodes.length) return null;
		
		var assignedServiceNode = assignedServiceNodes[0];
		var assignedServiceName = assignedServiceNode.name;
		if (!assignedServiceName) {
			logger.warn('Assigned service to document with nodeRef ' + documentNode.nodeRef + ' is null or empty');
			return null;
		}
		
		var siteNode = getSiteNodeFromSiteLabel(assignedServiceName); 		
		if (!siteNode) {
			logger.warn('Assigned service to document with nodeRef ' + documentNode.nodeRef + ' is set to an invalid service (no matching site): ' + assignedServiceName);
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

	function moveDocument() {
		
		if (!documentNode.move(assignedServiceTray)) {
			logger.warn('Cannot move the document ' + documentNode + ' to the new tray ' + assignedServiceTray);
		}
		
	}
	
	function setModel(childrenDescription) {
		model.targetTrayNodeRef = '' + assignedServiceTray.nodeRef;
	}
	
	
})();