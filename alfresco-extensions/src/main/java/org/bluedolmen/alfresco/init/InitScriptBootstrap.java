package org.bluedolmen.alfresco.init;

import java.util.Collections;
import java.util.List;

import org.bluedolmen.alfresco.webscripts.ExtraAuthenticatedDeclarativeWebscript.ExtraAuthenticatedDelegate;
import org.springframework.beans.factory.InitializingBean;

public class InitScriptBootstrap implements InitializingBean {
	
	private InitRegistry initRegistry;
	private List<String> classpathResources = Collections.emptyList();
	private ExtraAuthenticatedDelegate extraAuthenticatedDelegate;

	@Override
	public void afterPropertiesSet() throws Exception {
		initRegistry.registerInitDefinitions(this);
	}
	
	public void setInitScripts(List<String> classpathResources) {
		this.classpathResources = classpathResources;
	}
	
	public void setInitScript(String classpathResource) {
		this.setInitScripts(Collections.singletonList(classpathResource));
	}
	
	public void setInitRegistry(InitRegistry initRegistry) {
		this.initRegistry = initRegistry;
	}

	public void setExtraAuthenticatedDelegate(ExtraAuthenticatedDelegate extraAuthenticatedDelegate) {
		this.extraAuthenticatedDelegate = extraAuthenticatedDelegate;
	}
	
	ExtraAuthenticatedDelegate getExtraAuthenticatedDelegate() {
		return this.extraAuthenticatedDelegate;
	}

	List<String> getClasspathResources() {
		return this.classpathResources;
	}
	
}
