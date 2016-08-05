package org.bluedolmen.alfresco.yamma;

import java.util.List;

import org.alfresco.service.cmr.repository.AssociationRef;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;

public final class YammaStateRouter extends StateRouter {

	
	public void init() {
		this.statePropertyQName = BlueCourrierModel.PROP_STATUSABLE_STATE;
		this.targetContainerType = BlueCourrierModel.ASPECT_TRAY;
		this.stateTypeQName = BlueCourrierModel.ASPECT_STATUSABLE;
		
		super.init();
	}
	
	protected NodeRef getActualDocument(NodeRef documentNodeRef) {
		return getDocumentContainer(documentNodeRef);
	}
	
	private NodeRef getDocumentContainer(NodeRef documentNodeRef) {
		
		final NodeService nodeService = getNodeService();
		final List<AssociationRef> associationRefs = nodeService.getSourceAssocs(documentNodeRef, BlueCourrierModel.ASSOC_DOCUMENT_REFERENCE);
		
		if (associationRefs.isEmpty()) {
			throw new IllegalStateException(
				String.format("Cannot find a valid container for document with nodeRef='%s'", documentNodeRef)
			);
		}
		
		return associationRefs.get(0).getSourceRef();
	}
	
	
}
