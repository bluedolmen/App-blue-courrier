package org.bluedolmen.repo.workflow;

import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.Properties;

import org.alfresco.repo.workflow.WorkflowDeployer;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.bluedolmen.alfresco.app.ConfigService;
import org.springframework.core.io.ClassPathResource;

public class VersionAwareWorkflowDeployer extends org.alfresco.repo.workflow.WorkflowDeployer {

	private static final String CONFIG_CONTEXT = "bluedolmen"; // Use the generic config context
	public static final String VERSION = "version";
	
	private ConfigService configService;
	private static final Log logger = LogFactory.getLog(VersionAwareWorkflowDeployer.class);
	
	@Override
	public void setWorkflowDefinitions(List<Properties> workflowDefinitions) {
		
		for (final Properties workflowDefinition : workflowDefinitions) {
			setRedeployIfNewer(workflowDefinition);
		}
		
		super.setWorkflowDefinitions(workflowDefinitions);
		
	}
	
	private void setRedeployIfNewer(Properties workflowDefinition) {
		
		final String processId = getProcessId(workflowDefinition);
		if (null == processId) return; // If we cannot get a valid process-id, then omit any further operation, that may mean an error will occur

		final String versionConfigId = "workflows." + processId.replaceAll("\\.", "_") + ".version"; 
		final String currentVersion = (String) configService.getValue(CONFIG_CONTEXT, versionConfigId);
		
		if (logger.isDebugEnabled()) {
			logger.debug(String.format("Checking if process '%s' with version '%s' has a newer version.", processId, currentVersion));
		}
		
		final String version = workflowDefinition.getProperty(VERSION, "1.0");
		if (StringUtils.isNotEmpty(currentVersion) && versionCompare(version, currentVersion) <= 0) return;
		
		if (logger.isDebugEnabled()) {
			logger.debug(String.format("Process '%s' with version '%s' defines a newer version '%s', redeploying automatically...", processId, currentVersion, version));
		}
		workflowDefinition.setProperty(WorkflowDeployer.REDEPLOY, "true");
		
		final String deployedOnConfigId = "workflows." + processId.replaceAll("\\.", "_") + ".deployedOn";
		configService.setValue(CONFIG_CONTEXT, versionConfigId, version);
		configService.setValue(CONFIG_CONTEXT, deployedOnConfigId, new Date());
		
	}
	
	
	private String getProcessId(Properties workflowDefinition) {
		
		final String engineId = workflowDefinition.getProperty(WorkflowDeployer.ENGINE_ID);
		final String location = workflowDefinition.getProperty(WorkflowDeployer.LOCATION);
		final String mimetype = workflowDefinition.getProperty(WorkflowDeployer.MIMETYPE);
		
        if (location == null || location.length() == 0) {
            return null;
        }
        
        final ClassPathResource workflowResource = new ClassPathResource(location);
		
		try {
			return WorkflowServiceHelper.getProcessId(engineId, workflowResource.getInputStream(), mimetype);
		} catch (IOException e) {
			return null;
		}
		
	}
	
	public static Integer versionCompare(String str1, String str2) {
		
	    final String[] vals1 = str1.split("\\.");
	    final String[] vals2 = str2.split("\\.");
	    int i = 0;
	    
	    // set index to first non-equal ordinal or length of shortest version string
	    while (i < vals1.length && i < vals2.length && vals1[i].equals(vals2[i]))  {
	      i++;
	    }
	    
	    // compare first non-equal ordinal number
	    if (i < vals1.length && i < vals2.length)  {
	        int diff = Integer.valueOf(vals1[i]).compareTo(Integer.valueOf(vals2[i]));
	        return Integer.signum(diff);
	    }
	    else {
		    // the strings are equal or one string is a substring of the other
		    // e.g. "1.2.3" = "1.2.3" or "1.2.3" < "1.2.3.4"
	        return Integer.signum(vals1.length - vals2.length);
	    }
	}
	
	public void setConfigService(ConfigService configService) {
		this.configService = configService;
	}
	
}
