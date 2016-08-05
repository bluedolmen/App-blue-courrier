package org.bluedolmen.alfresco.acs;

public interface ACSService {

	public abstract boolean isActive();

	public abstract void setActive(boolean active);

	public abstract String getRegion(String pageId);

	public abstract void setRegion(String pageId, String region);

	public abstract int getHeight(String pageId);

	public abstract void setHeight(String pageId, int height);

	public abstract int getWidth(String pageId);

	public abstract void setWidth(String pageId, int width);

	public abstract String getSource(String pageId);

	public abstract void setSource(String pageId, String source);

	public abstract void resetValue(String pageId, String property);
	
}