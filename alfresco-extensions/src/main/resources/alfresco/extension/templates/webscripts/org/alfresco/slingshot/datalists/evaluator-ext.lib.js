var decorateFieldData_ = Evaluator.decorateFieldData;

Evaluator.decorateFieldData = function Evaluator_decorateFieldData(objData, node) {
	
	var 
		value = objData.value,
		type = objData.type,
		obj, array, i, len, node
	;
	
	if (type == "category") {
		
		obj = [];
		array = (value || '').split(',');
		
		for (i = 0, len = array.length; i < len; i++) {
			
			node = search.findNode(array[i]);
			if (null == node) continue;
			
			obj.push(node.properties["cm:name"]);
			
		}
		
		objData.displayValue = obj.join(',');
		
	}
	else {
		
		return decorateFieldData_.apply(this, arguments);
		
	}
	
	return true;
	
}