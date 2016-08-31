Ext.define('Yamma.view.categories.UpdateCategoryForm', {

	extend : 'Yamma.view.categories.CategoryForm',
	
    title: i18n.t('view.updatecategory.title'), //"Mise à jour d'une catégorie",
    buttonText : i18n.t('view.updatecategory.buttonText'),
    httpMethod : 'PUT'
	
});