(function() {
	
	function canFollow(node, userName) {
		
		if (!node) return false;
		if (!node.hasPermission('Read')) return false;
		
		return Utils.Alfresco.hasPermission(node, 'Read', userName);
		
	}
	
	FollowingUtils = {
			
		FOLLOWING_FOLLOWED_BY_QNAME : YammaModel.FOLLOWING_FOLLOWED_BY_PROPNAME,
		
		isFollowing : function(node, userName) {
			
			if (null == node) return false;
			
			userName = userName || Utils.Alfresco.getFullyAuthenticatedUserName();
			var currentlyFollowedBy = node.properties[FollowingUtils.FOLLOWING_FOLLOWED_BY_QNAME] || [];
			return (Utils.contains(currentlyFollowedBy, userName));
			
		},
			
		follow : function(node, userName, userPermission) {
			
			function setUserAccess(document) {
				
				var documentContainer = DocumentUtils.getDocumentContainer(document);
	
				if (null === userPermission) return; // explicit null, do not set user-permissions
//				if (hasUserDirectAccess()) return;
				documentContainer.setPermission(userPermission || 'Consumer', userName);
				
			}
			
			function hasUserDirectAccess() {
				// TODO: Check further the exact permission? (Read, Consumer, Collaborator, ...)
				return !Utils.Array.isEmpty(Utils.Alfresco.getAllowedPermissionsForAuthority(userName));
			}
			
			if (null == node) {
				throw new Error('IllegalArgumentException! The provided not is not valid (null)');
			}
			
			if (!canFollow(node, userName)) {
				throw new Error("IllegalAccessException! User '" + userName + "' is not allowed to follow the node '" + node.nodeRef + " (no read-access?)'");
			}
			
			userName = userName || Utils.Alfresco.getFullyAuthenticatedUserName();
			
			var currentlyFollowedBy = node.properties[FollowingUtils.FOLLOWING_FOLLOWED_BY_QNAME] || [];
			if (Utils.contains(currentlyFollowedBy, userName)) return false;
			
			currentlyFollowedBy.push(userName);
			node.properties[FollowingUtils.FOLLOWING_FOLLOWED_BY_QNAME] = currentlyFollowedBy;
			node.save();
			
			setUserAccess(node);
			
			return true;
			
		},
		
		unfollow : function(node, userName) {
			
			if (null == node) {
				throw new Error('IllegalArgumentException! The provided not is not valid (null)');
			}
			
			userName = userName || Utils.Alfresco.getFullyAuthenticatedUserName();
			
			var 
				currentlyFollowedBy = node.properties[FollowingUtils.FOLLOWING_FOLLOWED_BY_QNAME] || [],
				index = Utils.Array.indexOf(currentlyFollowedBy, userName)
			;
			
			if (index < 0) return false; // does not exist
			
			Utils.Array.remove(currentlyFollowedBy, index);
			node.properties[FollowingUtils.FOLLOWING_FOLLOWED_BY_QNAME] = currentlyFollowedBy;
			node.save();
			
			return true;
			
		},
		
		discardFollowings : function(node) {
			
			if (null == node) {
				throw new Error('IllegalArgumentException! The provided not is not valid (null)');
			}
			
			node.properties[FollowingUtils.FOLLOWING_FOLLOWED_BY_QNAME] = null;
			node.save();
			
		},
		
		getFollowedNodes : function(userName, limits) {
			
			limits = limits || {};
			
			if (null == userName) {
				userName = Utils.Alfresco.getFullyAuthenticatedUserName();
			}
			
			if (null != limits.type || null != limits.aspects) {
				logger.warn('Does not support limits paramter ; this parameter will be ignored.')
			}
			
			return yammaHelper.queryFollowing(userName);
			

			// Obsoleted due to SolR eventual consistency
			function searchWithLucene() {
				
				var luceneRequest = '' 
					+ ( Utils.isString(limits.type) ?
							'+TYPE:"' + limits.type + '"'
							: ''
					)
					+ ( null != limits.aspects && !Utils.Array.isEmpty(limits.aspects) ?
							
							'+('
							+ Utils.Array.map(limits.aspects, function(aspect) {
								return 'ASPECT:"' + aspect + '" ';
							}) 
							+ ')'
							
							: ''
					)
					+ ' +' + Utils.Alfresco.getLuceneAttributeFilter(FollowingUtils.FOLLOWING_FOLLOWED_BY_QNAME, userName)
				;
				
				return search.luceneSearch(luceneRequest) || [];
				
			}
			
		}
			
	};
	
})();