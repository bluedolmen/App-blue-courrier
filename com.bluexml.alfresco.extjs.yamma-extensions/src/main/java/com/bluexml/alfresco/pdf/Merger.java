package com.bluexml.alfresco.pdf;

import java.io.OutputStream;
import java.util.Collection;
import java.util.HashMap;

import org.alfresco.service.cmr.repository.NodeRef;

public interface Merger {
	
	public static class MergerConfig extends HashMap<String, Object> {

		private static final long serialVersionUID = 5107572874618326607L;
		public static final String DOUBLE_SIDED = "doubleSided";
		
		public static final MergerConfig emptyConfig() {
			return new MergerConfig();
		}
		
		public <T> T getValue(String key, Class<T> type) {
			
			if (!this.containsKey(key)) return null;			
			return type.cast(this.get(key));
			
		}
		
	}

	public void merge(Collection<NodeRef> inputFiles,  OutputStream output) throws MergerException;
	
	public void merge(Collection<NodeRef> inputFiles,  OutputStream output, MergerConfig config) throws MergerException;

	public void setConfig(MergerConfig config) throws MergerConfigException;
	
};
