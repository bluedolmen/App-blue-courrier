package org.bluedolmen.alfresco.yamma.wf;

import org.activiti.engine.RuntimeService;
import org.activiti.engine.delegate.DelegateExecution;
import org.activiti.engine.delegate.JavaDelegate;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.poi.xwpf.converter.core.utils.StringUtils;

public class PerformDeliveryDelegate implements JavaDelegate {
	
	private static final String SERVICE_AND_ROLE_VARIABLE_NAME = "serviceAndRole";
	private static final Log logger = LogFactory.getLog(PerformDeliveryDelegate.class);

	@Override
	public void execute(DelegateExecution execution) throws Exception {

		final String serviceAndRole = (String) execution.getVariable(SERVICE_AND_ROLE_VARIABLE_NAME);
		if (StringUtils.isEmpty(serviceAndRole)) {
			if (logger.isInfoEnabled()) {
				logger.info("Received empty serviceAndRole, ignoring.");
			}
			return;
		}
		
		final RuntimeService runtimeService = execution.getEngineServices().getRuntimeService();
		IncomingWorkflowHelper.addNewServiceRole(runtimeService, execution.getProcessInstanceId(), serviceAndRole);
		
	}
	
}
