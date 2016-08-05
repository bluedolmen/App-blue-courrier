package org.bluedolmen.alfresco.bluecourrier.bpmn;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import org.activiti.engine.runtime.ProcessInstance;
import org.activiti.engine.task.Task;
import org.activiti.engine.test.ActivitiTestCase;
import org.activiti.engine.test.Deployment;

public class SubprocessTest1 extends ActivitiTestCase {

	@Deployment
	public void testSubprocess() {
		
		Map<String, Object> variables = new HashMap<String, Object>(1);
		variables.put("serviceAndRoles", Arrays.asList(new String[]{"dircom|proc"}));
		ProcessInstance pi = runtimeService.startProcessInstanceByKey("simpleSubprocess", variables);

		Task task = taskService.createTaskQuery().singleResult();
		assertEquals("Delivering document", task.getName());

//		runtimeService.setVariable(task.getExecutionId(), "services", "dircom");

		taskService.complete(task.getId());
		assertEquals(0, runtimeService.createProcessInstanceQuery().count());
		
	}
}
