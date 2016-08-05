package org.bluedolmen.alfresco.yamma.cover;

import org.alfresco.repo.content.MimetypeMap;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.repository.ContentWriter;
import org.alfresco.service.cmr.repository.NodeRef;
import org.bluedolmen.alfresco.pdf.cover.CoverProvider;

public abstract class AbstractMailCoverGenerator implements MailCoverGenerator, CoverProvider {

	protected void register() {
		mailCoverService.register(this);
	}
	
	private MailCoverService mailCoverService;
	
	public void setMailCoverService(MailCoverService mailCoverService) {
		this.mailCoverService = mailCoverService;
	}

	@Override
	public void generatePdfCover(NodeRef nodeRef, ContentWriter writer) throws Exception {
		
		generate(nodeRef, writer, MimetypeMap.MIMETYPE_PDF);
		
	}
	
	// IoC
	
	private ServiceRegistry serviceRegistry;
	
	public void setServiceRegistry(ServiceRegistry serviceRegistry) {
		this.serviceRegistry = serviceRegistry;
	}
	
	public ServiceRegistry getServiceRegistry() {
		return serviceRegistry;
	}
	
}
