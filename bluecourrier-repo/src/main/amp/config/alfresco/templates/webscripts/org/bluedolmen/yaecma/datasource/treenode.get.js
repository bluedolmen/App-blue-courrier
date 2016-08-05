///<import resource="classpath:/alfresco/extension/bluedolmen/yaecma/common/yaecma-env.js">
///<import resource="classpath:/alfresco/templates/org/bluedolmen/alfresco/extjs/actions/common.lib.js">
///<import resource="classpath:/alfresco/templates/org/bluedolmen/alfresco/extjs/actions/parseargs.lib.js">

(function() {

	const SORT_PROPERTY = 'cm:name';
	
	// PRIVATE
	var 
		treeNodeRef = null,
		treeNode = null,
		showFiles = false,
		showFolders = true,
		showHidden = false
	;
	
	// MAIN LOGIC
	
	Common.securedExec(function() {
		var parseArgs = new ParseArgs('parent', 'showFiles', 'showFolders', 'showHidden');
		treeNodeRef = parseArgs['parent'];
		treeNode = getTreeNode(treeNodeRef);
		showFiles = parseArgs['showFiles'] === 'true';
		showFolders = parseArgs['showFolders'] !== 'false';
		showHidden = parseArgs['showHidden'] === 'true';
		
		main();
	});
	
	function getTreeNode(treeNodeRef) {
		
		if (null == treeNodeRef || 'root' == treeNodeRef) {
			return Utils.Alfresco.getCompanyHome();
		} else if (Utils.Alfresco.isNodeRef(treeNodeRef)){
			return Common.getExistingNode(treeNodeRef);
		} else {
			// Try to solve as a path
			var 
				root = Utils.Alfresco.getCompanyHome(),
				matchingChildren = root.childrenByXPath(treeNodeRef)
			;
			
			if (1 == matchingChildren.length) return matchingChildren[0];
		}
		
		throw {
			code : 400,
			message : 'Cannot find any valid root-node from the provided reference \'' + treeNodeRef + '\''
		}
		
	}
	
	function main() {
		
		var children = getNodeChildren();
		
		//sortByTitle(children);
		var childrenDescription = getChildrenDescription(children);
		
		setModel(childrenDescription);
		
	}
	
	function getNodeChildren(node) {
		
		node = null != node ? node : treeNode;
		var
			query = Yaecma.Utils.buildFileFoldersLuceneQuery({
				showFiles : showFiles,
				showFolders : showFolders,
				showHidden : showHidden,
				parent : Utils.asString(node.nodeRef)
			}),
			
			children = search.query({
				query : query,
				sort : [
					{
						column : '@' + SORT_PROPERTY,
						ascending : true
					}
				]
			})
		;
		
		return children;
		
//		var scriptNodePage = node.childFileFolders(
//			showFiles, /* files */ 
//			showFolders, /* folders */
//			null, /* ignoreTypes */
//			0, /* skipOffset */
//			-1, /* maxItems */ 
//			0, /* requestTotalCountMax */ 
//			SORT_PROPERTY, /* sortProp */
//			true, /* sortAsc */ 
//			null /* queryExecutionId */
//		);
//		
//		return scriptNodePage.page;
		
	}
	
	function nodeHasChildren(node) {
		node = null != node ? node : treeNode;
		
		var
			query = Yaecma.Utils.buildFileFoldersLuceneQuery({
				showFiles : showFiles,
				showFolders : showFolders,
				showHidden : showHidden,
				parent : Utils.asString(node.nodeRef)
			}),
			
			oneChild = search.query({
				query : query,
				page : {
					maxItems : 1,
					skipCount : 0
				}
			})
		;
		
		return oneChild.length > 0;
		
//		
//		var child1 = node.childFileFolders(
//			showFiles, /* files */ 
//			showFolders, /* folders */
//			null, /* ignoreTypes */
//			0, /* skipOffset */
//			2, /* maxItems */ 
//			1, /* requestTotalCountMax */ 
//			SORT_PROPERTY, /* sortProp */
//			true, /* sortAsc */ 
//			null /* queryExecutionId */
//		);
//		
//		return child1.page.length > 0;
	}
	
	/**
	 * Get the node children description.
	 * 
	 * @param {ScriptNode[]} children the list of Alfresco node children
	 * 
	 * @return {Object[]} An array of child description
	 */
	function getChildrenDescription(children) {		
		return Utils.map( children, getChildDescription );
	}
	
	function getChildDescription(child) {
		
		return {
			type : child.typeShort,
			name : child.name,
			title : child.properties.title || child.name,
			ref : Utils.asString(child.nodeRef),
			path : getPath(),
			hasChildren : nodeHasChildren(child)
		};
		
		function getPath() {
			var
				displayPath = child.displayPath || '',
				pathParts = displayPath.split('/').slice(2).concat([child.name]),
				path = Utils.String.join(pathParts, '/')
			;
			
			return '/' + path;
		}
		
	}
	
	function setModel(childrenDescription) {
		
		var childrenCount = childrenDescription.length;
		
		model.startIndex = 1;
		model.totalChildren = childrenCount;
		model.itemCount = childrenCount;
		model.meta = {
			parentNodeRef : Utils.asString(treeNode.nodeRef)
		}
		model.children = childrenDescription;
		
	}
	
	function sortByTitle(array) {
		
		array = array || [];
		return array.sort(function(a,b) {
			
			var 
				aTitle = Utils.asString(a.title) || '',
				bTitle = Utils.asString(b.title) || ''
			;
			
			if (aTitle == bTitle) return 0;
			return aTitle < bTitle ? -1 : 1;
			
		});
		
	}

	
})();