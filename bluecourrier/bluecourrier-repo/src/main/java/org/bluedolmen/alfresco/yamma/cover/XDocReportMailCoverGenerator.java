package org.bluedolmen.alfresco.yamma.cover;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

import org.alfresco.repo.content.MimetypeMap;
import org.alfresco.repo.content.filestore.FileContentReader;
import org.alfresco.repo.content.transform.ContentTransformer;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.model.FileFolderService;
import org.alfresco.service.cmr.model.FileInfo;
import org.alfresco.service.cmr.repository.ContentReader;
import org.alfresco.service.cmr.repository.ContentService;
import org.alfresco.service.cmr.repository.ContentWriter;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.util.TempFileProvider;
import org.apache.commons.io.FilenameUtils;
import org.apache.log4j.Logger;
import org.bluedolmen.alfresco.xdocreport.AbstractXDocReportGenerator.StreamDestination;
import org.bluedolmen.alfresco.xdocreport.XDocReportGenerator;
import org.bluedolmen.alfresco.yamma.cover.AbstractMailCoverGenerator;

import fr.opensagres.xdocreport.core.XDocReportException;

public class XDocReportMailCoverGenerator extends AbstractMailCoverGenerator {

	private static final Logger logger = Logger.getLogger(XDocReportMailCoverGenerator.class);

	
	public boolean generate(NodeRef nodeRef, ContentWriter output, String mimetype) throws MailCoverGeneratorException {
		
		if (MimetypeMap.MIMETYPE_PDF != mimetype) return false;
		
		if (null == generator) {
			logger.debug("No generator is defined, does not accept the generation");
			return false;
		}
		
		try {
			
			final Worker worker = new Worker(nodeRef, output);
			worker.execute();
			return true;
			
		} catch (Exception e) {
			throw new MailCoverGeneratorException("Error while generating cover", e);
		}
		
	}
	
	/**
	 * We do not use the capabilities of XDocReport for transforming a report
	 * directly into a pdf, because it is based on a custom iText
	 * transformation. This may lead to incomplete report generation. Instead,
	 * we use the capabilities of Alfresco to transform an OpenDoc document into
	 * a pdf by using the native functionalities of OpenOffice. For this, we
	 * unfortunately have to generate 2 internal temporary files. These are
	 * normally automatically cleaned up by the system after a given period of
	 * time (default is 1 hour).
	 * 
	 * @author pajot-b
	 * 
	 */
	private final class Worker {
		
		private final NodeRef nodeRef;
		private final ContentWriter output;
		private File opendocFile;		
		
		private Worker(final NodeRef nodeRef, ContentWriter output) {
			this.nodeRef = nodeRef;
			this.output = output;
		}
		
		private void execute() throws XDocReportException, IOException {
		
			generateOpenDocFile();
			generatePdfFile();
			
		}
		
		private void generateOpenDocFile() throws XDocReportException, IOException {
			
			final FileInfo fileInfo = fileFolderService.getFileInfo(nodeRef);
			final String fileName = fileInfo.getName();
			final String fileBasename = FilenameUtils.getBaseName(fileName);

			opendocFile = TempFileProvider.createTempFile(fileBasename + "-cover", "." + generator.getTemplateExtension());
			generator.generate(
				nodeRef, 
				new StreamDestination(new BufferedOutputStream(new FileOutputStream(opendocFile)))
			);

		}
		
		private void generatePdfFile() {
			
			final String sourceMimetype = generator.getTemplateMimetype();
			if (null == sourceMimetype) {
				throw new IllegalStateException(String.format(
					"Cannot map the extension '%s' with a known mimetype", generator.getTemplateExtension() 
				));
			}
			
			final String targetMimetype = MimetypeMap.MIMETYPE_PDF;
			final ContentTransformer transformer = contentService.getTransformer(sourceMimetype, targetMimetype);
			
			if (null == transformer) {
				throw new IllegalStateException(String.format(
					"Cannot find a transformer to get a pdf-file from mimetype '%s'", sourceMimetype 
				));				
			}
			
			final ContentReader reader = new FileContentReader(opendocFile);
			reader.setMimetype(sourceMimetype);
			
			output.setMimetype(targetMimetype);
			
			transformer.transform(reader, output);
			
		}
		
	}
	

	// IoC
	
	private XDocReportGenerator generator = null;
	private ContentService contentService;
	private FileFolderService fileFolderService;
	
	public void setGenerator(XDocReportGenerator generator) {
		this.generator = generator;
	}
	
	public void setContentService(ContentService contentService) {
		this.contentService = contentService;
	}
	
	public void setFileFolderService(FileFolderService fileFolderService) {
		this.fileFolderService = fileFolderService;
	}
	
	@Override
	public void setServiceRegistry(ServiceRegistry serviceRegistry) {
		
		super.setServiceRegistry(serviceRegistry);
		if (null == serviceRegistry) return;
		
		this.setContentService(serviceRegistry.getContentService());
		this.setFileFolderService(serviceRegistry.getFileFolderService());
		
	}

}
