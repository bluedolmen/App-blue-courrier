/**
 * This view is related to mail referenced documents
 */
Ext.define('Yamma.view.ReferencesView', {

	extend : 'Bluedolmen.utils.alfresco.grid.AlfrescoStoreGridPanel',
	alias : 'widget.referencesview',
	storeId : 'mailreferences',
	
	DOCUMENT_NAME_LABEL : i18n.t('view.window.referenceview.name_label'),//'Nom',
	DOCUMENT_NAME_QNAME : 'cm:name',
	
	title : i18n.t('view.window.reference.title'),//'Documents associés',
	
	getDockedItemDefinitions : function() {
		return null; // no paging toolbar
	},

	getColumns : function() {
		
		return [
		
			/* Document object */
			this.getObjectColumnDefinition()
		
		];		
	},	
	
	getObjectColumnDefinition : function() {
		
		var coldef = this.applyDefaultColumnDefinition (
			{
				flex : 1,
				text : this.DOCUMENT_NAME_LABEL,
				dataIndex : this.DOCUMENT_NAME_QNAME
			}		
		);
		
		return coldef;
		
	}	
	
});