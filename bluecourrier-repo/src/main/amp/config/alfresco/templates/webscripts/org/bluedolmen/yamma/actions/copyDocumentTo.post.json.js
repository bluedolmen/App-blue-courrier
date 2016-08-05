///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/nodeaction.lib.js">
///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/copy-utils.js">

(function() {
	
	var fullyAuthenticatedUserName = Utils.Alfresco.getFullyAuthenticatedUserName();
	
	
	Yamma.Actions.CopyDocumentToAction = Utils.Object.create(Yamma.Actions.NodeAction, {

		destination : null,
		typeShort : null,
		operation : null,
		aspects : null,
		
		wsArguments : [
			{ name : 'destination', mandatory : true},
			{ name : 'typeShort' },
			{ name : 'aspects' },
			{ name : 'filename' },
			{ name : 'operation', defaultValue : 'copy' }
		],
						
		prepare : function() {
			
			Yamma.Actions.NodeAction.prepare.call(this);
			
			var destination_ = Utils.asString(this.parseArgs['destination']);
			
			if (Utils.Alfresco.isNodeRef(destination_)) {
				this.destination = Utils.Alfresco.getExistingNode(destination_);
			} else if (Utils.String.startsWith(destination_, "service://")) {
				
				var 
				  path = destination_.substring(10, destination_.length),
				  slashIndex = path.indexOf('/'),
				  serviceName = path.substring(0, slashIndex),
				  service = siteService.getSite(serviceName),
				  serviceNode = service.node,
				  directoryPath = path.substring(slashIndex + 1, path.length)
				;
				
				this.destination = serviceNode.childByNamePath(directoryPath);
				// TODO: Check the validity of the target
				
			}
						
			this.typeShort = Utils.asString(this.parseArgs['typeShort']);
			this.aspects = Utils.String.splitToTrimmedStringArray(Utils.asString(this.parseArgs['aspects']));
			this.operation = Utils.asString(this.parseArgs['operation']);
			this.filename = Utils.asString(this.parseArgs['filename']);
			
		},		
		
//		isExecutable : function(node) {
//			
//			// TODO: Should check read/write rights
//			
//		},
		
		doExecute : function(node) {
			
			var 
				node_ = this.node,
				performCopy = ('copy' == this.operation)
			;

			if ('move' == this.operation) {
				
				var success = this.node.move(this.destination);
				if (!success) {
					logger.warn(
						"Cannot move node '" + this.node.nodeRef + "'" +
						" to desintation '" + this.desination.nodeRef + "'." +
						" Performs a copy instead."
					);
					performCopy = true;
				}
				
			}
			
			if (performCopy) {
				node_ = CopyUtils.copyToDestination(this.node, this.destination, this.filename);
				// Set owner to the fully-authenticated user
//				node_.setOwner(fullyAuthenticatedUserName);				
			}
			
			
			if (this.typeShort) {
				node_.specializeType(this.typeShort);
			}
			
			if (this.aspects) {
				Utils.forEach(this.aspects, function(aspect) {
					node_.addAspect(aspect);
				});
			}
			
			return ({
				targetRef : Utils.asString(node_.nodeRef)
			}); // outcome
			
		}		
		
		
	});

	Yamma.Actions.CopyDocumentToAction.execute();
	
})();