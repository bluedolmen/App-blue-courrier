(function() {	

	const CONTAINER_DOT_EXTENSION = ".container";
	
	DocumentUtils = {
		
		isCopy : function(documentNode) {
			DocumentUtils.checkDocument(documentNode);
			
			if (!documentNode.hasAspect('cm:copiedfrom')) return false;
						
			var originalAssocs = documentNode.assocs['cm:original'];
			return (null != originalAssocs) && (originalAssocs.length > 0);			
		},
		
		getLateState : function(documentNode) {
			if (null == documentNode) return YammaModel.LATE_STATE_UNDETERMINED;
			
			var dueDate = documentNode.properties[YammaModel.DUEABLE_DUE_DATE_PROPNAME];
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
			if (null == enclosingSite) return false;
			
			var enclosingSiteName = enclosingSite.name;
				
			var assignedService = DocumentUtils.getAssignedService(documentNode); 
			if (null == assignedService) return false;		
			
			var assignedServiceName = assignedService.name;
			if (!assignedServiceName) return false;
			
			return Utils.asString(enclosingSiteName) == Utils.asString(assignedServiceName); // String Object-s
		},		
		
		checkDocumentState : function(documentNode, expectedDocumentState) {
			
			DocumentUtils.checkDocument(documentNode);
				
			var 
				documentState = documentNode.properties[YammaModel.STATUSABLE_STATE_PROPNAME],
				isInExpectedState = expectedDocumentState == Utils.asString(documentState)
			; 
			
			return isInExpectedState;
			
		},
		
		getAssignedService : function(documentNode) {
			DocumentUtils.checkDocument(documentNode);
			
			var assignedServices = documentNode.assocs[YammaModel.ASSIGNABLE_SERVICE_ASSOCNAME];
			if (null == assignedServices || 0 == assignedServices.length ) return null;
			
			return assignedServices[0];
		},
		
		getAssignedAuthority : function(documentNode) {
			DocumentUtils.checkDocument(documentNode);
			
			var assignedAuthorities = documentNode.assocs[YammaModel.ASSIGNABLE_AUTHORITY_ASSOCNAME];
			if (null == assignedAuthorities || 0 == assignedAuthorities.length ) return null;
			
			return assignedAuthorities[0];
		},
		
		isAssignedAuthority : function(documentNode, username) {
			DocumentUtils.checkDocument(documentNode);
			
			username = username || Utils.Alfresco.getCurrentUserName();
			
			var assignedAuthority = DocumentUtils.getAssignedAuthority(documentNode);
			if (!assignedAuthority) return false;
			var assignedAuthorityUserName = Utils.Alfresco.getPersonUserName(assignedAuthority);
			
			return assignedAuthorityUserName == username;
		},
		
		isServiceManager : function(documentNode, username) {
			
			DocumentUtils.checkDocument(documentNode);
			username = username || Utils.Alfresco.getCurrentUserName();
			
			var currentServiceSite = DocumentUtils.getCurrentServiceSite(documentNode);
			if (null == currentServiceSite) return false;
			
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
				null != documentNode && 
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
				null != node && 
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
			
			if (null == document) return null;
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
			
			if (null == document) return null;
			
			var documentName = document.name;
			if (!documentName) return null;
			
			var 
				containerName = documentName + CONTAINER_DOT_EXTENSION,		
				documentParent = document.parent
			;
			if (null == documentParent) return null;
			
			var
				documentOwner = document.getOwner(),
				documentContainer = documentParent.createFolder(containerName, YammaModel.DOCUMENT_CONTAINER_SHORTNAME)
			;
			if (null == documentContainer) return null;
			
			if (moveInside) {
				if (!document.move(documentContainer)) {
					logger.warn("Cannot move the document '" + document.name + "' into its newly created container!");
				}
			}
			documentContainer.createAssociation(document, YammaModel.DOCUMENT_CONTAINER_REFERENCE_ASSOCNAME);
			documentContainer.setOwner(documentOwner);
			
			return documentContainer;
			
		},
		
		getDocumentSubContainer : function(document, subContainerName, createIfNotExists) {
			
			if (null == document || !subContainerName) {
				throw 'IllegalArgumentException! The provided arguments are not valid (document and/or subContainerName have to be set)'; 
			}
			
			var documentContainer = this.getDocumentContainer(document);
			if (null == documentContainer) return null;
			
			var subContainer = documentContainer.childByNamePath(subContainerName);
			if (null == subContainer && createIfNotExists) {
				subContainer = this.createDocumentSubContainer(document, subContainerName)
			}
			
			return subContainer;
		},
		
		createDocumentSubContainer : function(document, subContainerName) {
			
			if (null == document || !subContainerName) {
				throw 'IllegalArgumentException! The provided arguments are not valid (document and/or subContainerName have to be set)';				
			}
			
			var documentContainer = document;
			if (!this.isDocumentContainer(documentContainer)) {
				documentContainer = this.getDocumentContainer(document);
			}
			if (null == documentContainer) {
				throw "IllegalStateException! Cannot get a valid document container for document'" + document.name + "'";
			}
			
			var
				documentContainerOwner = documentContainer.getOwner(),
				subContainer = documentContainer.createFolder(subContainerName)
			;
			if (null == subContainer) {
				throw "IllegalStateException! You are not allowed to create the container named '" + subContainerName + "' for the document '" + document.names + "'";
			}
			subContainer.setOwner(documentContainerOwner);
			
			return subContainer;			
		}
		
	};

})();
