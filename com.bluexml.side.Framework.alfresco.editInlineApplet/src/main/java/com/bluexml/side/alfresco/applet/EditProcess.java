package com.bluexml.side.alfresco.applet;

import java.io.File;


public abstract class EditProcess implements Runnable {
	
	public static class EditProcessException extends RuntimeException {

		private static final long serialVersionUID = 1L;
		
		public EditProcessException(String message, Throwable t) {
			super(message, t);
		}

		public EditProcessException(Throwable t) {
			super(t);
		}
		
		public EditProcessException(String message) {
			super(message);
		}
		
	}
	
	protected final File editedFile;

	public EditProcess(File file) {
		this.editedFile = file;
	}
	
	public Thread launch() {
		
		Thread thread = new Thread(this);
		thread.start();
		
		return thread;
		
	}

	@Override
	public void run() {
		
		try {
			
			runInternal();
	        
		} catch (Exception e) {
			e.printStackTrace(System.err);
			throw new EditProcessException(e);
		} 
		finally {
			
		}
		
	}
	
	protected abstract void runInternal() throws Exception;
	

}