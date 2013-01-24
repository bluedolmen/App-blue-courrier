package com.bluexml.alfresco.pdf;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.List;

import org.alfresco.model.ContentModel;
import org.alfresco.repo.action.executer.TransformActionExecuter;
import org.alfresco.repo.content.MimetypeMap;
import org.alfresco.service.cmr.model.FileFolderService;
import org.alfresco.service.cmr.repository.ContentData;
import org.alfresco.service.cmr.repository.ContentIOException;
import org.alfresco.service.cmr.repository.ContentReader;
import org.alfresco.service.cmr.repository.ContentService;
import org.alfresco.service.cmr.repository.ContentWriter;
import org.alfresco.service.cmr.repository.CopyService;
import org.alfresco.service.cmr.repository.MimetypeService;
import org.alfresco.service.cmr.repository.NoTransformerException;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.namespace.QName;

public final class MergerUtils {
	
	private NodeService nodeService;
	private FileFolderService fileFolderService;
	private ContentService contentService;
	private MimetypeService mimetypeService;
	private CopyService copyService;
	
	
	/**
	 * Returns a list of nodes (as {@link NodeRef}) which content is PDF.
	 * If one of the input file is not in pdf form, then a transformation is
	 * applied, unless the parameter transform is set to false;
	 * 
	 * @param sources the list of input files
	 * @param transform whether a transformation will be applied to sources
	 * 
	 * @return a list of {@link NodeRef} which nodes are all pdf-s
	 */
	public List<NodeRef> getPdfNodeList(Collection<NodeRef> sources, boolean transform) throws NoTransformerException, ContentIOException
	{
		
		final List<NodeRef> checkedList = new ArrayList<NodeRef>();
		for (final NodeRef source : sources) {
			
			NodeRef pdfNode = getPdfNode(source, transform);
			checkedList.add(pdfNode);
			
		}
	
		return checkedList;
		
		
	}
	
	public NodeRef getPdfNode(NodeRef source) throws NoTransformerException, ContentIOException {
		return getPdfNode(source, true);
	}
	
	public NodeRef getPdfNode(NodeRef source, boolean transform) throws NoTransformerException, ContentIOException {
		
		final String mimetype = getMimetype(source);
		if (MimetypeMap.MIMETYPE_PDF.equals(mimetype)) {
			return source; 
		}
			
		if (!transform) {
			final String message = String.format(
					"The list of files should only contain pdf node files, the file with nodeRef '%s' has mimetype '%s'",
					source,
					mimetype
				);
			throw new IllegalArgumentException(message);					
		}
		
		final NodeRef destination = nodeService.getPrimaryParent(source).getParentRef();
		final NodeRef transformedNode = getOrTransformToPdf(source, destination, false);
		
		return transformedNode;
	}
	
    private NodeRef getOrTransformToPdf(NodeRef source, NodeRef destination, boolean forceOverriding) 
    		throws NoTransformerException, ContentIOException
    {
    	
        // get the content reader
        final ContentReader reader = contentService.getReader(source, ContentModel.PROP_CONTENT);
        if (null == reader) return null; // no content
        
        // Copy the content node to a new node
        final String sourceName = (String) nodeService.getProperty(source, ContentModel.PROP_NAME);
        final String copyName = TransformActionExecuter.transformName(mimetypeService, sourceName, MimetypeMap.MIMETYPE_PDF, true);
        
        final NodeRef existingFile = fileFolderService.searchSimple(destination, copyName); 
        if ( existingFile != null) {
        	
        	if (!forceOverriding) {
        		
            	// compare creation/modification dates
        		final Date sourceModificationDate = (Date) nodeService.getProperty(source, ContentModel.PROP_MODIFIED);
        		final Date existingFileCreationDate = (Date) nodeService.getProperty(existingFile, ContentModel.PROP_CREATED);
        		
        		if (
        			sourceModificationDate != null && 
        			existingFileCreationDate != null &&
        			sourceModificationDate.compareTo(existingFileCreationDate) <= 0
        		) {
        				return existingFile;
        		}
        		
        	}
        	
    		nodeService.removeChild(destination, existingFile);
        	
        }
        
        final NodeRef copyNodeRef = copyService.copy(
    		source, 
    		destination,
            ContentModel.ASSOC_CONTAINS,
            QName.createQName(ContentModel.PROP_CONTENT.getNamespaceURI(), QName.createValidLocalName(copyName)),
            false
        );
        
        // modify the name of the copy to reflect the new mimetype
        nodeService.setProperty(copyNodeRef, ContentModel.PROP_NAME, copyName);
        
        // get the writer and set it up
        final ContentWriter writer = contentService.getWriter(copyNodeRef, ContentModel.PROP_CONTENT, true);
        writer.setMimetype(MimetypeMap.MIMETYPE_PDF); // new mimetype
        writer.setEncoding(reader.getEncoding()); // original encoding
        
        if (!contentService.isTransformable(reader, writer)) {
        	// Remove the already made copy
        	nodeService.removeChild(destination, copyNodeRef);
        	return null;
        }
        		
        contentService.transform(reader, writer);
        return copyNodeRef;
    }
	
	
    private String getMimetype(NodeRef nodeRef) {
        final ContentData content = (ContentData) nodeService.getProperty(nodeRef, ContentModel.PROP_CONTENT);
        if (content != null) return content.getMimetype();
        
        return null;
    }	
	
	/*
	 * Spring IoC/DI material
	 */
	
	public void setNodeService(NodeService nodeService) {
		this.nodeService = nodeService;
	}

	public void setContentService(ContentService contentService) {
		this.contentService = contentService;
	}
	
	public void setMimetypeService(MimetypeService mimetypeService) {
		this.mimetypeService = mimetypeService;
	}
	
	public void setCopyService(CopyService copyService) {
		this.copyService = copyService;
	}
	
	public void setFileFolderService(FileFolderService fileFolderService) {
		this.fileFolderService = fileFolderService;
	}

}
