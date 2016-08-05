package org.bluedolmen.alfresco.yamma;

import org.alfresco.service.namespace.QName;

/**
 * Define the Yamma Model.
 * 
* @author pajot-b
 *
 */
public interface BlueCourrierModel {

	static final String YAMMA_MODEL_PREFIX = "bluecourrier";
	static final String YAMMA_MODEL_1_0_URI = "http://www.bluedolmen.org/bluecourrier/1.0";
	
    static final QName ASPECT_DOCUMENT = QName.createQName(YAMMA_MODEL_1_0_URI, "document");
    
    static final QName TYPE_DOCUMENT_CONTAINER = QName.createQName(YAMMA_MODEL_1_0_URI, "documentContainer");
    static final QName ASSOC_DOCUMENT_REFERENCE = QName.createQName(YAMMA_MODEL_1_0_URI, "referenceDocument");
    
    static final QName ASPECT_STATUSABLE = QName.createQName(YAMMA_MODEL_1_0_URI, "statusable");
    static final QName PROP_STATUSABLE_STATE = QName.createQName(YAMMA_MODEL_1_0_URI, "status");

	static final QName ASPECT_SERVICE = QName.createQName(YAMMA_MODEL_1_0_URI, "service");
    
    static final QName ASPECT_TRAY = QName.createQName(YAMMA_MODEL_1_0_URI, "tray");
	
    static final QName ASPECT_MAIL = QName.createQName(YAMMA_MODEL_1_0_URI, "mail");    
	static final QName ASPECT_REPLY = QName.createQName(YAMMA_MODEL_1_0_URI, "reply");
	static final QName ASPECT_OUTBOUND_MAIL = QName.createQName(YAMMA_MODEL_1_0_URI, "outboundMail");
	
	static final QName ASPECT_COPIED_FROM = QName.createQName(YAMMA_MODEL_1_0_URI, "copiedfrom");
	
	static final QName PROP_SHARES = QName.createQName(YAMMA_MODEL_1_0_URI, "shares");
	
	static final QName FOLLOWED_BY = QName.createQName(YAMMA_MODEL_1_0_URI, "followedBy");
	
}
