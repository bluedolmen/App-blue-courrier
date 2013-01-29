package com.bluexml.alfresco.reference;

import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.repo.security.authentication.AuthenticationUtil.RunAsWork;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.namespace.QName;

import com.bluexml.alfresco.app.GlobalConfig;

public final class ConfigIncrementalIdProvider extends AbstractReferenceProvider implements IncrementalIdProvider<Integer> {

	private static final Integer INITIAL_VALUE = 1;
	private static final String ID_PROPERTY_PATH = "yamma.idprovider.incremental-id";
	
	
	public String getId() {
		
		return "incremental-id";
		
	}
	
	public String getReference(NodeRef nodeRef, Object context) {
		
		boolean getByType = false;
		if (context instanceof String) {
			getByType = ((String) context).equals("byType");
		}

		final Integer value = getByType ?
			getTypeNext(nodeRef) :
			getNext()
		;
		
		return value.toString();
		
	}
	
	public Integer getTypeNext(NodeRef nodeRef) {
		
		final String propertyPath = getTypePropertyPath(nodeRef);
		return getNextId(propertyPath);
		
	}
	
	private String getTypePropertyPath(NodeRef nodeRef) {
		
		final QName typeQName = nodeService.getType(nodeRef);
		final String propertyPath = ID_PROPERTY_PATH + '-' + typeQName.getLocalName();
		
		return propertyPath;
		
	}
	
	public Integer getNext() {
		
		return getNextId(ID_PROPERTY_PATH);
		
	}
	
	public void reset() {
		
		reset(ID_PROPERTY_PATH);
		
	}
	
	public void resetType(NodeRef nodeRef) {
		
		final String propertyPath = getTypePropertyPath(nodeRef);
		reset(propertyPath);
		
	}
	
	public void resetType(String typeLocalName) {
		
		final String propertyPath = ID_PROPERTY_PATH + '-' + typeLocalName;
		reset(propertyPath);
		
	}
	
	
	private final void reset(final String propertyPath) {
		
		if (! AuthenticationUtil.getAdminUserName().equals(AuthenticationUtil.getRunAsUser()) ) {
			throw new IllegalAccessError("Only the admin user is authorized to perform a reset of the counter");
		}
		
		AuthenticationUtil.runAs(
				
				new RunAsWork<Void>() {
					
					public Void doWork() throws Exception {
						
						globalConfig.setValue(ID_PROPERTY_PATH, INITIAL_VALUE);
						return null;
						
					}
			
				},
				
				AuthenticationUtil.getSystemUserName()
				
			);
		
	}
	
	
	private final Integer getNextId(final String propertyPath) {
		
		return AuthenticationUtil.runAs(
				
			new RunAsWork<Integer>() {
				
				public Integer doWork() throws Exception {
					
					Integer value = (Integer) globalConfig.getValue(propertyPath);
					if (null == value) {
						value = INITIAL_VALUE;
					}
					
					globalConfig.setValue(ID_PROPERTY_PATH, value + 1);
					return value;
					
				}
		
			},
			
			AuthenticationUtil.getSystemUserName()
			
		);
		
	}
		
	/*
	 * Spring IoC/DI material
	 */
	
	private NodeService nodeService;
	private GlobalConfig globalConfig;
	
	public void setGlobalConfig(GlobalConfig globalConfig) {
		this.globalConfig = globalConfig;
	}
	
	public void setNodeService(NodeService nodeService) {
		this.nodeService = nodeService;
	}


}
