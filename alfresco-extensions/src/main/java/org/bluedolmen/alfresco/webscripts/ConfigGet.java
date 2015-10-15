package org.bluedolmen.alfresco.webscripts;

import java.util.Arrays;

import org.alfresco.repo.content.MimetypeMap;
import org.alfresco.repo.web.scripts.content.ContentStreamer;
import org.springframework.beans.factory.InitializingBean;

public class ConfigGet extends BasePathDynResourceGet implements InitializingBean {

	@Override
	public void afterPropertiesSet() throws Exception {
		this.setFilteredExtensions(Arrays.asList(new String[]{"json"}));
	}

	public void setDelegate(ContentStreamer delegate) {
		
		if (delegate instanceof CheckedMimetypeContentStreamer) {
			((CheckedMimetypeContentStreamer) delegate).setForcedMimetype(MimetypeMap.MIMETYPE_JAVASCRIPT);
		}
		super.setDelegate(this.delegate);
		
	}
	
}
