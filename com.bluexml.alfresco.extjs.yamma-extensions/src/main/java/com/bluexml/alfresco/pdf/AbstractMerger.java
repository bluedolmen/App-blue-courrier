package com.bluexml.alfresco.pdf;

import java.io.OutputStream;
import java.util.Collection;

import org.alfresco.service.cmr.repository.NodeRef;

public abstract class AbstractMerger implements Merger {
	
	private MergerConfig config;
	private MergerUtils mergerUtils;

	
	public AbstractMerger() {
		this.setConfig(null);
	}
	
	public AbstractMerger(final MergerConfig config) {
		this.setConfig(config);
	}

	public void merge(Collection<NodeRef> inputFiles, OutputStream output)
			throws MergerException {
		this.merge(inputFiles, output, this.config);
	}

	public void setConfig(final MergerConfig config) {
		if (null == config) {
			this.config = MergerConfig.emptyConfig();
		}
		
		this.config = config;
	}	
	
	/*
	 * Spring IoC/DI material
	 */

	
	public void setMergerUtils(MergerUtils mergerUtils) {
		this.mergerUtils = mergerUtils;
	}
	
	protected MergerUtils getMergerUtils() {
		return this.mergerUtils;
	}

}
