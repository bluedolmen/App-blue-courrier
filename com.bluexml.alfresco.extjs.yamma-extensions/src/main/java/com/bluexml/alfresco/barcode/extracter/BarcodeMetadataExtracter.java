package com.bluexml.alfresco.barcode.extracter;

import java.io.InputStream;
import java.io.Serializable;
import java.util.Collections;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.alfresco.repo.content.MimetypeMap;
import org.alfresco.repo.content.metadata.AbstractMappingMetadataExtracter;
import org.alfresco.service.cmr.repository.ContentReader;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

public class BarcodeMetadataExtracter extends AbstractMappingMetadataExtracter {

	private static final Log logger = LogFactory.getLog(BarcodeMetadataExtracter.class);
    private static final String KEY_REFERENCE = "reference";
	
    public static final Set<String> MIMETYPES = new HashSet<String>(5);
    static {
        MIMETYPES.add(MimetypeMap.MIMETYPE_PDF);
    }
    
    private BarcodeExtracter barcodeExtracter;

    public BarcodeMetadataExtracter()
    {
        super(MIMETYPES);
    }	
	
	@Override
	protected Map<String, Serializable> extractRaw(ContentReader reader) throws Throwable {
		
		final Map<String, Serializable> result = newRawMap();
		final InputStream contentInputStream = reader.getContentInputStream();
		final String reference = barcodeExtracter.extractSafe(contentInputStream);
		
		if (null != reference) {
			if (logger.isDebugEnabled()) {
				logger.debug(String.format("BarcodeMetadataExtracter identified the content with reference='%s'", reference));
			}
			putRawValue(KEY_REFERENCE, reference, result);
		}
		
		return result;
		
	}
	
	@Override
	protected java.util.Map<String,java.util.Set<org.alfresco.service.namespace.QName>> getDefaultMapping() {
		return Collections.emptyMap();
	}	

	public void setBarcodeExtracter(BarcodeExtracter barcodeExtracter) {
		this.barcodeExtracter = barcodeExtracter;
	}
	
}
