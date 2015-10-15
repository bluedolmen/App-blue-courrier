package org.bluedolmen.alfresco.delegates;

import org.alfresco.service.namespace.QName;


public final class DelegateModel {

	public static final String DGT_MODEL_1_0_URI = "http://www.bluedolmen.org/model/dgt/1.0";
	
	public static final QName TYPE_DELEGATE = QName.createQName(DGT_MODEL_1_0_URI, "delegate");
	public static final QName PROP_FROM_DATE = QName.createQName(DGT_MODEL_1_0_URI, "fromDate");
	public static final QName PROP_DEFAULT_ASSIGNEE = QName.createQName(DGT_MODEL_1_0_URI, "defaultAssignee");
	public static final QName ASSOC_AUTHORITY = QName.createQName(DGT_MODEL_1_0_URI, "authority");
	
	public static final QName ASPECT_DELEGATING = QName.createQName(DGT_MODEL_1_0_URI, "delegating");
	public static final QName ASSOC_DELEGATES = QName.createQName(DGT_MODEL_1_0_URI, "delegates");
	
	private DelegateModel(){};
}
