package org.bluedolmen.alfresco.resources;

import java.io.IOException;
import java.io.InputStream;

public interface AlfrescoReadableResource extends AlfrescoResource {

	InputStream getInputStream() throws IOException;
	
}
