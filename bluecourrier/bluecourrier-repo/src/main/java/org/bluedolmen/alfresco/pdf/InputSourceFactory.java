package org.bluedolmen.alfresco.pdf;

import java.io.IOException;
import java.io.InputStream;

import org.alfresco.service.cmr.model.FileFolderService;
import org.alfresco.service.cmr.repository.ContentReader;
import org.alfresco.service.cmr.repository.NodeRef;

public class InputSourceFactory <T extends InputSourceFactory<T>.InputSource> {
	
	public InputSource createNew(Object input) {
		if (input instanceof NodeRef) {
			return new InputSource((NodeRef) input);
		}
		else if (input instanceof InputStream) {
			return new InputSource((InputStream) input);
		}
		
		throw new UnsupportedOperationException(String.format("The type '%s' is not supported by this factory", input.getClass().getName()));
	}
		
	public class InputSource {
		
		private NodeRef nodeRef;
		private InputStream is;
		
		private InputSource(NodeRef nodeRef) {
			if (null == nodeRef) {
				throw new IllegalArgumentException("The provided nodeRef is null.");
			}
			this.nodeRef = nodeRef;
		}
		
		private InputSource(InputStream is) {
			if (null == is) {
				throw new IllegalArgumentException("The provided InputStream is null.");
			}
			this.is = is;
		}		
		
		public NodeRef getNodeRef() {
			return nodeRef;
		}
		
		public InputStream getInputStream() {
			
			if (null == is) {
				if (null == nodeRef) {
					throw new IllegalStateException("Cannot find any valid source to get a document (neither the input-stream nor the nodeRef is defined)");
				}
				
				if (null == fileFolderService) {
					throw new IllegalStateException("Cannot get an input-stream from the nodeRef, the fileFolderService is undefined");
				}
				
				final ContentReader contentReader = fileFolderService.getReader(nodeRef); 
				is = contentReader.getContentInputStream();
			}
			
			return is;
			
		}
		
		
		public void close() throws IOException {
			
			if (null != is) {
				is.close();
			}
			
		}
		
	}
	
	private FileFolderService fileFolderService;
	
	public void setFileFolderService(FileFolderService fileFolderService) {
		this.fileFolderService = fileFolderService;
	}	
	
}
