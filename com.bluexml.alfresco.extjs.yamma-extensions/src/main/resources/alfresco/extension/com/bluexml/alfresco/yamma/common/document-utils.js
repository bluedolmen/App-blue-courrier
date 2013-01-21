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
			
			var 
				enclosingSiteName = Utils.asString(enclosingSite.name),
				assignedServiceName = DocumentUtils.getAssignedServiceName(documentNode)
			; 
			if (null == assignedServiceName) return false;			
			
			return enclosingSiteName == assignedServiceName;
		},		
		
		checkDocumentState : function(documentNode, expectedDocumentState) {
			
			DocumentUtils.checkDocument(documentNode);
				
			var 
				documentState = Utils.asString(documentNode.properties[YammaModel.STATUSABLE_STATE_PROPNAME])
			;
			
			if (Utils.isArray(expectedDocumentState)) {
				return Utils.contains(expectedDocumentState, documentState);
			} else {
				return (expectedDocumentState == documentState)
			}			
			
		},
		
		getAssignedServiceName : function(documentNode) {
			
			DocumentUtils.checkDocument(documentNode);
			
			var 
				assignedServices = documentNode.assocs[YammaModel.ASSIGNABLE_SERVICE_ASSOCNAME],
				servicesNumber = null == assignedServices ? 0 : assignedServices.length
			;
			if (0 == servicesNumber) return null;
			
			var assignedService = assignedServices[0];
			return Utils.asString(assignedService.name);
			
		},
		
		hasAssignedService : function(documentNode) {
			
			var assignedServiceName = DocumentUtils.getAssignedServiceName(documentNode);
			return (null != assignedServiceName);
			
		},
		
		getAssignedAuthority : function(documentNode) {
			DocumentUtils.checkDocument(documentNode);
			
			var assignedAuthorities = documentNode.assocs[YammaModel.ASSIGNABLE_AUTHORITY_ASSOCNAME];
			if (null == assignedAuthorities || 0 == assignedAuthorities.length ) return null;
			
			return assignedAuthorities[0];
		},
		
		getAssignedAuthorityUserName : function(documentNode) {
			
			var assignedAuthority = DocumentUtils.getAssignedAuthority(documentNode);
			
			return (null == assignedAuthority) ?
				null :
				Utils.Alfresco.getPersonUserName(assignedAuthority)
			;
				
		},
		
		isAssignedAuthority : function(documentNode, username) {
			
			DocumentUtils.checkDocument(documentNode);
			username = username || Utils.Alfresco.getCurrentUserName();
			
			var assignedAuthorityUserName = DocumentUtils.getAssignedAuthorityUserName(documentNode);
			return assignedAuthorityUserName == username;
			
		},
		
		hasServiceRole : function(documentNode, username, role) {
			
			DocumentUtils.checkDocument(documentNode);
			username = username || Utils.Alfresco.getCurrentUserName();
			
			var siteShortName = documentNode.getSiteShortName();
			if (null == siteShortName) return false;
			
			return ServicesUtils.hasServiceRole(siteShortName, username, role);
			
		},
		
		isServiceManager : function(documentNode, username) {
			
			DocumentUtils.checkDocument(documentNode);
			username = username || Utils.Alfresco.getCurrentUserName();
			
			var siteShortName = documentNode.getSiteShortName();
			if (null == siteShortName) return false;
			
			return ServicesUtils.isServiceManager(siteShortName, username);
			
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
		
		_isDocumentNodeCache : Utils.Cache.create(20),
		
		isDocumentNode : function(documentNode) {
			
			if (null == documentNode) return false;
			
			var  nodeRef = Utils.asString(documentNode.nodeRef) || '';
			return DocumentUtils._isDocumentNodeCache.getOrSetValue(
				nodeRef, /* key */
				function compute() {
					return (
						('undefined' != typeof documentNode.isSubType) && 
						documentNode.isSubType(YammaModel.DOCUMENT_TYPE_SHORTNAME)
					);						
				}
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
			if (null == documentName) return null;
			
			
			var 
				documentParent = document.parent,
				containerName = this.getUniqueContainerName(document)
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
		
		getUniqueContainerName : function(document) {
			
			var 
				documentParent = document.parent,
				documentName = Utils.wrapString(document.name),
				
				dotIndex = documentName.lastIndexOf('.'),
				rootName = dotIndex > -1 ? documentName.substr(0, dotIndex) : documentName,
				extension = dotIndex > -1 ? documentName.substr(dotIndex, documentName.length) : '',

				containerName = null,
				index = 0,
				exists = true
				
			;
			
			function buildContainerName() {
				return rootName + (index > 0 ? '-'+ Utils.asString(index) : '') + (extension ? extension : '') + CONTAINER_DOT_EXTENSION;
			}
			
			while (true) {
				
				containerName = buildContainerName();
				exists = documentParent.childByNamePath(containerName) != null;
				if (!exists) break;
				
				index++;
				
			}

			return containerName;
			
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
		},
		
		moveToSiblingTray : function(documentNode, trayName) {
			
			var documentContainer = DocumentUtils.getDocumentContainer(documentNode);
			if (null == documentContainer) return 'Cannot get the document container';
				
			var enclosingTray = TraysUtils.getEnclosingTray(documentNode);
			if (!enclosingTray) return 'Cannot get the enclosing tray';
			
			var tray = TraysUtils.getSiblingTray(enclosingTray, trayName);
			if (!tray) return "Cannot get the tray of name '" + trayName + "'";
	
			if (!documentContainer.move(tray)) {
				return 'Cannot move the document to the tray container';
			}
			
			return '';
		},
	
		/**
		 * Move the provided document-node container to the tray of the provided
		 * service-name. If the tray-name is not provided, then keep the same tray
		 * as the one currently assigned.
		 */
		moveToServiceTray : function(documentNode, serviceName, trayName /* optional */) {
			
			var documentContainer = DocumentUtils.getDocumentContainer(documentNode);
			if (null == documentContainer) return 'Cannot get the document container';
			
			if (null == trayName) {
				var enclosingTray = TraysUtils.getEnclosingTray(documentNode);
				if (!enclosingTray) return 'Cannot get the enclosing tray';
				trayName = enclosingTray.name;
			}
			
			var siteTargetTray = TraysUtils.getSiteTray(serviceName, trayName);		
			if (!siteTargetTray) return "Cannot get the site inbox tray of service '" + serviceName + "'";
			
			if (!documentContainer.move(siteTargetTray)) {
				return "Cannot move the provided document to the site tray '" + trayName + "' of service '" + serviceName + "'";
			}
			
			return '';
			
		}		
		
	};

})();
