package org.bluedolmen.alfresco.pdf.itext;

import org.bluedolmen.alfresco.pdf.PdfOperationConfig;

public abstract class AbstractITextExtension {

	private ITextMerger merger;
	
	public void register() {
		merger.register(this);
	}
	
	public boolean isActive(PdfOperationConfig config) {
		return false;
	}
	
	public void setMerger(ITextMerger merger) {
		this.merger = merger;
	}
	
}
