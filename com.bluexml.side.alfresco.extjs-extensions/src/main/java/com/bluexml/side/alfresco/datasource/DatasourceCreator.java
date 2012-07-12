package com.bluexml.side.alfresco.datasource;

import java.util.HashMap;
import java.util.List;

import org.alfresco.model.ContentModel;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.site.SiteInfo;
import org.alfresco.service.cmr.site.SiteService;
import org.apache.log4j.Logger;

public final class DatasourceCreator {
	
	private static final Logger logger = Logger.getLogger(DatasourceCreator.class);
	
	public static final class DataListItem extends HashMap<String, String> {

		private static final long serialVersionUID = -2032595634029451515L;
		
	}

	public void createDatasource(String datasourceName, List<DataListItem> values, String siteName) {
		
		final NodeRef dataListsContainerNodeRef = getDataListsContainer(siteName);
		if (null == dataListsContainerNodeRef) {
			final String message = String.format("Cannot get the dataLists container for site '%s'. Lists will not be initialized as epxected.", siteName); 
			logger.warn(message);
			return;
		}
		
	}
	
	private NodeRef getDataListsContainer(String siteName) {
		final SiteInfo siteInfo = siteService.getSite(siteName);
		final NodeRef siteNodeRef = siteInfo.getNodeRef();
		
		return nodeService.getChildByName(siteNodeRef, ContentModel.ASSOC_CHILDREN, "dataLists");		
	}
	
	// Spring/IoC material
	
	private NodeService nodeService;
	private SiteService siteService;
	
	public void setNodeService(NodeService nodeService) {
		this.nodeService = nodeService;
	}
	
	public void setSiteService(SiteService siteService) {
		this.siteService = siteService;
	}
	
	
}
