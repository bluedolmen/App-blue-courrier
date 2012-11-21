///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/actions/common.lib.js">
///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/actions/parseargs.lib.js">
///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">

/**
 * TODO: Refactor this to get a much better architecture separating the content
 * of archives management and the one of trays management.
 * 
 * That may be performed by creating two webscripts, each of them using an helper
 * library.
 */
(function() {

	// PRIVATE
	var 
		treeNodeRef = null,
		treeNode = null,
		rootType = Utils.asString(url.templateArgs.rootType)
	;
	
	// MAIN LOGIC
	
	Common.securedExec(function() {
		var parseArgs = new ParseArgs('node');
		treeNode = getTreeNode(parseArgs);
		
		main();
	});
	
	function getTreeNode(parseArgs) {
		treeNodeRef = parseArgs['node'];
		
		if (treeNodeRef && 'root' !== treeNodeRef)
			return Common.getExistingNode(treeNodeRef);	
	}
	
	function main() {
		
		var children = getTreeChildren();
		setModel(children);
		
	}
	
	function getTreeChildren() {
		
		if ('trays' == rootType) {
			return getTraysTreeChildren();
		} else if ('archives' == rootType) {
			return getArchivesTreeChildren();
		}
			
		return sortByTitle(getAllChildren());	
	}
	
	function getTraysTreeChildren() {
		
		if ('root' == treeNodeRef) { // root-node => get sites
			var children = getServicesNodes(
			
				/* hasChildren */
				function(node) {
					return (node.childrenByXPath(".//*[subtypeOf('" + YammaModel.TRAY_TYPE_SHORTNAME + "')]") || []).length > 0;
				},
				
				/* countFunction */
				getSelectNodeDescendantNumberFunction(
					".//*[subtypeOf('" + YammaModel.TRAY_TYPE_SHORTNAME + "')]//*[subtypeOf('" + YammaModel.DOCUMENT_TYPE_SHORTNAME + "')]"
				)
				
			)
			
			return sortByTitle(children);
		}

		var treeNodeType = Utils.asString(treeNode.typeShort);	
		if ('st:site' == treeNodeType) {
			var 
				siteTrays = getSiteTraysChildren()
//				,siteVirtualTrays = getSiteVirtualTraysChildren()
			;
			return sortByTitle(siteTrays);//.concat(siteVirtualTrays);				
		}
		
	}
	
	function getArchivesTreeChildren() {
		
		if ('root' == treeNodeRef) { // root-node => get sites
			
			var children = getServicesNodes(null, null,
				function acceptSiteFunction(site) {
					var 
						siteNode = site.node,
						archivesFolder = ArchivesUtils.getArchivesContainer(siteNode)
					;
					return !!archivesFolder;
				}
			);
			
			return sortByTitle(children);
		}
		
		return [];
	}
	
	/**
	 * Get the services nodes.
	 * 
	 * Services are structured by sites.
	 */
	function getServicesNodes(hasChildren, countFunction, acceptSiteFunction) {
		
		var 
			sitesNode = ParameterCheck.mandatory(
				companyhome.childByNamePath('Sites'), 
				'IllegalStateException! The Sites folder cannot be found'
			),
			sites = siteService.listSites('',''),
			
			filteredSiteNodes = Utils.map(sites, function(site) {
				if (YammaUtils.isConfigSite(site.shortName) ) return; // ignore config site
				if (acceptSiteFunction && !acceptSiteFunction(site)) return; // ignore filtered sites
				return site.node;
			})
		;		
		
		return Utils.map(filteredSiteNodes, function(siteNode) {
			
			return {
				type : siteNode.typeShort,
				name : siteNode.name,
				title : siteNode.properties.title,
				ref : Utils.asString(siteNode.nodeRef),
				hasChildren : hasChildren ? hasChildren(siteNode) : false,
				count : countFunction ? countFunction(siteNode) : 0
			};
			
		});
		
	}

	
	function getSiteTraysChildren() {
		var 
			trayNodes = TraysUtils.getSiteTraysChildren(treeNode),
			serviceName = treeNode.name, // aka site-name
				
			countFunction = getSelectNodeDescendantNumberFunction(
					".//*[subtypeOf('" + YammaModel.DOCUMENT_TYPE_SHORTNAME + "')]"
			)
		;
			
		return Utils.map(trayNodes, function(trayNode) {
			var 
				trayName = trayNode.name || '',
				trayDefinition = TraysUtils.TRAYS[trayName] || {},
				trayTitle = trayNode.properties.title || trayDefinition.title,
				trayFilters = trayDefinition.filters || [],
				trayDefinition = {
					type : 'tray',
					name : trayName,
					title : trayTitle,
					ref : Utils.asString(trayNode.nodeRef),
					hasChildren : false,
					count : countFunction(trayNode)
				}
			;
			
			if (trayFilters.length > 0) {
				trayDefinition.hasChildren = true;
				trayDefinition.children = Utils.map(trayFilters, function(stateName) {
					return getVirtualStateTrayDefinition(serviceName, trayName, stateName);
				});
			}
			
			return trayDefinition;
			
		});
	}
	
	function getVirtualStateTrayDefinition(serviceName, trayName, stateName) {
		
		return ({
			type : 'state-tray',
			name : stateName,
			title : stateName,
			ref : serviceName + '|' + trayName + '|' + stateName, // ref has to be unique globally on a tree 
			hasChildren : false
		});
		
	}
	
	function getSiteVirtualTraysChildren() {
				
		var parentName = Utils.asString(treeNode.name);
		
		function getStateTrayDefinition(stateName) {
			return ({
				type : 'state-tray',
				name : stateName,
				title : stateName,
				ref : parentName + '|' + stateName, // ref has to be unique globally on a tree 
				hasChildren : false
			});			
		}
		
		return Utils.map(YammaModel.DOCUMENT_STATES, function(stateName) {
			
			if (YammaModel.DOCUMENT_STATE_VALIDATING_DELIVERY == stateName) return; //ignore
			if (YammaModel.DOCUMENT_STATE_ARCHIVED == stateName) return;
			
			return getStateTrayDefinition(stateName);
		});
		
		
	}
	
	function getDocumentLibraryChildren() {
		var documentLibraryNode = treeNode.childByNamePath('documentLibrary');
		if (!documentLibraryNode) return [];
		
		return getChildrenDescription(documentLibraryNode.children);
	}
	
	function getSelectNodeDescendantNumberFunction(query) {
		
		if (!query)
			throw "IllegalStateException! The provided xpath-like expression cannot be undefined nor null";
		
		return function(rootNode) {
			if (!rootNode) return 0;
			var matchingNodes = rootNode.childrenByXPath(query) || [];
			
			return matchingNodes.length;			
		};	
		
	}
	
	function getAllChildren() {
		return getChildrenDescription(treeNode.children);
	}
	
	/**
	 * Get the node children description.
	 * 
	 * @param {ScriptNode[]} children the list of Alfresco node children
	 * @param {Object} overrideConfig the overriding config for each child
	 * @param {Function} countFunction
	 * 
	 * @return {Object[]} An array of child description
	 */
	function getChildrenDescription(children, overrideConfig, countFunction) {
		overrideConfig = overrideConfig || {};
		
		return Utils.map( children,
			function(child) {
				var 
					count = countFunction ? countFunction(child) : null,
					childDescription = getChildDescription(child)
				;
					
				if (null != count) {
					childDescription.count = count;
				}
				
				Utils.apply(childDescription, overrideConfig);
				
				return childDescription;
			}
		);		
	}
	
	function getChildDescription(child) {
		
		return {
			type : child.typeShort,
			title : child.properties.title || child.name,
			ref : '' + child.nodeRef,
			hasChildren : ('cm:content' != child.typeShort) && (child.children.length > 0)
		};
		
	}
	
	function setModel(childrenDescription) {
		
		var childrenCount = childrenDescription.length;
		model.totalChildren = childrenCount;
		model.startIndex = 1;
		model.itemCount = childrenCount;
		model.children = childrenDescription;
		
	}
	
	function sortByTitle(array) {
		
		array = array || [];
		return array.sort(function(a,b) {
			var aTitle = a.title || '';
			var bTitle = b.title || '';
			
			if (aTitle == bTitle) return 0;
			return aTitle < bTitle ? -1 : 1;
			
		});
		
	}

	
})();