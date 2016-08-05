(function() {	

	WorkflowCommons = {
			
		getServiceName : function(context) {
			
			var serviceName_;
			
			if ('undefined' != typeof serviceName) return serviceName;
			
			if ('undefined' != typeof executionContext) {
				serviceName_ = BPMUtils.getContextVariable('serviceName');
				if (null != serviceName_) return serviceName_;
			}
			
			if (null == context) {
				
				if ('undefined' != typeof bpm_context && bpm_context.exists()) {
					
					context = bpm_context;
					
				}
				else if ('undefined' != typeof bpm_package) {
					
					context = Utils.Alfresco.BPM.getFirstPackageResource(bpm_package);
					if (null == context) return null;

				}

			}
			
			return Utils.Alfresco.getEnclosingSiteName(context, false /* useCache */);
			
		}
		
	};
	
})();