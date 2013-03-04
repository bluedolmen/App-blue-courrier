package com.bluexml.alfresco.mtslight;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Date;

import org.alfresco.error.AlfrescoRuntimeException;
import org.alfresco.model.ContentModel;
import org.alfresco.repo.content.MimetypeMap;
import org.alfresco.repo.content.transform.ContentTransformerHelper;
import org.alfresco.repo.content.transform.ContentTransformerWorker;
import org.alfresco.service.cmr.repository.ContentReader;
import org.alfresco.service.cmr.repository.ContentWriter;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.repository.TransformationOptions;
import org.apache.commons.httpclient.DefaultHttpMethodRetryHandler;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.httpclient.methods.PostMethod;
import org.apache.commons.httpclient.methods.multipart.FilePart;
import org.apache.commons.httpclient.methods.multipart.MultipartRequestEntity;
import org.apache.commons.httpclient.methods.multipart.Part;
import org.apache.commons.httpclient.methods.multipart.PartSource;
import org.apache.commons.httpclient.params.HttpMethodParams;
import org.apache.commons.io.IOUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.InitializingBean;

public class MTSLightContentTransformerWorker extends ContentTransformerHelper implements ContentTransformerWorker, InitializingBean {

	private static final String TRANSFORM_URI_PATH = "transform";
	private static final String INFO_URI_PATH = "info";
	
	private NodeService nodeService = null;
	private String server = "localhost";
	private String port = null;
	private boolean disabled = false;
	
	private static final long AVAILABILITY_TTL_MS = 2000;
	private long lastCheckDate = 0;
	private boolean isAvailable = false;
	
	private final Log logger = LogFactory.getLog(getClass());

	
	public String getVersionString() {
		return getVersion();
	}

		
	public boolean isTransformable(String sourceMimetype, String targetMimetype, TransformationOptions options) {
		
		if (disabled) return false;
		
		if (!MimetypeMap.MIMETYPE_PDF.equals(targetMimetype)) return false;
		
        return ( 
				MimetypeMap.MIMETYPE_WORD.equals(sourceMimetype) ||
				MimetypeMap.MIMETYPE_OPENXML_WORDPROCESSING.equals(sourceMimetype) ||
				MimetypeMap.MIMETYPE_EXCEL.equals(sourceMimetype) ||
				MimetypeMap.MIMETYPE_OPENXML_SPREADSHEET.equals(sourceMimetype)
	        ) 
	        && isAvailable() // postpone network checking
	    ;
		
	}

	public void transform(final ContentReader reader, final ContentWriter writer, TransformationOptions options) throws Exception {
				
		final NodeRef sourceNodeRef = options.getSourceNodeRef();
		final String fileName = (String) nodeService.getProperty(sourceNodeRef, ContentModel.PROP_NAME);
		
		final HttpClient client = new HttpClient();
		client.getParams().setParameter(HttpMethodParams.RETRY_HANDLER, new DefaultHttpMethodRetryHandler());
		
		final String uri = getServiceAddress(TRANSFORM_URI_PATH);
		final PostMethod postMethod = new PostMethod(uri);
		
		final PartSource partSource = new PartSource() {
			
			public long getLength() {
				return reader.getSize();
			}
			
			public String getFileName() {
				return fileName;
			}
			
			public InputStream createInputStream() throws IOException {
				return reader.getContentInputStream();
			}
		};
		
		final Part[] parts = {
			new FilePart("upload", partSource, reader.getMimetype(), null)	
		};
		
		final MultipartRequestEntity requestEntity = new MultipartRequestEntity(parts, postMethod.getParams());
		postMethod.setRequestEntity(requestEntity);

		try {
			
			// Execute the method.
			final int statusCode = client.executeMethod(postMethod);
			if (statusCode != HttpStatus.SC_OK) {
				
				final String message = "Failure while calling the HTTP mts-light server: " + postMethod.getStatusLine();
				try {
					postMethod.getResponseBody(); // reading the body is required by the Apache API
				} catch (IOException e) {}
				
				throw new AlfrescoRuntimeException(message);
			}

			final InputStream responseStream = postMethod.getResponseBodyAsStream();
			if (null == responseStream) {
				throw new AlfrescoRuntimeException("Cannot get the stream from the server response");
			}
			
			final OutputStream writerOutputStream = writer.getContentOutputStream();
			try {
				IOUtils.copy(responseStream, writerOutputStream);
			}
			finally {
				if (null != writerOutputStream) {
					writerOutputStream.close();
				}
				if (null != responseStream) {
					responseStream.close();
				}
			}
			
		} 
		finally {
			// Release the connection.
			postMethod.releaseConnection();
		}		

	}
	
	public boolean isAvailable() {
		
		final long currentDate = new Date().getTime();
		if (currentDate - lastCheckDate > AVAILABILITY_TTL_MS) {
			isAvailable = getVersion() != null;	
			lastCheckDate = currentDate;
		}
		
		return isAvailable; 
		
	}
	
	public String getVersion() {
		
		final HttpClient client = new HttpClient();
		client.getParams().setParameter(HttpMethodParams.RETRY_HANDLER, new DefaultHttpMethodRetryHandler());
		
		final String uri = getServiceAddress(INFO_URI_PATH);
		final GetMethod method = new GetMethod(uri);

		try {
			
			// Execute the method.
			final int statusCode = client.executeMethod(method);
			if (statusCode != HttpStatus.SC_OK) {
				logger.debug("Error while contacting the MTS-Light server:" + method.getStatusLine());
				try {
					method.getResponseBody(); // reading the body is required by the Apache API
				} catch (IOException e) {
				}
				return null;
			}

			final String response = method.getResponseBodyAsString();
			if (null == response) return null;
						
			try {
				final JSONObject jsonResponse = new JSONObject(response);
				return jsonResponse.getString("version");
			}
			catch (JSONException e) {
				logger.debug(String.format("The string '%s' returned by the server is not a valid JSON-formatted string!", response));
			}
			
		} 
		catch (Exception e) {
			logger.warn("Cannot get version of the MTS-Light server: " + e.getMessage());
		}
		finally {
			// Release the connection.
			method.releaseConnection();
		}
		
		return null;
		
	}
	

	private String getServiceAddress(String servicePath) {

		assert(null != servicePath);
		
		final StringBuilder addr = new StringBuilder()
			.append("http://")
			.append(server)
			.append(null != port ? ':' + port : "")
			.append("/")
			.append(servicePath)
		;
		
		return addr.toString();
		
	}
	
	// Spring IoC/DI material
	
	public void afterPropertiesSet() throws Exception {
		
		if (null == server || server.isEmpty()) {
			logger.info("The MTS-light server is not correctly initialized, it is now disabled");
			disabled = true;
		}
		
	}
	
	public void setNodeService(NodeService nodeService) {
		this.nodeService = nodeService;
	}
	
	public void setServer(String server) {
		this.server = server;
	}
	
	public void setPort(String port) {
		this.port = port;
	}

}
