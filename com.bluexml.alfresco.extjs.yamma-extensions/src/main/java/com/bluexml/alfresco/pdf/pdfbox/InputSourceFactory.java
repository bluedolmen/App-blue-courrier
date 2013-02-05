package com.bluexml.alfresco.pdf.pdfbox;

import java.io.IOException;
import java.io.InputStream;

import org.alfresco.service.cmr.model.FileFolderService;
import org.alfresco.service.cmr.repository.ContentReader;
import org.alfresco.service.cmr.repository.NodeRef;
import org.apache.pdfbox.pdmodel.PDDocument;

class InputSourceFactory {
	
	public InputSource createNew(NodeRef nodeRef) {
		return new InputSource(nodeRef);
	}
	
	public InputSource createNew(InputStream is) {
		return new InputSource(is);
	}
	
	public InputSource createNew(PDDocument document) {
		return new InputSource(document);
	}
	
	public class InputSource {
		
		private NodeRef nodeRef;
		private InputStream is;
		private PDDocument document;
		
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
		
		private InputSource(PDDocument document) {
			if (null == document) {
				throw new IllegalArgumentException("The provided document is null.");
			}
			this.document = document;
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
		
		public PDDocument getDocument() throws IOException {
			
			if (null == document) {
				final InputStream is = getInputStream();
				document = PDDocument.load(is);			
			}
			
			return document;
		}
		
		public void close() throws IOException {
			
			if (null != document) {
				document.close();
			}
			else if (null != is) {
				is.close();
			}
			
		}
		
	}
	
	private FileFolderService fileFolderService;
	
	public void setFileFolderService(FileFolderService fileFolderService) {
		this.fileFolderService = fileFolderService;
	}	
	
}
