package com.bluexml.alfresco.barcode.extracter;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.pdfbox.exceptions.CryptographyException;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.encryption.BadSecurityHandlerException;
import org.apache.pdfbox.pdmodel.encryption.StandardDecryptionMaterial;
import org.ghost4j.document.DocumentException;
import org.ghost4j.renderer.RendererException;

public final class PdfBoxBarcodeExtracter extends ZXingBasedBarcodeExtracter {
	
    private static final String PDF_DEFAULT_PASSWORD = "";
	private final Log logger = LogFactory.getLog(getClass());
	private int resolution = 300;
	
	@Override
	protected BufferedImage extractFirstPageAsImage(InputStream inputStream) throws IOException, DocumentException, RendererException, BadSecurityHandlerException, CryptographyException {
		
        final PDDocument document = PDDocument.load(inputStream);

        if (document.isEncrypted()) {
            // Encrypted means password-protected, but PDF allows for two passwords: "owner" and "user".
            // A "user" of a document should be able to read (but not modify) the content.
            //
            // We'll attempt to open the document using the common PDF default password.
            document.openProtection(new StandardDecryptionMaterial(PDF_DEFAULT_PASSWORD));
        }
        
        boolean canExtractContent = document.getCurrentAccessPermission().canExtractContent();
        if (!canExtractContent) {
            if (logger.isDebugEnabled()) {
                logger.debug("PDF document's intrinsic permissions forbid content extraction.");
            }
            return null;
        }
        
        final List<?> pages = document.getDocumentCatalog().getAllPages();
        final PDPage firstPage = (PDPage) pages.get(0);
        final BufferedImage image = firstPage.convertToImage(BufferedImage.TYPE_INT_RGB, resolution);
   
        inputStream.close();

        return image;
        
	}


	public void setResolution(int resolution) {
		this.resolution = resolution;
	}
}
