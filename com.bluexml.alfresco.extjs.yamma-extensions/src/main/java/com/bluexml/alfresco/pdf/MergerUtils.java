package com.bluexml.alfresco.pdf;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.alfresco.model.ContentModel;
import org.alfresco.repo.content.MimetypeMap;
import org.alfresco.repo.content.transform.RuntimeExecutableContentTransformerOptions;
import org.alfresco.service.cmr.repository.ContentData;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.repository.TransformationOptions;
import org.alfresco.service.cmr.thumbnail.ThumbnailService;

public final class MergerUtils {
	
	private ThumbnailService thumbnailService;
	
	private NodeService nodeService;
	
	
	/**
	 * Returns a list of nodes (as {@link NodeRef}) which content is PDF.
	 * If one of the input file is not in pdf form, then a transformation is
	 * applied, unless the parameter transform is set to false;
	 * 
	 * @param sources the list of input files
	 * 
	 * @return a list of {@link NodeRef} which nodes are all pdf-s
	 */
	public List<NodeRef> getPdfNodeList(Collection<NodeRef> sources) {
		
		final List<NodeRef> checkedList = new ArrayList<NodeRef>();
		for (final NodeRef source : sources) {
			
			final NodeRef pdfNode = getPdfNode(source);
			checkedList.add(pdfNode);
			
		}
	
		return checkedList;
		
	}
	
	public NodeRef getPdfNode(NodeRef source) {
		
		final String mimetype = getMimetype(source);
		if (MimetypeMap.MIMETYPE_PDF.equals(mimetype)) {
			return source; 
		}
			
    	NodeRef pdfThumbnail = thumbnailService.getThumbnailByName(source, ContentModel.PROP_CONTENT_PROPERTY_NAME, "pdfpreview"); 
    	
    	if (null == pdfThumbnail) {
            final TransformationOptions options = new RuntimeExecutableContentTransformerOptions();
            options.setSourceNodeRef(source);
            
        	pdfThumbnail = thumbnailService.createThumbnail(source, ContentModel.PROP_CONTENT, MimetypeMap.MIMETYPE_PDF, options, "pdfpreview");
    	}
    	
    	return pdfThumbnail;
    	
	}	    	
	
    private String getMimetype(NodeRef nodeRef) {
        final ContentData content = (ContentData) nodeService.getProperty(nodeRef, ContentModel.PROP_CONTENT);
        if (content != null) return content.getMimetype();
        
        return null;
    }	
	
	/*
	 * Spring IoC/DI material
	 */
	
    public void setThumbnailService(ThumbnailService thumbnailService) {
    	this.thumbnailService = thumbnailService;
    }
    
	public void setNodeService(NodeService nodeService) {
		this.nodeService = nodeService;
	}

}
