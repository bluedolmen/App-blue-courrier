(function() {	

	const CONTAINER_DOT_EXTENSION = ".container";
	
	DocumentUtils = {
			
		DOCUMENT_INCOMING_TASK_STATUS : {
			'pendingTask'    : 'pending',
			'deliveringTask' : 'delivering',
			'validatingTask' : 'validating!delivery',
			'processingTask' : 'processing',
			'processed'      : 'processed' // useless ? (not a user-task)
		},
		
		DOCUMENT_OUTGOING_TASK_STATUS : {
			'processingTask'    : 'processing',
			'sendingTask'       : 'sending',
			'validatingTask'    : 'validating!processed',
			'certifyingTask'    : 'certifying',
			'processed'         : 'processed' // useless ?
		},
			
		createCopy : function(documentNode, target) {
			
			if (null == target) {
				throw new Error('IllegalArgumentException! The provided target is not valid (null)');
			}
			
			DocumentUtils.checkDocument(documentNode);
			
			var 
				documentCopy,
				documentContainer,
				documentContainerCopy,
				documentName = documentNode.name
			;
			
			function copyExists() {
				
				var targetByName = target.childByNamePath(documentName);
				if (null == targetByName) return false;
				
				var source = documentNode.sourceAssocs[YammaModel.COPIED_FROM_ORIGINAL_ASSOCNAME];
				if (null == source) return false;
				
				return source.equals(documentNode);
				
			};
			
			if (copyExists()) return;
			
			documentContainer = DocumentUtils.getDocumentContainer(documentNode);
			if (null != documentContainer) {
				documentContainerCopy = documentContainer.copy(target, true /* deepCopy */);
				documentCopy = (documentContainerCopy.assocs[YammaModel.DOCUMENT_CONTAINER_REFERENCE_ASSOCNAME] || [null])[0];				
			}
			else {
				documentCopy = documentNode.copy(target);
			}
			
			if (null == documentCopy) return null;
			
			documentCopy = DocumentUtils.getDocumentNode(documentCopy); // change to the contained copy
			
			// add the copiedfrom aspect
			documentCopy.addAspect(YammaModel.COPIED_FROM_ASPECT_SHORTNAME);
			documentCopy.createAssociation(documentNode, YammaModel.COPIED_FROM_ORIGINAL_ASSOCNAME);
			
			return documentCopy;
			
			
		},
		
		isCopy : function(documentNode) {
			
			DocumentUtils.checkDocument(documentNode);
			
			if (!documentNode.hasAspect(YammaModel.COPIED_FROM_ASPECT_SHORTNAME)) return false;
						
			var originalAssocs = documentNode.assocs[YammaModel.COPIED_FROM_ORIGINAL_ASSOCNAME];
			
			return null != originalAssocs;
			
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
			
			var enclosingSite = Utils.Alfresco.getEnclosingSiteNode(documentNode);
			if (null == enclosingSite) return false;
			
			var 
				enclosingSiteName = Utils.asString(enclosingSite.name),
				assignedServiceName = DocumentUtils.getAssignedServiceName(documentNode)
			; 
			if (null == assignedServiceName) return false;			
			
			return enclosingSiteName == assignedServiceName;
			
		},		
		
		getDocumentState : function(documentNode) {
			
			if (null == documentNode) return null;
			return Utils.asString(documentNode.properties[YammaModel.STATUSABLE_STATUS_PROPNAME]);
			
		},
		
		setDocumentState : function(documentNode, state, doNotPersist /* false */) {
			
			DocumentUtils.checkDocument(documentNode);
			documentNode.properties[YammaModel.STATUSABLE_STATUS_PROPNAME] = state;
			
			if (true === doNotPersist) return;
			documentNode.save();
			
		},
		
		checkDocumentState : function(documentNode, expectedDocumentState) {
			
			DocumentUtils.checkDocument(documentNode);
				
			var documentState = DocumentUtils.getDocumentState(documentNode);
			return Utils.contains([].concat(expectedDocumentState), documentState);
			
		},
		
		getAssignedAuthority : function(documentNode) {
			DocumentUtils.checkDocument(documentNode);
			
			var assignedAuthorities = documentNode.assocs[YammaModel.ASSIGNABLE_AUTHORITY_ASSOCNAME];
			if (null == assignedAuthorities || 0 == assignedAuthorities.length ) return null;
			
			return assignedAuthorities[0];
		},
		
		hasAssignedAuthority : function(documentNode) {
			
			var assignedAuthority = DocumentUtils.getAssignedAuthority(documentNode);
			return (null != assignedAuthority);
			
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
			
			var siteShortName = Utils.Alfresco.getEnclosingSiteName(documentNode);
			if (null == siteShortName) return false;
			
			return ServicesUtils.hasServiceRole(siteShortName, username, role);
			
		},
		
		isServiceManager : function(documentNode, username) {
			
			DocumentUtils.checkDocument(documentNode);
			username = username || Utils.Alfresco.getCurrentUserName();
			
			var siteShortName = Utils.Alfresco.getEnclosingSiteName(documentNode);
			if (null == siteShortName) return false;
			
			return ServicesUtils.isServiceManager(siteShortName, username);
			
		},
		
//		getDistributedServices : function(documentNode) {
//			DocumentUtils.checkDocument(documentNode);
//			
//			return documentNode.assocs[YammaModel.DISTRIBUTABLE_SERVICES_ASSOCNAME] || [];
//		},
		
		getCurrentServiceSite : function(documentNode) {
			DocumentUtils.checkDocument(documentNode);			
			var 
				siteShortName = Utils.Alfresco.getEnclosingSiteName(documentNode),
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
			
			var  nodeRef = Utils.asString(documentNode.nodeRef) || null;
			if (null == nodeRef) return false;
			
			return DocumentUtils._isDocumentNodeCache.getOrSetValue(
				nodeRef, /* key */
				function compute() {
					return documentNode.hasAspect(YammaModel.DOCUMENT_ASPECT_SHORTNAME);						
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
			var source = (document.sourceAssocs[YammaModel.DOCUMENT_CONTAINER_REFERENCE_ASSOCNAME] || [null])[0];
			if (DocumentUtils.isDocumentContainer(source)) return source;
			
			// Try with parent => may lead to inconsistencies
			var parent = document.parent;
			if (DocumentUtils.isDocumentContainer(parent)) return parent;
			
			return null;
		},		
		
		/**
		 * Get the document from a document-container
		 * @return {ScriptNode} the document
		 */
		getDocumentNode : function(documentContainer) {
			
			if (null == documentContainer) return null;
			if (DocumentUtils.isDocumentNode(documentContainer)) return documentContainer;
			
			return (documentContainer.assocs[YammaModel.DOCUMENT_CONTAINER_REFERENCE_ASSOCNAME] || [null])[0];
			
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
			
			var documentContainer = DocumentUtils.getDocumentContainer(document);
			if (null != documentContainer) return documentContainer;
			
			var documentParent = document.parent;
			if (null == documentParent) return null;
			
			var
				containerName = this.getUniqueContainerName(document),
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
				subContainer = this.createDocumentSubContainer(document, subContainerName);
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
		
		moveToSiblingTray : function(documentNode, trayKind) {
			
			var documentContainer = DocumentUtils.getDocumentContainer(documentNode);
			if (null == documentContainer) return 'Cannot get the document container';
				
			var enclosingTray = TraysUtils.getEnclosingTray(documentNode);
			if (null == enclosingTray) return 'Cannot get the enclosing tray';
			
			var tray = TraysUtils.getSiblingTray(enclosingTray, trayKind);
			if (null == tray) return "Cannot get the tray of name '" + trayKind + "'";
	
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
		moveToServiceTray : function(documentNode, serviceName, trayKind /* optional */) {
			
			var documentContainer = DocumentUtils.getDocumentContainer(documentNode);
			if (null == documentContainer) return 'Cannot get the document container';
			
			if (null == trayKind) {
				var enclosingTray = TraysUtils.getEnclosingTray(documentNode);
				if (null == enclosingTray) return 'Cannot get the enclosing tray';
				trayKind = enclosingTray.name;
			}
			
			var siteTargetTray = TraysUtils.getSiteTray(serviceName, trayKind);		
			if (null == siteTargetTray) return "Cannot get the site tray '" + trayKind + "' of service '" + serviceName + "'";
			
			if (!documentContainer.move(siteTargetTray)) {
				return "Cannot move the provided document to the site tray '" + trayKind + "' of service '" + serviceName + "'";
			}
			
			return '';
			
		},
		
		updateInternalReference : function(documentNode) {
			
			this.checkDocument(documentNode);
			
			var internalReference = referenceProvider.getReference(documentNode);
			documentNode.properties[YammaModel.REFERENCEABLE_INTERNAL_REFERENCE_PROPNAME] = internalReference;
			documentNode.save();
			
		},
		
		displayText : function(documentNode) {
			
			this.checkDocument(documentNode);
			
			var 
				reference = Utils.asString( 
					documentNode.properties[YammaModel.REFERENCEABLE_REFERENCE_PROPNAME] ||
					documentNode.properties[YammaModel.REFERENCEABLE_INTERNAL_REFERENCE_PROPNAME]
				),
				title = Utils.asString(documentNode.properties['cm:title']),
				name = Utils.asString(documentNode.properties['cm:name']),
    			displayValue = ''
    				+ (reference ? '[' + reference + '] ' : '')
    				+ (title ? title : name)
    				+ (title ? ' (' + name + ')' : '')
			;
			
			return displayValue;
			
		}
		
		
	};

})();
