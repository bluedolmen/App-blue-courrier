package org.bluedolmen.alfresco.xdocreport;

import java.util.Map;

import org.alfresco.repo.admin.SysAdminParams;
import org.alfresco.repo.jscript.ClasspathScriptLocation;
import org.alfresco.repo.jscript.ValueConverter;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.ScriptLocation;
import org.alfresco.service.cmr.repository.ScriptService;
import org.alfresco.util.UrlUtil;

public class XDocReportJSGenerator extends AbstractXDocReportGenerator {

	private ScriptService scriptService;
	private SysAdminParams sysAdminParams;
	
	private String valuesScriptLocation;
	private final ValueConverter valueConverter  = new ValueConverter(); 
	
	
	protected Worker createWorker(NodeRef nodeRef) {
		return new JSWorker(nodeRef);
	}

	protected class JSWorker extends Worker {
		
		public JSWorker(NodeRef nodeRef) {
			super(nodeRef);
		}
		
		
		@SuppressWarnings("unchecked")
		protected Map<String, Object> getValues() {
			
			final Map<String, Object> model = scriptService.buildDefaultModel(null, null, null, null, nodeRef, null);
			final ScriptLocation scriptLocation = new ClasspathScriptLocation(valuesScriptLocation);
			
			model.put("metadata", getMetadata());
			model.put("shareUrl", UrlUtil.getShareUrl(sysAdminParams));
			model.put("alfrescoUrl", UrlUtil.getAlfrescoUrl(sysAdminParams));
			
			Object result = scriptService.executeScript(scriptLocation, model);
			result = valueConverter.convertValueForJava(result);
			
			if (! (result instanceof Map)) {
				throw new IllegalStateException("The values script is expected to return a value as a Map");
			}
			
			return (Map<String, Object>) result;
			
		}
		
	}

	// IoC
	
	public void setValuesScriptLocation(String valuesScriptLocation) {
		this.valuesScriptLocation = valuesScriptLocation;
	}
	
	public void setServiceRegistry(ServiceRegistry serviceRegistry) {

		super.setServiceRegistry(serviceRegistry);
		if (null == serviceRegistry) return;
		
		this.setScriptService(serviceRegistry.getScriptService());
		
	}
	
	public void setScriptService(ScriptService scriptService) {
		this.scriptService = scriptService;
	}
	
	public void setSysAdminParams(SysAdminParams sysAdminParams) {
		this.sysAdminParams = sysAdminParams;
	}
	
}
