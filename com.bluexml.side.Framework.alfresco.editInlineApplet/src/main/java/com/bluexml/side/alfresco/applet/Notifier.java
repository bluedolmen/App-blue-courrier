package com.bluexml.side.alfresco.applet;

public interface Notifier <T> {

	void register(Listener<T> listener);
	
	void notifyAll(T event, Object... args);
	
}
