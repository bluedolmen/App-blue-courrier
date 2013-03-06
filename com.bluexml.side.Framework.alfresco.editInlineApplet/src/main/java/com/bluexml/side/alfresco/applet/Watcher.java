package com.bluexml.side.alfresco.applet;

import java.util.Date;

public abstract class Watcher <T> {
		
	private static final long DEFAULT_WATCH_FREQUENCY_MS = 1000; 
	private final long watchFrequencyMS;
	private final long abortAfterTimeMS;
	
	public Watcher() {
		this(DEFAULT_WATCH_FREQUENCY_MS);
	}
	
	public Watcher(long watchFrequencyMS) {
		this(watchFrequencyMS, -1);
	}
	
	public Watcher(long watchFrequencyMS, long abortAfterTimeMS) {
		if (watchFrequencyMS <= 10) {
			throw new IllegalArgumentException("The watch-time has to be a positive integer greater than 10ms");
		}
		this.watchFrequencyMS = watchFrequencyMS;
		
		if (abortAfterTimeMS < watchFrequencyMS) {
			throw new IllegalArgumentException("The abort time cannot be less than the watch-time");
		}
		this.abortAfterTimeMS = abortAfterTimeMS > watchFrequencyMS ? abortAfterTimeMS : -1;
	}	

	protected boolean checkCondition() {
		return false;
	}
	
	protected void doWhileWatching() throws InterruptedException {
		// DO NOTHING
	}
	
	protected T blockSafeUntilTrue() {

		try {
			return blockUntilTrue();
		}
		catch (InterruptedException e) {
			return null;
		}
		
	}
	
	protected T blockUntilTrue() throws InterruptedException {
		
		final long startTime = new Date().getTime();
		while (!checkCondition()) {
			
			doWhileWatching();
			Thread.sleep(watchFrequencyMS);
			
			final Date now = new Date();
			if (now.getTime() - startTime > abortAfterTimeMS) {
				throw new InterruptedException("Aborted after time-limit reached"); // abort after X sec
			}
			
		}
		
		return getResult();
		
	}
	
	protected T getResult() {
		return null;
	}
	
}
