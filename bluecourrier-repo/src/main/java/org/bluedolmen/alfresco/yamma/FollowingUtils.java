package org.bluedolmen.alfresco.yamma;

import java.util.List;

import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.StoreRef;
import org.alfresco.service.cmr.search.QueryConsistency;
import org.alfresco.service.cmr.search.ResultSet;
import org.alfresco.service.cmr.search.SearchParameters;
import org.alfresco.service.cmr.search.SearchService;
import org.alfresco.service.namespace.NamespaceService;

public class FollowingUtils {

	private StoreRef storeRef;
	private SearchService searchService;
	private NamespaceService namespaceService;
	
	public List<NodeRef> queryFollowing(String userName) {
		
		final SearchParameters sp = new SearchParameters();
		
		sp.setLanguage(SearchService.LANGUAGE_FTS_ALFRESCO);
		
		sp.setQuery("=" + BlueCourrierModel.FOLLOWED_BY.toPrefixString(namespaceService).replace(":", "\\:") + ":\"" + userName + "\"");
		sp.addStore(this.storeRef);
		
		sp.setQueryConsistency(QueryConsistency.TRANSACTIONAL);
		
		final ResultSet result = searchService.query(sp);
		
		return result.getNodeRefs();
		
	}
	
	public void setStoreUrl(String storeUrl) {
		this.storeRef = new StoreRef(storeUrl);
	}
	
	public void setServiceRegistry(ServiceRegistry serviceRegistry) {
		this.searchService = serviceRegistry.getSearchService();
		this.namespaceService = serviceRegistry.getNamespaceService();
	}
	
	
}
