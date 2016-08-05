package org.bluedolmen.alfresco.bluecourrier.bpmn;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.activiti.engine.runtime.Execution;
import org.activiti.engine.runtime.ProcessInstance;
import org.activiti.engine.task.Task;
import org.activiti.engine.test.ActivitiTestCase;
import org.activiti.engine.test.Deployment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ActivitiTest2 extends ActivitiTestCase {
	
	  private static Logger logger = LoggerFactory.getLogger(ActivitiTest2.class);
	
	@Override
	protected void setUp() throws Exception {
		super.setUp();
		
	}
	  
	@Deployment
	public void testReceive() {

		// First run => only one service/role
		Map<String, Object> variables = new HashMap<String, Object>(1);
		variables.put("services", "dircom,diadmgen");
		runtimeService.startProcessInstanceByKey("receive", variables);
		
		List<ProcessInstance> processInstances = runtimeService.createProcessInstanceQuery().active().list();
		assertEquals(1, processInstances.size());
		
		ProcessInstance firstProcessInstance = processInstances.get(0);
		assertNotNull(firstProcessInstance);
//		assertTrue(firstProcessInstance.isSuspended());
		
		Execution execution = runtimeService.createExecutionQuery().processInstanceId(firstProcessInstance.getId()).activityId("Wait").singleResult();
		logger.info("Execution " + execution.getActivityId() + " " + execution.getId() + " " + execution.getParentId() + " " + execution.getProcessInstanceId());
		assertNotNull(execution);
		
		logger.info("Before");
		for (Execution execution_ : runtimeService.createExecutionQuery().processInstanceId(firstProcessInstance.getId()).list()) {
			logger.info("[E] " + execution_.getActivityId() + " - " + execution_.getId() + "/" + execution_.getProcessInstanceId());
		}

		runtimeService.signal(execution.getId(), variables);
		logger.info("After");
		for (ProcessInstance pi_ : runtimeService.createProcessInstanceQuery().list()) {
			logger.info("[PI] " + pi_.getActivityId() + " - " + pi_.getId());
		}
		for (Execution execution_ : runtimeService.createExecutionQuery().processInstanceId(firstProcessInstance.getId()).list()) {
			logger.info("[E] " + execution_.getActivityId() + " - " + execution_.getId() + "/" + execution_.getProcessInstanceId());
		}
		
		assertEquals(1, taskService.createTaskQuery().count());
		Task task = taskService.createTaskQuery().processInstanceId(firstProcessInstance.getId()).singleResult();
		assertEquals("Delivering", task.getTaskDefinitionKey());
//		assertEquals(0, runtimeService.createExecutionQuery().count());
		
		execution = runtimeService.createExecutionQuery().processInstanceId(firstProcessInstance.getId()).activityId("Wait").singleResult();
		logger.info("Execution " + execution.getActivityId() + " " + execution.getId() + " " + execution.getParentId() + " " + execution.getProcessInstanceId());
		runtimeService.signal(execution.getId(), variables);
		assertEquals(2, taskService.createTaskQuery().count());

		logger.info("Other run");
		for (ProcessInstance pi_ : runtimeService.createProcessInstanceQuery().list()) {
			logger.info("[PI] " + pi_.getActivityId() + " - " + pi_.getId());
		}
		for (Execution execution_ : runtimeService.createExecutionQuery().processInstanceId(firstProcessInstance.getId()).list()) {
			logger.info("[E] " + execution_.getActivityId() + " - " + execution_.getId() + "/" + execution_.getProcessInstanceId());
		}
		
		execution = runtimeService.createExecutionQuery().processInstanceId(firstProcessInstance.getId()).activityId("Wait").singleResult();
		logger.info("Execution " + execution.getActivityId() + " " + execution.getId() + " " + execution.getParentId() + " " + execution.getProcessInstanceId());
		runtimeService.signal(execution.getId(), variables);
		assertEquals(3, taskService.createTaskQuery().count());
		
		logger.info("Other run");
		for (ProcessInstance pi_ : runtimeService.createProcessInstanceQuery().list()) {
			logger.info("[PI] " + pi_.getActivityId() + " - " + pi_.getId());
		}
		for (Execution execution_ : runtimeService.createExecutionQuery().processInstanceId(firstProcessInstance.getId()).list()) {
			logger.info("[E] " + execution_.getActivityId() + " - " + execution_.getId() + "/" + execution_.getProcessInstanceId());
		}
		
		for (Task task_ : taskService.createTaskQuery().active().list()) {
			taskService.complete(task_.getId());
		}
		
		logger.info("After tasks completing");
		for (Execution execution_ : runtimeService.createExecutionQuery().processInstanceId(firstProcessInstance.getId()).list()) {
			logger.info("[E] " + execution_.getActivityId() + " - " + execution_.getId() + "/" + execution_.getProcessInstanceId());
		}
		
		execution = runtimeService.createExecutionQuery().processInstanceId(firstProcessInstance.getId()).activityId("Wait").singleResult();
		variables.put("services", "");
		runtimeService.signal(execution.getId(), variables);
		
		assertEquals(0, runtimeService.createProcessInstanceQuery().count());
		
	}

	
	@Deployment
	public void testEvent() {

		// First run => only one service/role
		Map<String, Object> variables = new HashMap<String, Object>(1);
		variables.put("serviceAndRoles", Arrays.asList(new String[]{"dircom|proc"}));
		runtimeService.startProcessInstanceByKey("receive", variables);
		
		List<ProcessInstance> processInstances = runtimeService.createProcessInstanceQuery().active().list();
		assertEquals(1, processInstances.size());
		
		ProcessInstance firstProcessInstance = processInstances.get(0);
		assertNotNull(firstProcessInstance);
//		assertTrue(firstProcessInstance.isSuspended());
		
		Execution execution = runtimeService.createExecutionQuery().processInstanceId(firstProcessInstance.getId()).activityId("Wait").singleResult();
		logger.info("Execution " + execution.getActivityId() + " " + execution.getId() + " " + execution.getParentId() + " " + execution.getProcessInstanceId());
		assertNotNull(execution);
		
		logger.info("Before");
		for (Execution execution_ : runtimeService.createExecutionQuery().processInstanceId(firstProcessInstance.getId()).list()) {
			logger.info("[E] " + execution_.getActivityId() + " - " + execution_.getId() + "/" + execution_.getProcessInstanceId());
		}

		runtimeService.signalEventReceived("New", execution.getId());
		logger.info("After");
		for (ProcessInstance pi_ : runtimeService.createProcessInstanceQuery().list()) {
			logger.info("[PI] " + pi_.getActivityId() + " - " + pi_.getId());
		}
		for (Execution execution_ : runtimeService.createExecutionQuery().processInstanceId(firstProcessInstance.getId()).list()) {
			logger.info("[E] " + execution_.getActivityId() + " - " + execution_.getId() + "/" + execution_.getProcessInstanceId());
		}
		
		
		assertEquals(1, taskService.createTaskQuery().count());
		Task task = taskService.createTaskQuery().processInstanceId(firstProcessInstance.getId()).singleResult();
		assertEquals("Delivering", task.getTaskDefinitionKey());
//		assertEquals(0, runtimeService.createExecutionQuery().count());
		
		execution = runtimeService.createExecutionQuery().processInstanceId(firstProcessInstance.getId()).activityId("Wait").singleResult();
		logger.info("Execution " + execution.getActivityId() + " " + execution.getId() + " " + execution.getParentId() + " " + execution.getProcessInstanceId());
		runtimeService.signalEventReceived("New", execution.getId());
		assertEquals(2, taskService.createTaskQuery().count());

		logger.info("Other run");
		for (ProcessInstance pi_ : runtimeService.createProcessInstanceQuery().list()) {
			logger.info("[PI] " + pi_.getActivityId() + " - " + pi_.getId());
		}
		for (Execution execution_ : runtimeService.createExecutionQuery().processInstanceId(firstProcessInstance.getId()).list()) {
			logger.info("[E] " + execution_.getActivityId() + " - " + execution_.getId() + "/" + execution_.getProcessInstanceId());
		}
		
		execution = runtimeService.createExecutionQuery().processInstanceId(firstProcessInstance.getId()).activityId("Wait").singleResult();
		logger.info("Execution " + execution.getActivityId() + " " + execution.getId() + " " + execution.getParentId() + " " + execution.getProcessInstanceId());
		runtimeService.signalEventReceived("New", execution.getId());
		assertEquals(3, taskService.createTaskQuery().count());
		
		logger.info("Other run");
		for (ProcessInstance pi_ : runtimeService.createProcessInstanceQuery().list()) {
			logger.info("[PI] " + pi_.getActivityId() + " - " + pi_.getId());
		}
		for (Execution execution_ : runtimeService.createExecutionQuery().processInstanceId(firstProcessInstance.getId()).list()) {
			logger.info("[E] " + execution_.getActivityId() + " - " + execution_.getId() + "/" + execution_.getProcessInstanceId());
		}
		
		for (Task task_ : taskService.createTaskQuery().active().list()) {
			taskService.complete(task_.getId());
		}
		
		logger.info("After tasks completing");
		for (Execution execution_ : runtimeService.createExecutionQuery().processInstanceId(firstProcessInstance.getId()).list()) {
			logger.info("[E] " + execution_.getActivityId() + " - " + execution_.getId() + "/" + execution_.getProcessInstanceId());
		}

		execution = runtimeService.createExecutionQuery().processInstanceId(firstProcessInstance.getId()).activityId("Wait").singleResult();
		runtimeService.signalEventReceived("Stop", execution.getId());
		
		assertEquals(0, runtimeService.createProcessInstanceQuery().count());
		
	}
	
	
}
