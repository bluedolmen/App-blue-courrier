package org.bluedolmen.alfresco.bluecourrier.bpmn;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.activiti.engine.task.Task;
import org.activiti.engine.test.ActivitiTestCase;
import org.activiti.engine.test.Deployment;
import org.apache.log4j.BasicConfigurator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ActivitiTest1 extends ActivitiTestCase {
	
	  private static Logger logger = LoggerFactory.getLogger(ActivitiTest1.class);
	
	@Override
	protected void setUp() throws Exception {
		super.setUp();
		
//		BasicConfigurator.configure();
	}
	  
//	@Deployment
//	public void testMultiInstance() {
//
//		// First run => only one service/role
//		Map<String, Object> variables = new HashMap<String, Object>(1);
//		variables.put("serviceAndRoles", Arrays.asList(new String[]{"dircom|proc"}));
//		runtimeService.startProcessInstanceByKey("multiInstance", variables);
//
//		Task task = taskService.createTaskQuery().singleResult();
//		assertEquals("Delivering document", task.getName());
//
//		taskService.setVariable(task.getId(), "serviceAndRoles", Collections.emptyList());
//
//		taskService.complete(task.getId());
//		assertEquals(0, runtimeService.createProcessInstanceQuery().count());
//		
//
//		// Second run => added two other services
//		variables.put("serviceAndRoles", Arrays.asList(new String[]{"dircom|proc"}));
//		runtimeService.startProcessInstanceByKey("multiInstance", variables);
//
//		task = taskService.createTaskQuery().singleResult();
//		taskService.setVariable(task.getId(), "serviceAndRoles", Arrays.asList(new String[]{"diradmgen|proc","dirtest|inf"}));
//		taskService.complete(task.getId());
//		assertEquals(2, taskService.createTaskQuery().count());
//		
//		List<Task> taskList = taskService.createTaskQuery().list();
//		
//		task = taskList.get(0);
//		assertEquals("Delivering", task.getTaskDefinitionKey());
//		assertEquals("diradmgen|proc", taskService.getVariable(task.getId(), "serviceAndRole"));
//		taskService.setVariable(task.getId(), "serviceAndRoles", Arrays.asList(new String[]{"dirjur|inf","dirlog|ing"}));
//		taskService.complete(task.getId());
//		
////		assertEquals(3, taskService.createTaskQuery().count());
//		assertEquals(1, runtimeService.createProcessInstanceQuery().count());
//		
//		task = taskList.get(1);
//		assertEquals("Delivering", task.getTaskDefinitionKey());
//		assertEquals("dirtest|inf", taskService.getVariable(task.getId(), "serviceAndRole"));
//		taskService.setVariable(task.getId(), "serviceAndRoles", Collections.emptyList());
//		taskService.complete(task.getId());
//		
//		assertEquals(0, runtimeService.createProcessInstanceQuery().count());
//		
//	}
	
	@Deployment
	public void testMultiInstanceService() {
		

		// First run => only one service/role
		Map<String, Object> variables = new HashMap<String, Object>(1);
		
		variables.put("serviceAndRoles", Arrays.asList(new String[]{"dircom|proc"}));
		runtimeService.startProcessInstanceByKey("multiInstanceService", variables);

		Task task = taskService.createTaskQuery().singleResult();
		assertEquals("Delivering document", task.getName());

		taskService.setVariable(task.getId(), "serviceAndRoles", Collections.emptyList());

		taskService.complete(task.getId());
		assertEquals(0, runtimeService.createProcessInstanceQuery().count());
		

		// Second run => added two other services
		variables.put("serviceAndRoles", Arrays.asList(new String[]{"dircom|proc"}));
		runtimeService.startProcessInstanceByKey("multiInstanceService", variables);

		logger.info("PROCESS INSTANCE NUMBER: " + runtimeService.createProcessInstanceQuery().count());
		task = taskService.createTaskQuery().singleResult();
		taskService.setVariable(task.getId(), "serviceAndRoles", Arrays.asList(new String[]{"diradmgen|proc","dirtest|inf"}));

		taskService.complete(task.getId());
		List<Task> taskList = taskService.createTaskQuery().list();		
		assertEquals(2, taskService.createTaskQuery().count());
		logger.info("PROCESS INSTANCE NUMBER: " + runtimeService.createProcessInstanceQuery().count());		
		
		task = taskList.get(0);
		assertEquals("Delivering", task.getTaskDefinitionKey());
		assertEquals("diradmgen|proc", taskService.getVariable(task.getId(), "serviceAndRole"));
		taskService.setVariable(task.getId(), "serviceAndRoles", Arrays.asList(new String[]{"dirjur|inf","dirlog|inf"}));
		taskService.complete(task.getId());
		
		assertEquals(3, taskService.createTaskQuery().count());
		logger.info("PROCESS INSTANCE NUMBER: " + runtimeService.createProcessInstanceQuery().count());
		
//		assertEquals(2, runtimeService.createProcessInstanceQuery().count());
		
		task = taskList.get(1);
		assertEquals("Delivering", task.getTaskDefinitionKey());
		assertEquals("dirtest|inf", taskService.getVariable(task.getId(), "serviceAndRole"));
		taskService.setVariable(task.getId(), "serviceAndRoles", Collections.emptyList());
		taskService.complete(task.getId());
		
		assertEquals(2, taskService.createTaskQuery().count());
		logger.info("PROCESS INSTANCE NUMBER: " + runtimeService.createProcessInstanceQuery().count());
//		assertEquals(0, runtimeService.createProcessInstanceQuery().count());
		
		taskList = taskService.createTaskQuery().list();
		task = taskList.get(0);
		assertEquals("Delivering", task.getTaskDefinitionKey());
		assertEquals("dirjur|inf", taskService.getVariable(task.getId(), "serviceAndRole"));
		taskService.setVariable(task.getId(), "serviceAndRoles", Collections.emptyList());
		taskService.complete(task.getId());
		
		assertEquals(1, taskService.createTaskQuery().count());
		logger.info("PROCESS INSTANCE NUMBER: " + runtimeService.createProcessInstanceQuery().count());

		task = taskList.get(1);
		assertEquals("Delivering", task.getTaskDefinitionKey());
		assertEquals("dirlog|inf", taskService.getVariable(task.getId(), "serviceAndRole"));
		taskService.setVariable(task.getId(), "serviceAndRoles", Collections.emptyList());
		taskService.complete(task.getId());
		
		assertEquals(0, taskService.createTaskQuery().count());
		assertEquals(0, runtimeService.createProcessInstanceQuery().count());
		logger.info("PROCESS INSTANCE NUMBER: " + runtimeService.createProcessInstanceQuery().count());
	}
	
}
