///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/actions/common.lib.js">
///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/actions/parseargs.lib.js">
///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">

(function() {
	
	const DISTRIBUTION_EVENT_TYPE = 'distribution';

	// PRIVATE
	var 
		fullyAuthenticatedUserName = Utils.Alfresco.getFullyAuthenticatedUserName(),
		documentNode,	
		documentContainer
	;
	
	// MAIN LOGIC
	
	Common.securedExec(function() {
		var 
			parseArgs = new ParseArgs({ name : 'nodeRef', mandatory : true}),
			documentNodeRef = parseArgs['nodeRef']
		;
		
		documentNode = search.findNode(documentNodeRef);
		if (!documentNode) {
			throw {
				code : '512',
				message : 'InvalidStateException! The provided nodeRef does not exist in the repository'
			}
		}
		
		if (!ActionUtils.canDistribute(documentNode, fullyAuthenticatedUserName)) {
			throw {
				code : '403',
				message : 'Forbidden! The action cannot be executed by you in the current context'
			}			
		}
		
		documentContainer = DocumentUtils.getDocumentContainer(documentNode);
		
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
		
		var 
			assignedServiceName = DocumentUtils.getAssignedServiceName(documentNode),
			currentTray = TraysUtils.getEnclosingTray(documentNode),
			currentTrayName = null != currentTray ? currentTray.name : TraysUtils.INBOX_TRAY_NAME,
			assignedServiceTray = TraysUtils.getSiteTray(assignedServiceName, currentTrayName ) 
		;		
		if (!assignedServiceTray) return;
		
		var document = documentContainer;
		if (!documentContainer) {
			logger.warn('Cannot find the container of document ' + document.nodeRef + '. Using the actual document instead.');
			document = documentNode;
		}
		
		if (!document.move(assignedServiceTray)) {
			throw {
				code : '512',
				message : 'IllegalStateException! Cannot move the document ' + document.name + ' to the new tray ' + assignedServiceTray
			}
		}
		
		updateDocumentState();
		updateDocumentHistory(
			'distribute.comment', 
			[
				Utils.Alfresco.getSiteTitle(assignedServiceName), 
				assignedServiceTray.properties.title || assigneServiceTray.name
			]
		);
		
		return assignedServiceTray;
	}
	
	function updateDocumentState() {
		
		documentNode.properties[YammaModel.STATUSABLE_STATE_PROPNAME] = YammaModel.DOCUMENT_STATE_DELIVERING;
		documentNode.save();
		
	}
	
	function updateDocumentHistory(commentKey, args) {
		
		var message = msg.get(commentKey, args);
		// set a new history event
		HistoryUtils.addHistoryEvent(
			documentNode, 
			DISTRIBUTION_EVENT_TYPE, /* eventType */
			message /* comment */
		);
		
	}
	
	function copyDocumentToCCTrays() {
		
		var 
			distributedServiceNodes = DocumentUtils.getDistributedServices(documentNode),
			
			successfulServicesNodes = [], // filled as a side effect of Utils.map
			
			copiedFiles = Utils.map(distributedServiceNodes, function(serviceNode) {
				
				var 
					serviceName = serviceNode.name,
					tray = getServiceTray(serviceName, TraysUtils.CCBOX_TRAY_NAME)
				;
				if (!tray) return;
				
				var documentCopy = documentNode.copy(tray);
				if (documentCopy == null) return;
				
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
		var formattedServicesTitle = Utils.reduce(
			successfulServicesNodes, 
			function(serviceNode, aggregateValue, isLast) {
				var serviceTitle = Utils.Alfresco.getSiteTitle(serviceNode) || serviceNode.name;
				return aggregateValue + serviceTitle + (isLast ? '' : ', ');
			},
			''
		);
		
		updateDocumentHistory('copy.comment', [formattedServicesTitle]);
		
		return copiedFiles;
		
	}	
	
	function setModel(tray, newCopiedDocuments) {
		
		model.targetTrayNodeRef = Utils.asString(tray.nodeRef);
		model.newCopiedDocuments = newCopiedDocuments || [];
		
	}
	
	
})();