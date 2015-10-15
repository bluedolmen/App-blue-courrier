
function main_() { // main() is already defined by the import

	if (status.getCode() != status.STATUS_OK) return;
	var 
		commentNode = search.findNode('' + item.node), // this is stored by the Java implementation as a NodeRef
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
