package com.bluexml.side.alfresco.applet;

import java.applet.Applet;
import java.io.File;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URL;

import netscape.javascript.JSObject;

import com.bluexml.side.alfresco.applet.WorkingDocument.OpeningMode;


public class EditInlineApplet extends Applet {

	private static final long serialVersionUID = 1L;
	
	private String editingMode = null;
	private String ticket = null;
	private String mimetype = null;
	private String webdavUrl = null;
	
	private JSObject jso = null;

	public void init() {
		
		jso = JSObject.getWindow(this);
			
		editingMode = getParameter("mode");
		ticket = getParameter("ticket");
		mimetype = getParameter("mime");
		webdavUrl = getParameter("webdavUrl");		
				
	}
	
	private URL getWebdavUrl(String webdavUrl) {
		
		final URI webdavURI = URI.create(webdavUrl);
		
		try {
			return webdavURI.toURL();
		} catch (MalformedURLException e) {
			return null;
		}
		
	}

		
	public void start() {
		
		if (null != webdavUrl) {
			editDocument(webdavUrl, ticket, editingMode);
		}
		
	}

	public void stop() {
		
		
	}

	public void editDocument(String webdavUrl, String ticket, String editingMode) {
		
		try {
			
			final DownloadedDocument workingDocument = new DownloadedDocument(
				getWebdavUrl(webdavUrl), 
				ticket, 
				"write".equals(editingMode) ? OpeningMode.READ_WRITE : OpeningMode.READ_ONLY
			);
			final File workingFile = workingDocument.downloadDocument();
			final EditProcess editProcess = OfficeEditProcess.createFromMimetype(workingFile, mimetype);
			
			editProcess.start();
			try {
				editProcess.join();
			} catch (InterruptedException e) {
				// ok
			}
			
			workingDocument.interrupt();					
			jso.eval("endOfEditing(" + webdavUrl + ")");
			
		}
		catch (Exception e) {
			e.printStackTrace(System.err);
		}
		
		
	}

}
