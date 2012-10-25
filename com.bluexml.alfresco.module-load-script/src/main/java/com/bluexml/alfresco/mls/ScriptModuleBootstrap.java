/*
 * Copyright (C) 2011 fme AG
 * 
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.bluexml.alfresco.mls;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.alfresco.error.AlfrescoRuntimeException;
import org.alfresco.model.ContentModel;
import org.alfresco.repo.module.AbstractModuleComponent;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.repo.security.authentication.AuthenticationUtil.RunAsWork;
import org.alfresco.repo.transaction.RetryingTransactionHelper;
import org.alfresco.repo.transaction.RetryingTransactionHelper.RetryingTransactionCallback;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.repository.ScriptService;
import org.alfresco.service.cmr.repository.StoreRef;
import org.alfresco.service.cmr.search.SearchService;
import org.alfresco.service.cmr.security.AuthenticationService;
import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.service.namespace.NamespaceService;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;

/**
 * Implements a bootstrap bean that runs a list of scripts from the classpath
 * against the Alfresco Repository to allow bootstrap coded being coded in
 * javascript.
 * 
 * Initial work by Florian Maul (fme AG)
 * Porting to Module execution by Brice Pajot (bpajot@bluexml.com)
 */
public class ScriptModuleBootstrap extends AbstractModuleComponent {

	private static final Log logger = LogFactory.getLog(ScriptModuleBootstrap.class);

	private List<String> scriptResources;
	private PersonService personService;
	private AuthenticationService authenticationService;
	private NodeService nodeService;
	private ScriptService scriptService;
	private SearchService searchService;
	private NamespaceService namespaceService;
	private RetryingTransactionHelper retryingTransactionHelper;
	
	
	
	private String companyHomePath;
	private StoreRef storeRef;
	private String runAsUser = null;

	private final PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
	private final Map<String, Resource> registeredResources = new LinkedHashMap<String, Resource>();

	/**
	 * Init method that is called from Spring when the application context is
	 * initialized.
	 */
	@Override
	public void init() {

		processResources();
		super.init();
		
	}
	
	private void processResources() {
		
		final Map<String, Resource> resources = new HashMap<String, Resource>();
		
		// First extract resources to get them sorted
		for (final String locationPattern : scriptResources) {
			for (final Resource res : resolveLocations(locationPattern)) {
				final String scriptName = getScriptName(res);
				logger.debug("Found resource: " + scriptName);
				resources.put(scriptName, res);
			}
		}

		final List<String> sortedNames = new ArrayList<String>(resources.keySet());
		Collections.sort(sortedNames);
		
		for (final String resourceName : sortedNames) {
			registeredResources.put(resourceName, resources.get(resourceName));
		}
		
	}

	private Resource[] resolveLocations(final String locationPattern) {
		
		try {
			return resolver.getResources(locationPattern);
		} catch (final IOException e) {
			logger.info("No file found while resolving script location pattern '" + locationPattern + "'", e);
		}
		
		return new Resource[0];
	}

	private String getScriptName(final Resource res) {
		
		try {
			return res.getURI().toString();
		} catch (final IOException e) {
			throw new AlfrescoRuntimeException("Error reading script resource.", e);
		}

	}
	
	@Override
	protected void executeInternal() throws Throwable {
		
		for (final Map.Entry<String, Resource> entry : registeredResources.entrySet()) {
			logger.info("Running bootstrap script " + entry.getKey());
			executeScriptAsSystemUser(entry.getValue());
		}
		
	}	

	private void executeScriptAsSystemUser(final Resource res) {
		
		AuthenticationUtil.runAs(
			new RunAsWork<Void>() {
				@Override
				public final Void doWork() throws Exception {
					executeScriptInTransaction(res);
					return null;
				}
	
			}, 
			runAsUser != null ? runAsUser : AuthenticationUtil.getSystemUserName()
		);
		
	}

	private void executeScriptInTransaction(final Resource res) {
		
		retryingTransactionHelper.doInTransaction(
			new RetryingTransactionCallback<Void>() {
				@Override
				public Void execute() throws Throwable {
					executeScript(res);
					return null;
				}
			}, 
			false, 
			true
		);
		
	}

	private void executeScript(final Resource res) {

		// get the references we need to build the default scripting data-model
		final String userName = authenticationService.getCurrentUserName();
		final NodeRef personRef = personService.getPerson(userName);
		final NodeRef homeSpaceRef = (NodeRef) nodeService.getProperty(personRef, ContentModel.PROP_HOMEFOLDER);
		final NodeRef companyHomeRef = getCompanyHome();

		// the default scripting model provides access to well known objects and
		// searching facilities - it also provides basic
		// create/update/delete/copy/move services
		final Map<String, Object> model = scriptService.buildDefaultModel(
			personRef,
			companyHomeRef, 
			homeSpaceRef, 
			null, /* scriptRef */ 
			companyHomeRef, /* documentRef */ 
			companyHomeRef /* spaceRef */
		);

		// execute the script at the specified script location
		final ResourceScriptLocation scriptLocation = new ResourceScriptLocation(res);
		scriptService.executeScript(scriptLocation , model);
	}

	/**
	 * Gets the company home node
	 * 
	 * @return the company home node ref
	 */
	private NodeRef getCompanyHome() {

		final List<NodeRef> refs = searchService.selectNodes(
			nodeService.getRootNode(storeRef), 
			companyHomePath, 
			null,
			namespaceService, 
			false
		);
		
		if (refs.size() != 1) {
			throw new IllegalStateException("Invalid company home path: " + companyHomePath + " - found: " + refs.size());
		}
		
		return refs.get(0);
	}

	/*
	 * Spring IoC material
	 */
	
	public void setScriptResources(List<String> scriptResources) {
		this.scriptResources = scriptResources;
	}

	public void setAuthenticationService(
			AuthenticationService authenticationService) {
		this.authenticationService = authenticationService;
	}

	public void setNamespaceService(NamespaceService namespaceService) {
		this.namespaceService = namespaceService;
	}

	public void setPersonService(PersonService personService) {
		this.personService = personService;
	}

	public void setNodeService(NodeService nodeService) {
		this.nodeService = nodeService;
	}

	public void setScriptService(ScriptService scriptService) {
		this.scriptService = scriptService;
	}

	public void setSearchService(SearchService searchService) {
		this.searchService = searchService;
	}

	public void setRetryingTransactionHelper(RetryingTransactionHelper retryingTransactionHelper) {
		this.retryingTransactionHelper = retryingTransactionHelper;
	}
	
	public void setStoreUrl(String storeUrl) {
		this.storeRef = new StoreRef(storeUrl);
	}

	public void setCompanyHomePath(String companyHomePath) {
		this.companyHomePath = companyHomePath;
	}

	public void setRunAsUser(String runAsUser) {
		this.runAsUser = runAsUser;
	}


}
