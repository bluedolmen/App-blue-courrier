package org.bluedolmen.repo.content.transform;

import java.io.IOException;
import java.io.InputStream;
import java.io.StringWriter;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import javax.mail.BodyPart;
import javax.mail.MessagingException;
import javax.mail.Multipart;
import javax.mail.Part;
import javax.mail.Session;
import javax.mail.internet.MimeMessage;

import org.alfresco.repo.content.MimetypeMap;
import org.alfresco.repo.content.transform.AbstractContentTransformer2;
import org.alfresco.service.cmr.repository.ContentReader;
import org.alfresco.service.cmr.repository.ContentWriter;
import org.alfresco.service.cmr.repository.TemplateService;
import org.alfresco.service.cmr.repository.TransformationOptions;
import org.apache.commons.lang.StringEscapeUtils;
import org.springframework.core.io.Resource;
import org.springframework.extensions.surf.util.ParameterCheck;

/**
 * Uses javax.mail.MimeMessage to generate plain text versions of RFC822 email
 * messages. Searches for all text content parts, and returns them. Any
 * attachments are ignored.
 * 
 * This transformer also extracts only the parts of the {@link MimeMessage}
 * which are of the target Mimetype.
 * 
 * @author pajot-b
 * 
 */
public class EMLTransformer extends AbstractContentTransformer2 {
	
	private TemplateService templateService;
	private Resource plainTextHtmlTemplate;
	private String template;
	
	public void afterPropertiesSet() {
		
		ParameterCheck.mandatory("templateService", templateService);
		
	}
	

	public boolean isTransformable(String sourceMimetype, String targetMimetype, TransformationOptions options) {
		
        if (!MimetypeMap.MIMETYPE_RFC822.equals(sourceMimetype)) return false;
        if (!MimetypeMap.MIMETYPE_HTML.equals(targetMimetype)) return false;
        
		return true;
	}

    @Override
    protected void transformInternal(ContentReader reader, ContentWriter writer, TransformationOptions options) throws Exception
    {
    	
        final MimetypeMessageExtracter htmlMessageExtracter = new MimetypeMessageExtracter(MimetypeMap.MIMETYPE_HTML);
    	
        InputStream is = null;
        try
        {
            is = reader.getContentInputStream();

            final MimeMessage mimeMessage = new MimeMessage(Session.getDefaultInstance(new Properties()), is);
            String filteredContent = htmlMessageExtracter.processContent(mimeMessage);
            
            if (filteredContent.isEmpty()) {
                final MimetypeMessageExtracter textMessageExtracter = new MimetypeMessageExtracter(MimetypeMap.MIMETYPE_TEXT_PLAIN);
                filteredContent = textMessageExtracter.processContent(mimeMessage);
                
                final String subject = mimeMessage.getSubject();
                renderPlainTextMail(filteredContent, subject, writer);
            } else {
            	writer.putContent(filteredContent);
            }
        }
        finally
        {
            if (is == null) return;
            
            try
            {
                is.close();
            }
            catch (IOException e)
            {
                e.printStackTrace();
            }
        }
    }

    private final static class MimetypeMessageExtracter {
    	
    	private final String filteredMimetype;
    	private StringBuilder sb;
    	
    	private MimetypeMessageExtracter(String mimetype) {
    		if (null == mimetype || mimetype.isEmpty()) {
    			throw new IllegalArgumentException("The provided mimetype is not valid.");
    		}
    		
    		this.filteredMimetype = mimetype;
    	}
    	
    	public String processContent(final MimeMessage message) throws MessagingException, IOException {
    		
    		sb = new StringBuilder();    		
    		processPart(message);
    		return sb.toString();
    		
    	}
    	
    	private void processPart(final Part part) throws MessagingException, IOException {
    		
    		final Object content = part.getContent();
    		if (content instanceof Multipart) {
    			processMultipart((Multipart) content);
    			return;
    		}    		
    		
			final String contentType = part.getContentType();
			if (contentType == null) return;
    		if (!contentType.contains(filteredMimetype)) return;
    		
    		sb.append(content.toString()).append("\n");
    		
    	}
    	
    	private void processMultipart(final Multipart multipart) throws MessagingException, IOException {
    		
            for (int i = 0, n = multipart.getCount(); i < n; i++)
            {
                final BodyPart bodyPart = multipart.getBodyPart(i);
                processPart(bodyPart);
            }
            
    	}
    	
    }
    

    private void renderPlainTextMail(String contentText, String subject, ContentWriter contentWriter) throws IOException {

    	final StringWriter out = new StringWriter();
    	final String template = getTemplate();
    	final Map<String, Object> model = new HashMap<String, Object>();
    	final String escapedContentText = StringEscapeUtils.escapeHtml(contentText);
    	model.put("title", subject);
    	model.put("head", "");
    	model.put("contentText", escapedContentText);
    	
    	templateService.processTemplateString("freemarker", template, model, out);
    	contentWriter.putContent(out.toString());
    	
    }
 
 
    private String getTemplate() {
    	
    	if (null != template) return template;
    	
    	InputStream is = null;
    	try {
			is = plainTextHtmlTemplate.getInputStream();
			final StringBuilder template = new StringBuilder();
			final byte[] buffer = new byte[1024];
			int len = 0;
			while ((len = is.read(buffer)) > 0) {
				template.append(new String(buffer, 0, len));
			}
			
			this.template = template.toString();

		} catch (IOException e) {
			template = "";
		} finally {
			if (is != null) {
				try {
					is.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}
    	
    	return template;
    	
    }
    
    
    // Spring IoC material
    
    public void setTemplateService(final TemplateService templateService) {
    	this.templateService = templateService;
    }
    
    TemplateService getTemplateService() {
    	return this.templateService;
    }
    
    public void setPlainTextHtmlTemplate(Resource resource) {
    	this.plainTextHtmlTemplate = resource;
    }
    
}
