package com.bluexml.side.alfresco.applet;

public interface Listener <T> {

	void notify(T event, Object... objects);
	
}
