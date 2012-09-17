(function() {	

	const CONTAINER_DOT_EXTENSION = ".container";
	
	DocumentUtils = {
		
		isCopy : function(documentNode) {
			DocumentUtils.checkDocument(documentNode);
			
			var originalAssocs = documentNode.assocs[YammaModel.DOCUMENT_COPY_ORIGINAL_ASSOCNAME];
			return (null != originalAssocs) && (originalAssocs.length > 0);			
		},
		
		getLateState : function(documentNode) {
			if (!documentNode) return YammaModel.LATE_STATE_UNDETERMINED;
			
			var dueDate = documentNode.properties[YammaModel.PRIORITIZABLE_DUE_DATE_PROPNAME];
			if (!dueDate) return YammaModel.LATE_STATE_UNDETERMINED;
			
			var 
				now = new Date(),
				timeFromNowInDays = (dueDate.getTime() - now.getTime()) / 1000 / 60 / 60 / 24,
				isLate = (timeFromNowInDays < 0),
				isHurry = (timeFromNowInDays < 2)
			;
			
			if (isLate) return YammaModel.LATE_STATE_LATE;
			if (isHurry) return YammaModel.LATE_STATE_HURRY;			
			return YammaModel.LATE_STATE_ONTIME;
		},
		
		isDocumentDelivered : function(documentNode) {
			DocumentUtils.checkDocument(documentNode);
			
			var enclosingSite = YammaUtils.getSiteNode(documentNode);
			if (!enclosingSite) return false;
			
			var enclosingSiteName = enclosingSite.name;
				
			var assignedService = DocumentUtils.getAssignedService(documentNode); 
			if (!assignedService) return false;		
			
			var assignedServiceName = assignedService.name;
			if (!assignedServiceName) return false;
			
			return Utils.asString(enclosingSiteName) == Utils.asString(assignedServiceName); // String Object-s
		},		
		
		checkDocumentState : function(documentNode, expectedDocumentState) {
			
			DocumentUtils.checkDocument(documentNode);
				
			var documentState = documentNode.properties[YammaModel.STATUSABLE_STATE_PROPNAME];
			var isInExpectedState = expectedDocumentState == Utils.asString(documentState); 
			
			return isInExpectedState;
			
		},
		
		getAssignedService : function(documentNode) {
			DocumentUtils.checkDocument(documentNode);
			
			var assignedService = documentNode.assocs[YammaModel.ASSIGNABLE_SERVICE_ASSOCNAME];
			if (!assignedService || 0 == assignedService.length ) return null;
			
			var firstAssignedService = assignedService[0];
			return firstAssignedService;
		},
		
		getAssignedAuthority : function(documentNode) {
			DocumentUtils.checkDocument(documentNode);
			
			var assignedAuthority = documentNode.assocs[YammaModel.ASSIGNABLE_AUTHORITY_ASSOCNAME];
			if (!assignedAuthority || 0 == assignedAuthority.length ) return null;
			
			var firstAssignedAuthority = assignedAuthority[0];
			return firstAssignedAuthority;			
		},
		
		isAssignedAuthority : function(documentNode, username) {
			DocumentUtils.checkDocument(documentNode);
			
			username = username || Utils.getCurrentUserName();
			
			var assignedAuthority = DocumentUtils.getAssignedAuthority(documentNode);
			if (!assignedAuthority) return false;
			var assignedAuthorityUserName = Utils.getPersonUserName(assignedAuthority);
			
			return assignedAuthorityUserName == username;
		},
		
		isServiceManager : function(documentNode, username) {
			
			DocumentUtils.checkDocument(documentNode);
			username = username || Utils.getCurrentUserName();
			
			var currentServiceSite = DocumentUtils.getCurrentServiceSite(documentNode);
			if (!currentServiceSite) return false;
			
			var memberRole = Utils.asString(currentServiceSite.getMembersRole(username));
			return ('SiteManager' == memberRole);
			
		},
		
		getDistributedServices : function(documentNode) {
			DocumentUtils.checkDocument(documentNode);
			
			return documentNode.assocs[YammaModel.DISTRIBUTABLE_SERVICES_ASSOCNAME] || [];
		},
		
		getCurrentServiceSite : function(documentNode) {
			DocumentUtils.checkDocument(documentNode);			
			var 
				siteShortName = documentNode.getSiteShortName(),
				site = siteService.getSite(siteShortName)
			;
			
			return site;
		},
		
		checkDocument : function(documentNode) {
			if (!DocumentUtils.isDocumentNode(documentNode))
				throw new Error('IllegalArgumentException! The provided documentNode is not of the correct type');			
		},
		
		isDocumentNode : function(documentNode) {
			return (
				documentNode && 
				('undefined' != typeof documentNode.isSubType) && 
				documentNode.isSubType(YammaModel.DOCUMENT_TYPE_SHORTNAME)
			);
		},
		
		isOriginalDocumentNode : function(documentNode) {
			return (
				DocumentUtils.isDocumentNode(documentNode) && 
				!DocumentUtils.isCopy(documentNode)
			);
		},
		
		isDocumentContainer : function(node) {
			return (
				node && 
				('undefined' != typeof node.isSubType) && 
				node.isSubType(YammaModel.DOCUMENT_CONTAINER_SHORTNAME)
			);
		},	
		
		/**
		 * Returns the container of a document or itself if already the container.
		 *  
		 * @param {ScriptNode} document the document or the container
		 * @return {ScriptNode} a document-container
		 */
		getDocumentContainer : function(document) {
			
			if (!document) return null;
			if (DocumentUtils.isDocumentContainer(document)) return document;
			
			// Try with source-association
			var source = document.sourceAssocs[YammaModel.DOCUMENT_CONTAINER_REFERENCE_ASSOCNAME][0];
			if (DocumentUtils.isDocumentContainer(source)) return source;
			
			// Try with parent => may lead to inconsistencies
			var parent = document.parent;
			if (DocumentUtils.isDocumentContainer(parent)) return parent;
			
			return null;
		},		
		
		/**
		 * Creates the container of the provided document.
		 * 
		 * @param {ScriptNode} document the document as a ScriptNode
		 * @param {Boolean} [moveInside=true] Whether to move the provided document inside its newly defined container
		 * 
		 */
		createDocumentContainer : function(document, moveInside /* default=true */) {
			
			if (!document) return null;
			
			var documentName = document.name;
			if (!documentName) return null;
			
			var 
				containerName = documentName + CONTAINER_DOT_EXTENSION,		
				documentParent = document.parent
			;
			if (!documentParent) return null;
			
			var documentContainer = documentParent.createFolder(containerName, YammaModel.DOCUMENT_CONTAINER_SHORTNAME);
			if (!documentContainer) return null;
			
			if (moveInside) {
				if (!document.move(documentContainer)) {
					logger.warn("Cannot move the document '" + document.name + "' into its newly created container!");
				}
			}
			documentContainer.createAssociation(document, YammaModel.DOCUMENT_CONTAINER_REFERENCE_ASSOCNAME);
			
			return documentContainer;
			
		}
		
	};

})();
