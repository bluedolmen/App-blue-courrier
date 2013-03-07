package com.bluexml.side.alfresco.applet;

import java.util.ArrayList;
import java.util.List;

public class NotifierHelper <T> implements Notifier<T> {

	private List<Listener<T>> listeners = new ArrayList<Listener<T>>();
	
	@Override
	public void register(Listener<T> listener) {
		if (null == listener) {
			throw new IllegalArgumentException(new NullPointerException("The provided listener is invalid"));
		}
		listeners.add(listener);
	}

	@Override
	public void notifyAll(T event, Object... args) {
		for (Listener<T> listener : listeners) {
			if (null == listener) continue;
			listener.notify(event, args);
		}
	}

	
}
