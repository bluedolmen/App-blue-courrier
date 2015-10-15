package org.bluedolmen.alfresco.reference;

import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.repo.security.authentication.AuthenticationUtil.RunAsWork;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.security.AuthorityService;
import org.alfresco.service.namespace.QName;
import org.bluedolmen.alfresco.app.GlobalConfig;

public final class ConfigIncrementalIdProvider extends AbstractReferenceProvider implements ScriptableIncrementalIdProvider<Integer> {

	private static final Integer INITIAL_VALUE = 1;
	private static final String ID_PROPERTY_PATH = "bluecourrier.idprovider.incremental-id";
	
	
	public String getId() {
		
		return "incremental-id";
		
	}
	
	public String getReference(NodeRef nodeRef, Object context) {
		
		final QName typeQName = getType(nodeRef, context);
		
		final Integer value = null != typeQName ?
			getTypeNext(typeQName) :
			getNext()
		;
		
		return value.toString();
		
	}
	
	private QName getType(NodeRef nodeRef, Object context) {
		
		final boolean byType = ((context instanceof String) && "byType".equals((String) context) ); 
		QName typeQName = null;
		
		if (null == nodeRef) {
			
			if ((context instanceof QName)) {
				typeQName = (QName) context;
			} else if (byType) {
				throw new IllegalArgumentException("The 'byType' option is only available when a valid NodeRef is provided (non-null)");
			} else {
				return null;
			}
			
		}

		if (byType) {
			typeQName = nodeService.getType(nodeRef);
		}
		
		return typeQName;
		
	}
	
	public Integer getTypeNext(QName typeQName) {
		
		final String propertyPath = getTypePropertyPath(typeQName);
		return getNextId(propertyPath);
		
	}
	
	private String getTypePropertyPath(QName typeQName) {
		
		final String propertyPath = ID_PROPERTY_PATH + '-' + typeQName.getLocalName();
		return propertyPath;
		
	}
	
	/*
	 * Methods used when exposed in Rhino
	 */
	
	public Integer getNext() {
		
		return getNextId(ID_PROPERTY_PATH);
		
	}
	
	public Integer getTypeNext(String typeLocalName) {
		
		final String propertyPath = ID_PROPERTY_PATH + '-' + typeLocalName;
		return getNextId(propertyPath);
		
	}
	
	
	public void reset() {
		
		reset(ID_PROPERTY_PATH);
		
	}
	
	public void resetType(QName typeQName) {
		
		final String propertyPath = getTypePropertyPath(typeQName);
		reset(propertyPath);
		
	}
	
	public void resetType(String typeLocalName) {
		
		final String propertyPath = ID_PROPERTY_PATH + '-' + typeLocalName;
		reset(propertyPath);
		
	}

	
	private final void reset(final String propertyPath) {
		
		final String currentUserName = AuthenticationUtil.getRunAsUser();
		
		if (!AuthenticationUtil.isRunAsUserTheSystemUser() && !authorityService.isAdminAuthority(currentUserName)) {
			throw new IllegalAccessError("Only an admin user is authorized to perform a reset of the counter");
		}
		
		AuthenticationUtil.runAs(
				
			new RunAsWork<Void>() {
				
				public Void doWork() throws Exception {
					
					globalConfig.setValue(propertyPath, INITIAL_VALUE);
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
					
					final Integer value = getCurrentValue();
					globalConfig.setValue(propertyPath, value + 1);
					return value;
					
				}
				
				private Integer getCurrentValue() {
					
					final Integer value = (Integer) globalConfig.getValue(propertyPath);
					return (null == value) ? INITIAL_VALUE : value;
					
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
	private AuthorityService authorityService;
	
	public void setGlobalConfig(GlobalConfig globalConfig) {
		this.globalConfig = globalConfig;
	}
	
	public void setNodeService(NodeService nodeService) {
		this.nodeService = nodeService;
	}

	public void setAuthorityService(AuthorityService authAuthorityService) {
		this.authorityService = authAuthorityService;
	}

}
