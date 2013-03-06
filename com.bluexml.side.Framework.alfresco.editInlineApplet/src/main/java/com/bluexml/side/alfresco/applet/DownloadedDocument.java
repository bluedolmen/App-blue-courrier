package com.bluexml.side.alfresco.applet;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLConnection;

public final class DownloadedDocument extends Thread implements WorkingDocument {
	
	private static final String TMP_DIR = System.getProperty("java.io.tmpdir");
	private static final long WATCH_FREQUENCY_MS = 5000;

	private final URL url;
	private final String ticket;
	private final OpeningMode openingMode;
	private final File workingFile;
	
	private long lastUploaded = -1; 
	
	DownloadedDocument(URL url, String ticket, OpeningMode openingMode) {
		this.url = url;
		this.ticket = ticket;
		this.openingMode = openingMode;
		
		final String workingFileName = getFileName(url);
		workingFile = new File(TMP_DIR + workingFileName);
		workingFile.setWritable(OpeningMode.READ_WRITE.equals(openingMode));		
	}

	@Override
	public void run() {
		
		super.run();
		
		final Watcher<Void> watcher = new Watcher<Void>(WATCH_FREQUENCY_MS) {

			@Override
			protected boolean checkCondition() {
				return !workingFile.exists(); // stop if the working file disappear
			}
			
			@Override
			protected void doWhileWatching() {				
				uploadDocumentIfNecessary();
			}
			
		};
		watcher.blockSafeUntilTrue(); // terminate on interrupt
		
		terminate();
	}
	
	private void terminate() {
		
		uploadDocumentIfNecessary();
		
		if (null != workingFile) {
			if (!workingFile.canWrite()) {
				workingFile.setWritable(true);
			}
			workingFile.delete();
		}
		
	}
	
	public synchronized File downloadDocument() throws IOException {
				
		final URLConnection uc = url.openConnection();
		uc.setUseCaches(false);
		uc.setDoInput(true);
		uc.setDoOutput(true);
		uc.addRequestProperty("ticket", ticket);
		uc.connect();
		
		InputStream input = null;
		FileOutputStream fos = new FileOutputStream(workingFile);
		
		try {
			input = uc.getInputStream();			
			IOUtils.copyLarge(input, fos);
		}
		finally {
			
			try {
				if (input != null) input.close();
			} catch(Exception e){} // ignore exception on input closure
			finally {
				input = null;
			}
			
			try {
				if (fos != null) fos.close();
			}
			finally {
				fos = null;
				lastUploaded = workingFile.lastModified();
			}
			
		}
		
		this.start();
		return workingFile;
		
	}
	
	private String getFileName(URL downloadUrl) {
		
		final String path = url.getPath();		
		final String fileName = path.substring(path.lastIndexOf("/"));
		return fileName.replace(' ', '_');
		
	}
	
	private void uploadDocumentIfNecessary() {
		
		if (-1 == lastUploaded) return; // not yet downloaded!
		if (OpeningMode.READ_ONLY.equals(openingMode)) return; // no need to upload read-only documents
		if (!workingFile.exists()) return;
		
		final long lastModified = workingFile.lastModified();
		if (lastModified == lastUploaded) return;
		
		try {
			uploadDocument();
		} catch (IOException e) {
			e.printStackTrace();
		}		
		
	}
	
	public synchronized void uploadDocument() throws IOException {
		
		final long cachedLastModified = workingFile.lastModified();
		HttpURLConnection huc = (HttpURLConnection) url.openConnection();
		
		try {
			huc.setUseCaches(false);
			huc.setDoOutput(true);
			huc.setRequestMethod("PUT");
			huc.addRequestProperty("ticket", ticket);
			huc.connect();
		
			FileInputStream fis = new FileInputStream(workingFile);
			OutputStream output = huc.getOutputStream();
		
			try {
				IOUtils.copyLarge(fis, output);
			} finally {
				
				try {
					if (fis != null) fis.close();
				} 
				catch(Exception e){} // ignore exception on input closure
				finally {
					fis = null;
				}
				
				try {
					if (output != null) output.close();
				}
				catch(Exception e){} // ignore exception on output closure
				finally {
					output = null;
				}
				
			}
		
			final int responseCode = huc.getResponseCode();
			final boolean errorRaised = (responseCode < 200) || (responseCode > 202); 
			InputStream responseIS = null;
			String errorMessage = null;
			
			try {
				
				if (errorRaised) {
					responseIS = huc.getErrorStream();
					errorMessage = IOUtils.toString(responseIS);
					throw new IOException(errorMessage);
				} else {
					lastUploaded = cachedLastModified;
				}				
				
			} 
			finally {
				if (null != responseIS) responseIS.close();
				responseIS = null;
			}
			
		}
		finally {
			if (null != huc) huc.disconnect();
			huc = null;
		}				
		
	}
	
	
	
	
}
