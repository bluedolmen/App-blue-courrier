package com.bluexml.side.alfresco.applet;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;

public class PIDWatcher implements Notifier<PIDWatcher.PIDWatcherEvent>, Runnable {

	private static final long WATCH_FREQUENCY_MS = 10 * 1000; // 10 sec
	
	// FACTORY
	
	private static Map<Integer, PIDWatcher> instances = new HashMap<Integer, PIDWatcher>();

	public static PIDWatcher createWatcher(Integer pid) {
		
		if (!instances.containsKey(pid)) {
			instances.put(pid, new PIDWatcher(pid));
		}
		
		return instances.get(pid);
		
	}
	
	
	
	// MAIN DEFINITION
	
	private final Integer pid;
	
	private PIDWatcher(Integer pid) {
		this.pid = pid;
	}
	
	public void launch() {
		new Thread(this).start();
	}
	
	@Override
	public void run() {
		
		final Watcher<Void> watcher = new Watcher<Void>(WATCH_FREQUENCY_MS) {
			
			@Override
			protected boolean checkCondition() {
				
				try {
					return isPIDRunning();
				} catch(IOException e) {	
				}
				
				return false;
			}
			
		};
		watcher.blockSafeUntilTrue();
		
		notifyAll(new ProcessEnded());
		
	}
	
	
	/**
	 * Check the Windows task-list to verify whether there is still an instance
	 * of Word running
	 * 
	 * @return true if an instance can be found
	 * @throws IOException
	 */
	private boolean isPIDRunning() throws IOException {
		
		/*
		 * Uses tasklist to get the current running processes. We should be able
		 * to use tasklist with the PID filter (/fi "pid eq nPID"), however this
		 * is buggy with Windows XP in the french edition. So we use a trick
		 * based on a combination of tasklist and find to get the result. This
		 * is probably much less effective but however do the job...
		 */
		
        //final String[] command = { "tasklist.exe", "/nh /fi", "\"pid eq " + pid + "\"" };
		final String[] command = { "wmic", "process", "where", "\"Processid=" + pid + "\"", "get", "Processid" };
		final ProcessBuilder tasklist = new ProcessBuilder(command);
        final Process test = tasklist.start();
        
        BufferedReader input = null;
        try {
        	input = new BufferedReader(new InputStreamReader(test.getInputStream()));
        	
        	String line;
            if ((line = input.readLine()) != null) {
            	if (line.startsWith(pid.toString())) return true;
            }
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
	
        return false;
	}	
	
	
	// NOTIFIER
	
	public static interface PIDWatcherEvent{};
	public static class ProcessEnded implements PIDWatcherEvent{}
	private NotifierHelper<PIDWatcherEvent> notifierHelper = new NotifierHelper<PIDWatcher.PIDWatcherEvent>(); 
	
	@Override
	public void register(Listener<PIDWatcherEvent> listener) {
		notifierHelper.register(listener);		
	}

	@Override
	public void notifyAll(PIDWatcherEvent event, Object... args) {
		notifierHelper.notifyAll(event, args);
	}

}
