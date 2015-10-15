package org.bluedolmen.alfresco.yamma.cover;

import org.alfresco.service.ServiceRegistry;

public abstract class AbstractMailCoverGenerator implements MailCoverGenerator {

	protected void register() {
		mailCoverService.register(this);
	}
	
	private MailCoverService mailCoverService;
	
	public void setMailCoverService(MailCoverService mailCoverService) {
		this.mailCoverService = mailCoverService;
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
