package org.bluedolmen.alfresco.resources;

import java.util.List;

import org.alfresco.repo.model.Repository;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.repository.StoreRef;
import org.alfresco.service.cmr.search.SearchService;
import org.alfresco.service.namespace.NamespaceService;

/**
 * This is obsoleted since Alfresco now provides a similar service ({@link Repository}
 * @author bpajot
 *
 */
public final class RepositoryHelper {
	
	private String companyHomePath;
	private StoreRef storeRef;
	private SearchService searchService;
	private NamespaceService namespaceService;
	private NodeService nodeService;
	
	private NodeRef companyHomeNodeRef = null;
	
	public List<NodeRef> getResourcesByXpath(String xpathLocation) {
		return searchService.selectNodes(getCompanyHome(), xpathLocation, null, namespaceService, false);
	}
	
	/**
	 * Gets the company home node
	 * 
	 * @return the company home node ref
	 */
	public NodeRef getCompanyHome() {
		
		if (null == companyHomeNodeRef) {
			
			final List<NodeRef> refs = searchService.selectNodes(
				nodeService.getRootNode(storeRef), 
				companyHomePath, 
				null,
				namespaceService, 
				false
			);
			
			if (refs.size() != 1) {
				throw new IllegalStateException("Invalid company home path: " + companyHomePath + " - found: " + refs.size());
			}
			
			companyHomeNodeRef = refs.get(0);
			
		}
		
		return companyHomeNodeRef;

	}
	
	public void setNodeService(NodeService nodeService) {
		this.nodeService = nodeService;
	}

	public void setSearchService(SearchService searchService) {
		this.searchService = searchService;
	}	
	
	public void setNamespaceService(NamespaceService namespaceService) {
		this.namespaceService = namespaceService;
	}
	
	public void setStoreUrl(String storeUrl) {
		this.storeRef = new StoreRef(storeUrl);
	}

	public void setCompanyHomePath(String companyHomePath) {
		this.companyHomePath = companyHomePath;
	}
	
    

}
