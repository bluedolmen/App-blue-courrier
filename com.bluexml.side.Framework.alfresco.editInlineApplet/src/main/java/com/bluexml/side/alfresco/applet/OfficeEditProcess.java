package com.bluexml.side.alfresco.applet;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.bluexml.side.alfresco.applet.ApplicationHelper.ApplicationExe;
import com.bluexml.side.alfresco.applet.PIDWatcher.PIDWatcherEvent;
import com.bluexml.side.alfresco.applet.PIDWatcher.ProcessEnded;


public class OfficeEditProcess extends EditProcess implements Notifier<OfficeEditProcess.OfficeEvent> {
	
	// NOTIFIER MATERIAL
	
	public static interface OfficeEvent {}
	
	public static final class EndOfProcess implements OfficeEvent {}
	
	private final NotifierHelper<OfficeEvent> notifierHelper = new NotifierHelper<OfficeEvent>();
	
	@Override
	public void register(Listener<OfficeEvent> listener) {
		notifierHelper.register(listener);
	}

	@Override
	public void notifyAll(OfficeEvent event, Object... args) {
		notifierHelper.notifyAll(event, args);
	}	
	

	// MAIN MATERIAL
	
	static final String TMP_DIR = System.getProperty("java.io.tmpdir");
	private static final long WATCH_FREQUENCY_MS = 1000;
	
	private final ApplicationExe applicationExe;
	private final String fullExecutablePath;
	
	private Boolean officeProcessRunning = true;
	
	public static OfficeEditProcess createFromMimetype(File file, String mimetype) {
		
		if (null == mimetype || mimetype.isEmpty()) {
			throw new IllegalArgumentException("The provided mimetype has to be a valid string");
		}
		
		final ApplicationExe applicationExe = ApplicationHelper.getApplicationExecutable(mimetype);
		if (null == applicationExe) {
			throw new IllegalStateException(String.format("Cannot find a valid executable for mimetype '%s'", mimetype));
		}
		
		return new OfficeEditProcess(file, applicationExe);
		
	}
	
	private OfficeEditProcess(File file, ApplicationExe applicationExe) {
		
		super(file);
		
		this.applicationExe = applicationExe;
		fullExecutablePath = ApplicationHelper.getApplicationFullPath(applicationExe);
		if (null == fullExecutablePath) {
			throw new IllegalStateException(String.format("Cannot find a valid executable for '%s'", applicationExe));
		}
		
	}
	
	public Thread launch() {
		
		String filePath;
		try {
			filePath = editedFile.getCanonicalPath();
		} catch (IOException e) {
			System.err.println(String.format("Cannot get the path from the file '%s'", editedFile));
			e.printStackTrace(System.err);
			return null;
		}
		
	    final String[] command = { fullExecutablePath, filePath };
		final ProcessBuilder pb = new ProcessBuilder(command);
	    pb.redirectErrorStream(true);
	    
	    try {
	    	final Process p = pb.start();	
			final int launchResult = p.waitFor();
			if (0 != launchResult) {
				throw new RuntimeException(String.format("Problem while launching '%s'", fullExecutablePath));
			}
			
		} catch (Exception e) { // IOException or InterruptedException
			// should not happen since office processes give the hand back immediately
			e.printStackTrace(System.err); 
			return null;
		}	    
	
	    int officePID = getOfficePID();
	    final PIDWatcher pidWatcher = PIDWatcher.createWatcher(officePID);
	    pidWatcher.register(new Listener<PIDWatcher.PIDWatcherEvent>() {
			@Override
			public void notify(PIDWatcherEvent event, Object... objects) {
				synchronized (officeProcessRunning) {
					officeProcessRunning =  !(event instanceof ProcessEnded);
				}
			}
		});
	    pidWatcher.launch();
	    
	    return super.launch();
	    
	}	
	
	@Override
	protected void runInternal() {
	    watchInstance();		
	}
	
	
	private int getOfficePID() {
		
        //final String[] command = { "tasklist.exe", "/fi", "\"imagename eq " + applicationExe.executable + "\"" };
		final String[] command = { "wmic",  "process", "get", "Caption,Processid"};
		final ProcessBuilder tasklist = new ProcessBuilder(command);

        BufferedReader input = null;
        try {
            final Process test = tasklist.start();
        	input = new BufferedReader(new InputStreamReader(test.getInputStream()));
        	
        	String line;
            if ((line = input.readLine()) != null) {
                if (line.contains(applicationExe.executable)) return getPIDFromTaskListLine(line);
            }
        }
        catch(IOException e) {
        	e.printStackTrace(System.err);
        }
        finally {
        	try {
        		if (null != input) input.close();
        	} 
        	catch (IOException e) {
        		// ignore
        	}
        	finally {
        		input = null;
        	}
        }        
	
        return -1;
		
	}	
	
	private static final Pattern PID_PATTERN = Pattern.compile("[^0-9]*([0-9]+).*");
	
	private static int getPIDFromTaskListLine(String line) {
		
		final Matcher m = PID_PATTERN.matcher(line);
		if (!m.matches()) return -1;
		
		final String pidString = m.group(1);
		if (null == pidString) return -1;
		
		return Integer.parseInt(pidString);
		
	}
	


	/**
	 * Check the instance is still running by watching the "locked" file
	 */
	private void watchInstance() {
		
		final File lockedFile = getLockedFile();
		if (null == lockedFile) {
			final String message = String.format("The working file derived from file '%s' cannot be found as expected!", editedFile.getName());
			throw new IllegalStateException(message);
		}
		
		final Watcher<Void> watcher = new Watcher<Void>(WATCH_FREQUENCY_MS) {
			@Override
			protected boolean checkCondition() {
				synchronized (officeProcessRunning) {
					return (!lockedFile.exists()) || !officeProcessRunning ;
				}
			}
		};
		watcher.blockSafeUntilTrue();
		
		notifyAll(new EndOfProcess());
		
	}
	
	/**
	 * Returns the temporary file normally generated by Microsoft Word during
	 * editing
	 * <p>
	 * Abort the operation if not found within 2s.
	 * 
	 * @return the "locked" file if it can be found, else null
	 */
	private File getLockedFile() {

		final Watcher<File> watcher = new Watcher<File>(500, 2000) {
			
			File lockedFile;
			
			@Override
			protected boolean checkCondition() {
				
				final File parentDirectory = editedFile.getParentFile();
				final String editedFileName = editedFile.getName();
				
				final String ownerFileName = "~$" + editedFileName.substring(2);
				lockedFile = new File(parentDirectory, ownerFileName); // owner file
				if (lockedFile.exists()) return true;
				
				final String lockFileName = ".~lock." + editedFileName;
				lockedFile = new File(parentDirectory, lockFileName);
				if (lockedFile.exists()) return true;
				
				lockedFile = null;
				return false;
				
			}
			
			@Override
			protected File getResult() {
				return lockedFile;
			}
			
		};
		return watcher.blockSafeUntilTrue();		
		
	}

}
