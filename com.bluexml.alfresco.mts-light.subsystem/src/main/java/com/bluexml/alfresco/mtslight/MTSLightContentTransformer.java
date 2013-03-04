package com.bluexml.alfresco.mtslight;

import org.alfresco.repo.content.transform.ProxyContentTransformer;

public class MTSLightContentTransformer extends ProxyContentTransformer {

	private boolean forceUse = false;

    public MTSLightContentTransformer() {
	}
    
	/**
	 * This method is overridden in order for this transformer to be chosen at
	 * each time. Otherwise, another transformer (like Openoffice) may be used
	 * instead
	 * <p>
	 * If we want to rely on the current implementation based on the raw time
	 * performances of the transformer, then setting the parameter
	 * <code>forceUse</code> by using the appropriate bean setter will keep the
	 * normal behavior
	 */
	@Override
	public long getTransformationTime() {
	
		if (forceUse) return 0;
		else return super.getTransformationTime();
		
	}
	
	public void setForceUse(boolean forceUse) {
		this.forceUse = forceUse;
	}
	
}
