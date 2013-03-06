package com.bluexml.alfresco.pdf.rendering;

import org.alfresco.repo.content.MimetypeMap;
import org.alfresco.repo.rendition.executer.AbstractTransformationRenderingEngine;
import org.alfresco.service.cmr.repository.TransformationOptions;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

public class PdfRenderingEngine extends AbstractTransformationRenderingEngine {
	
    private static Log logger = LogFactory.getLog(PdfRenderingEngine.class);
    public static final String NAME = "pdfRenderingEngine";

    @Override
    protected String getTargetMimeType(RenderingContext context) {
    	return MimetypeMap.MIMETYPE_PDF;
    }

    @Override
    protected TransformationOptions getTransformOptions(RenderingContext context) {
    	return getTransformOptionsImpl(new TransformationOptions(), context);
    }

    @Override
    protected TransformationOptions getTransformOptionsImpl(TransformationOptions options, RenderingContext context) {
		options.setSourceNodeRef(context.getSourceNode());
		options.setTargetNodeRef(context.getDestinationNode());
		
		return super.getTransformOptionsImpl(options, context);
    }

}
