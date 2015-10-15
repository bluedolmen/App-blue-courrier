///<import resource="classpath:alfresco/templates/webscripts/org/alfresco/repository/comments/comment.put.json.js">

function main_() { // main() is already defined by the import

	if (status.getCode() != status.STATUS_OK) return;
	var 
		commentNode = model.item.node, // this is stored by main()
		permissions = json.get('permissions')
	; 
	
	function toArray(jsonArray) {
		var i, len, result = [];
		for (i = 0, len = jsonArray.length(); i < len; i++) {
			result.push(jsonArray.get(i));
		}
		return result;
	}
	
	// permissions is a JSON Array (object), we need a native JS array
	permissions = toArray(permissions);
	
	bdNodeUtils.comments.setCommentAsPrivate(commentNode, permissions);
	
}

main_();
