/**
 * Advanced Search component GET method
 */

function main()
{
	var siteId = (page.url.templateArgs["site"] != null) ? page.url.templateArgs["site"] : "";   
	var itemId = page.url.args["itemId"];
   
	function getForm(itemId) {
		
		var formsElements = config.scoped["AdvancedSearch"]["advanced-search"].getChildren("forms");
		
		for (var i = 0, len_i = formsElements.size(); i < len_i; i++) {
			var formsElement = formsElements.get(i).childrenMap['form'];
			for (var j = 0, len_j = formsElement.size(); j < len_j; j++) {
				var form = formsElement.get(j);
				var formValue = form.value;
				
				if (itemId == formValue) return getFormDefinition(form);
			}
			
		}
		
		return null;
	}
	
	function getFormDefinition(formDescription) {
		
		// get optional attributes and resolve label/description text
		var formId = formDescription.attributes["id"];
		var type = formDescription.value;
         
		var label = formDescription.attributes["label"];
		if (!label) {
			var labelId = formDescription.attributes["labelId"];
			if (labelId) label = msg.get(labelId);
		}
		
		var desc = formDescription.attributes['description'];
		if (!desc) {
			var descId = formDescription.attributes['descriptionId'];
			if (descId) desc = msg.get(descId);
		}
        
		return {
			id : formId ? formId : 'search',
			type : type,
			label : label ? label : type,
			description : desc ? desc : ''
		};
		
	}
   	
   
   // Prepare the model
   model.siteId = siteId;
   model.searchForms = [getForm(itemId)];
   
}

main();