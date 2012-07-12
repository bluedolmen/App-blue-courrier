(function() {	

	DocumentUtils = {
		
		isCopy : function(documentNode) {
			if (!DocumentUtils.isDocumentNode(documentNode))
				throw new Error('IllegalArgumentException! The provided node is not of the correct type');
			
			var originalAssocs = documentNode.assocs[YammaModel.DOCUMENT_COPY_ORIGINAL_ASSOCNAME];
			return (null != originalAssocs) && (originalAssocs.length > 0);			
		},
		
		getLateState : function(documentNode) {
			if (!documentNode) return YammaModel.LATE_STATE_UNDETERMINED;
			
			var dueDate = documentNode.properties[YammaModel.PRIORITIZABLE_DUE_DATE_PROPNAME];
			if (!dueDate) return YammaModel.LATE_STATE_UNDETERMINED;
			
			var now = new Date();
			return (now.getTime() - dueDate.getTime() > 0) ? YammaModel.LATE_STATE_LATE : YammaModel.LATE_STATE_ONTIME;
		},
		
		isDocumentDelivered : function(documentNode) {
			
			if (!DocumentUtils.isDocumentNode(documentNode))
				throw new Error('IllegalArgumentException! The provided node is not of the correct type');
			
			var enclosingSite = YammaUtils.getSiteNode(documentNode);
			if (!enclosingSite) return false;
			
			var enclosingSiteName = enclosingSite.name;
				
			var assignedService = DocumentUtils.getAssignedService(documentNode); 
			if (!assignedService) return false;		
			
			var assignedServiceName = assignedService.name;
			if (!assignedServiceName) return false;
			
			return Utils.asString(enclosingSiteName) == Utils.asString(assignedServiceName); // String Object-s
		},
		
		isDocumentDelivering : function(documentNode) {
			
			if (!DocumentUtils.isDocumentNode(documentNode))
				throw new Error('IllegalArgumentException! The provided node is not of the correct type');
				
			var documentState = documentNode.properties[YammaModel.STATUSABLE_STATE_PROPNAME];
			var isDelivering = YammaModel.DOCUMENT_STATE_DELIVERING == Utils.asString(documentState); 
			
			return isDelivering;
		},
		
		getAssignedService : function(documentNode) {
			if (!DocumentUtils.isDocumentNode(documentNode))
				throw new Error('IllegalArgumentException! The provided documentNode is not of the correct type');
			
			var assignedService = documentNode.assocs[YammaModel.ASSIGNABLE_SERVICE_ASSOCNAME];
			if (!assignedService || 0 == assignedService.length ) return null;
			
			var firstAssignedService = assignedService[0];
			return firstAssignedService;
		},
		
		getAssignedAuthority : function(documentNode) {
			if (!DocumentUtils.isDocumentNode(documentNode))
				throw new Error('IllegalArgumentException! The provided documentNode is not of the correct type');
			
			var assignedAuthority = documentNode.assocs[YammaModel.ASSIGNABLE_AUTHORITY_ASSOCNAME];
			if (!assignedAuthority || 0 == assignedAuthority.length ) return null;
			
			var firstAssignedAuthority = assignedAuthority[0];
			return firstAssignedAuthority;			
		},
		
		getDistributedServices : function(documentNode) {
			if (!DocumentUtils.isDocumentNode(documentNode))
				throw new Error('IllegalArgumentException! The provided documentNode is not of the correct type');
			
			return documentNode.assocs[YammaModel.DISTRIBUTABLE_SERVICES_ASSOCNAME] || [];
		},
		
		isDocumentNode : function(documentNode) {
			return documentNode && ('undefined' != typeof documentNode.isSubType) && documentNode.isSubType(YammaModel.DOCUMENT_TYPE_SHORTNAME);
		}
		
	};

})();
