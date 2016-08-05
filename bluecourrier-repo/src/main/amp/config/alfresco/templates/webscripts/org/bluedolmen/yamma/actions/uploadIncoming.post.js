///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/nodeaction.lib.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/distributeAction.lib.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/alfresco/repository/upload/upload.post.js">

(function() {
	
	if (status.code >= 300) return; // error during upload
	
	function checkTargetService(targetService) {
		targetService = Utils.asString(targetService);
		if (!targetService) return '';
		if (!ServicesUtils.isService(targetService)) return "The name '" + targetService + "' does not match any existing service.";
		return '';
	}
	
	var 
		document = model.document,
		parseArgs = new ParseArgs([
			{ name : 'targetService', checkValue : checkTargetService },
			'copyServices',
			'copyUsers',
			'validateDelivery',
			'startDelivery'
		]),
		targetService = Utils.asString(parseArgs['targetService']),
		copyServices = Utils.String.splitToTrimmedStringArray(Utils.asString(parseArgs['copyServices']), ','),
		copyUsers = Utils.String.splitToTrimmedStringArray(Utils.asString(parseArgs['copyUsers']), ','),
		copies = ''
			+ Utils.reduce(copyServices, function(el, result, isLast) { return result + 'ser_' + el + (isLast ? '' : ','); }, '')
			+ Utils.reduce(copyUsers, function(el, result, isLast) { return result + 'loc_' + el + (isLast ? '' : ','); }, ''),
		validateDelivery = parseArgs['validateDelivery'],
		startDelivery = parseArgs['startDelivery']
	;
	
	document.addAspect(YammaModel.DISTRIBUTABLE_ASPECT_SHORTNAME);
	
//	if (targetService) {
//		document.properties[YammaModel.DISTRIBUTABLE_SERVICE_PROPNAME] = targetService;
//	}

	if (copies) {
		copies = Yamma.DeliveryUtils.decode(copies, true /* performCheck */);
		document.properties[YammaModel.DISTRIBUTABLE_SHARES_PROPNAME] = copies.encode();
	}
	
	if (null != validateDelivery) {
		document.properties[YammaModel.DISTRIBUTABLE_VALIDATE_DELIVERY_PROPNAME] = Utils.asString(validateDelivery) == 'true';
	}
	
	if (null != startDelivery) {
		document.properties[YammaModel.DISTRIBUTABLE_START_DELIVERY_PROPNAME] = Utils.asString(startDelivery) == 'true';
	}
	
	document.save();
	
	model.document = document;
	model.tasks = Utils.Array.map(
		workflowUtils.getTasksForNode(document), 
		function(task) {
			return {
				id : task.id,
				name : task.name
			};
		}
	);
	
})();