(function(){
		
	DatasourceDefinitions.register('ServicePeople',
	{
		searchAdditional : {
			
			listnodes : function(params) {
				
				var serviceName = params.getFilterValue('service');
				if (!serviceName)
					throw new Error("[DataSource.ServicePeople] IllegalStateException! There should be a filter named 'service'");
					
				var 
					role = params.getFilterValue('role') || ServicesUtils.SERVICE_INSTRUCTOR_ROLENAME,
					members = ServicesUtils.getServiceRoleMembers(serviceName, role)
				;
				
				return members;
				
			},
			
			page : {
				maxItems: 1000,
				skipCount: 0
			}
			
		},
		
		fields : [
	          {
	        	  name : 'userName',
	        	  propertyName : 'cm:userName'
	          },
	          {
	        	  name : 'firstName',
	        	  propertyName : 'cm:firstName'
	          },
	          {
	        	  name : 'lastName',
	        	  propertyName : 'cm:lastName'
	          },
	          {
	        	  name : 'email',
	        	  propertyName : 'cm:email'
	          }
		          
		]		
		
		
	});
	
})();