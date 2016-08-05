package org.bluedolmen.alfresco.acs;

import java.io.Serializable;
import java.net.MalformedURLException;
import java.net.URL;

import org.alfresco.error.AlfrescoRuntimeException;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.repo.security.authentication.AuthenticationUtil.RunAsWork;
import org.bluedolmen.alfresco.app.GlobalConfig;

public final class ACSServiceImpl implements ACSService {

	private static final String ACS_PATH_PREFIX = "yamma.acs.";
	
	protected static final String P_ID = "page";
	protected static final String P_PROPERTY = "property";
	protected static final String P_ACTIVE = "active";
	protected static final String P_REGION = "region";
	protected static final String P_SOURCE = "source";
	protected static final String P_HEIGHT = "height";
	protected static final String P_WIDTH = "width";
	protected static final String DEFAULT_PAGE_ID = "default";
	
	/* (non-Javadoc)
	 * @see org.bluedolmen.alfresco.acs.ACSService#isActive()
	 */
	public boolean isActive() {
		
		return getValue(null, P_ACTIVE, false, Boolean.class);
		
	}
	
	/* (non-Javadoc)
	 * @see org.bluedolmen.alfresco.acs.ACSService#setActive(boolean)
	 */
	public void setActive(boolean active) {
		
		setValueChecked(null, P_ACTIVE, active);
		
	}
	
	/* (non-Javadoc)
	 * @see org.bluedolmen.alfresco.acs.ACSService#getRegion()
	 */
	public String getRegion(String pageId) {
		
		return getValue(pageId, P_REGION, "east", String.class); 
		
	}
		
	/* (non-Javadoc)
	 * @see org.bluedolmen.alfresco.acs.ACSService#setRegion(java.lang.String)
	 */
	public void setRegion(String pageId, String region) {
		
		if (null == region || !("east".equals(region) || "south".equals(region)) ) {
			throw new IllegalArgumentException("The region can only be set to east or south");
		}
		
		setValueChecked(pageId, P_REGION, region);
		
	}
	
	/* (non-Javadoc)
	 * @see org.bluedolmen.alfresco.acs.ACSService#getHeight()
	 */
	public int getHeight(String pageId) {
		
		return getValue(pageId, P_HEIGHT, -1, Integer.class);
		
	}
	
	/* (non-Javadoc)
	 * @see org.bluedolmen.alfresco.acs.ACSService#setHeight(int)
	 */
	public void setHeight(String pageId, int height) {
		
		if (-1 != height && (height <= 16 || height > 2000)) {
			throw new IllegalArgumentException("The height cannot be set to less than 16px and greather than 2000px");
		}
		
		setValueChecked(pageId, P_HEIGHT, height);
		
	}

	/* (non-Javadoc)
	 * @see org.bluedolmen.alfresco.acs.ACSService#getWidth()
	 */
	public int getWidth(String pageId) {
		
		return getValue(pageId, P_WIDTH, -1, Integer.class);
		
	}
	
	/* (non-Javadoc)
	 * @see org.bluedolmen.alfresco.acs.ACSService#setWidth(int)
	 */
	public void setWidth(String pageId, int width) {
		
		if (-1 != width && (width <= 16 || width > 2000) ) {
			throw new IllegalArgumentException("The width cannot be set to less than 16px and greather than 2000px");
		}
		
		setValueChecked(pageId, P_WIDTH, width);
		
	}
	
	/* (non-Javadoc)
	 * @see org.bluedolmen.alfresco.acs.ACSService#getSource()
	 */
	public String getSource(String pageId) {
		
		return getValue(pageId, P_SOURCE, null, String.class);
		
	}
	
	/* (non-Javadoc)
	 * @see org.bluedolmen.alfresco.acs.ACSService#setSource(java.lang.String)
	 */
	public void setSource(String pageId, String source) {
		
		if (null == source || source.isEmpty()) {
			throw new IllegalArgumentException("The source URL has to be a valid URL");
		}
		
		try {
			new URL(source);
		} catch (MalformedURLException e) {
			throw new IllegalArgumentException("The source URL has to be a valid URL");
		}
		
		setValueChecked(pageId, P_SOURCE, source);
		
	}
	
	public void resetValue(final String pageId, final String property) {
		
		if (! AuthenticationUtil.getAdminUserName().equals(AuthenticationUtil.getRunAsUser()) ) {
			throw new IllegalAccessError("Only the admin user is authorized to perform a reset of the counter");
		}
		
		AuthenticationUtil.runAs(
				
			new RunAsWork<Void>() {
				
				public Void doWork() throws Exception {
					
					globalConfig.removeValue(ACS_PATH_PREFIX + (null != pageId && !pageId.isEmpty() ? pageId : DEFAULT_PAGE_ID) + (null != property ? "."  + property : ""));
					return null;
					
				}
		
			},
			
			AuthenticationUtil.getSystemUserName()
			
		);
		
	}

	
	private <T> T getValue(final String pageId, final String key, T defaultValue, Class<T> class_) {
		
		final boolean pageIsUndefined = pageId == null || pageId.isEmpty();
		
		Object value = globalConfig.getValue(ACS_PATH_PREFIX + (pageIsUndefined ? DEFAULT_PAGE_ID : pageId ) + "." + key);
		if (null == value && !pageIsUndefined) {
			value = globalConfig.getValue(ACS_PATH_PREFIX + DEFAULT_PAGE_ID + "." + key); // get defaults
		}
		
		if (null == value) return defaultValue;
		
		if (!class_.isInstance(value)) {
			throw new AlfrescoRuntimeException(String.format("Cannot get value of type class '%s' for key '%s'", class_.getName(), key));
		}
		
		return class_.cast(value);
		
	}	
	
	private void setValueChecked(final String pageId, final String key, final Serializable value) {
		
		if (! AuthenticationUtil.getAdminUserName().equals(AuthenticationUtil.getRunAsUser()) ) {
			throw new IllegalAccessError("Only the admin user is authorized to perform a reset of the counter");
		}
		
		if (null == key) {
			throw new IllegalArgumentException("The property key has to be non-null");
		}
		
		AuthenticationUtil.runAs(
				
			new RunAsWork<Void>() {
				
				public Void doWork() throws Exception {
					
					globalConfig.setValue(ACS_PATH_PREFIX + (null != pageId && !pageId.isEmpty() ? pageId : DEFAULT_PAGE_ID) + "." + key, value);
					return null;
					
				}
		
			},
			
			AuthenticationUtil.getSystemUserName()
			
		);
	
	}
	
		
	/*
	 * Spring IoC/DI material
	 */
	
	private GlobalConfig globalConfig;
	
	public void setGlobalConfig(GlobalConfig globalConfig) {
		this.globalConfig = globalConfig;
	}
	
	
}
