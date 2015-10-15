package org.bluedolmen.alfresco.xdocreport;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Collections;
import java.util.Map;

import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.model.FileFolderService;
import org.alfresco.service.cmr.model.FileInfo;
import org.alfresco.service.cmr.repository.MimetypeService;
import org.alfresco.service.cmr.repository.NodeRef;
import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.InitializingBean;

import fr.opensagres.xdocreport.core.XDocReportException;
import fr.opensagres.xdocreport.document.IXDocReport;
import fr.opensagres.xdocreport.document.registry.XDocReportRegistry;
import fr.opensagres.xdocreport.template.IContext;
import fr.opensagres.xdocreport.template.TemplateEngineKind;
import fr.opensagres.xdocreport.template.formatter.FieldsMetadata;

public abstract class AbstractXDocReportGenerator implements XDocReportGenerator, InitializingBean {

	private IXDocReport report;
	private FieldsMetadata metadata;
	private String templateBaseName;
	private String templateExtension;
	
	public void afterPropertiesSet() throws Exception {
		
		final InputStream templateFileIS = getClass().getClassLoader().getResourceAsStream(templateLocation);
		if (null == templateFileIS) throw new IllegalStateException(
				String.format("The location '%s' is not valid", templateLocation)
		);
		
		report = XDocReportRegistry.getRegistry().loadReport(templateFileIS, TemplateEngineKind.Freemarker);
		metadata = report.createFieldsMetadata();
		
		templateBaseName = FilenameUtils.getBaseName(templateLocation);
		templateExtension = FilenameUtils.getExtension(templateLocation);
		
		// May limit the possible extension names here		
	}
	
	
	public void generate(NodeRef nodeRef, Destination output) throws XDocReportException, IOException {
		final Worker worker = createWorker(nodeRef);
		worker.generate(output);
	}	
	
	public String getTemplateExtension() {
		return templateExtension;
	}
	
	public String getTemplateMimetype() {
		return mimetypeService.getMimetype(templateExtension);
	}
	
	protected IXDocReport getReport() {
		return report;
	}
	
	protected FieldsMetadata getMetadata() {
		return metadata;
	}
	
	protected Worker createWorker(NodeRef nodeRef) {
		return new Worker(nodeRef);
	}
	
	public static class StreamDestination implements Destination {
		
		private final OutputStream output;
		
		public StreamDestination(OutputStream output) {
			this.output = output;
		}
		
		public OutputStream getDestination() {
			return output;
		}
		
	}

	protected class Worker {
		
		protected final NodeRef nodeRef;
		private final FileInfo fileInfo;
		
		protected Worker(NodeRef nodeRef) {
			
			if (null == nodeRef) {
				throw new IllegalArgumentException("The provided document node is not valid");
			}
			
			this.nodeRef = nodeRef;
			this.fileInfo = fileFolderService.getFileInfo(nodeRef);
			
			if (fileInfo.isFolder() || fileInfo.isLink()) {
				throw new IllegalArgumentException("The provided node has to be a valid file not a link nor a directory");
			}
			
		}
		
		protected void generate(Destination output) throws XDocReportException, IOException {
			
			if (!(output instanceof StreamDestination)) {
				throw new UnsupportedOperationException("Only accept " + StreamDestination.class.getName() + " as output.");
			}
			
			generateOpenDocFile( ((StreamDestination) output).getDestination() );
			
		}
		
		private void generateOpenDocFile(OutputStream output) throws XDocReportException, IOException {

			final IContext context = getContext();
			report.process(context, output);

		}
		
		protected IContext getContext() throws XDocReportException {
			
			final IContext context = report.createContext();
			final Map<String, Object> values = getValues();
			context.putMap(values);
			
			return context;
			
		}
		
		protected Map<String, Object> getValues() {

			return Collections.emptyMap();
			
		}
		
	}	
		
	
	// IoC

	private ServiceRegistry serviceRegistry;
	private FileFolderService fileFolderService;
	private MimetypeService mimetypeService;

	private String templateLocation;
	
	public void setTemplateLocation(String templateLocation) {
		this.templateLocation = templateLocation;
	}
	
	public void setFileFolderService(FileFolderService fileFolderService) {
		this.fileFolderService = fileFolderService;
	}
	
	public FileFolderService getFileFolderService() {
		return fileFolderService;
	}
	
	public void setMimetypeService(MimetypeService mimetypeService) {
		this.mimetypeService = mimetypeService;
	}	
	
	public MimetypeService getMimetypeService() {
		return mimetypeService;
	}
	
	public void setServiceRegistry(ServiceRegistry serviceRegistry) {
		
		this.serviceRegistry = serviceRegistry;
		if (null == serviceRegistry) return;
		
		this.setFileFolderService(serviceRegistry.getFileFolderService());
		this.setMimetypeService(serviceRegistry.getMimetypeService());
		
		
	}
	
}
