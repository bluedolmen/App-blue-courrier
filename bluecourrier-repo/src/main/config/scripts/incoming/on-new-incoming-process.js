///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/delivery-models-utils.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/distributeAction.lib.js">

(function() {
	
	var
		document = BPMUtils.getFirstPackageResource()
	;
	
	main();
	
	function main() {
		
		presetProcessVariables();
		setProcessKind();
		setStartingDate();
		addHistoryEvent();
		protectAttachments();
		
	}
	
	function presetProcessVariables() {
		
		var 
			deliveryModelNode = DeliveryModelsUtils.getBestMatchingDeliveryModelForNode(document),
			mappings = [
				{
					property : YammaModel.DISTRIBUTABLE_SHARES_PROPNAME,
					check : checkShares,
					variable : 'bcinwf_shares'
				},
				
				{
					property : YammaModel.DISTRIBUTABLE_PROCESS_KIND_PROPNAME,
					check : checkProcessKind,
					variable : 'bcinwf_processKind'
				},
				
				{
					property : YammaModel.DISTRIBUTABLE_VALIDATE_DELIVERY_PROPNAME,
					variable : 'bcinwf_validateDelivering'
				}
			]
		;
		
		if (null == deliveryModelNode) return;
		
		setProcessVariables();
		
		function checkShares() {
			
			propertyValue = deliveryModelNode.properties[YammaModel.DISTRIBUTABLE_SHARES_PROPNAME];
			if (null == propertyValue) return;
			
			propertyValue = Yamma.DeliveryUtils.decode(propertyValue, true /* performCheck */);
			return propertyValue.encodeAsString()
			
		}
		
		function checkProcessKind() {
			
			propertyValue = Utils.wrapString(deliveryModelNode.properties[YammaModel.DISTRIBUTABLE_PROCESS_KIND_PROPNAME]);
			if (null == propertyValue) return;
			
			if (!Utils.Array.contains(Yamma.DeliveryUtils.PROCESS_KINDS, propertyValue)) return Yamma.DeliveryUtils.getDefaultProcessKind();
			return propertyValue;
			
		}
		
		function setProcessVariables() {
			
			Utils.forEach(mappings, function(mapping) {
				
				var
					check = mapping.check,
					value = deliveryModelNode.properties[mapping.property]
				;
				
				if (Utils.isFunction(check)) {
					value = check(value);
				}
				
				if (null == value) return; // continue
				
				execution.setVariable(mapping.variable, value);
				
			});
			
		}
		
	}
	

	/**
	 * Copy the existing process-kind to the document metadata (for search
	 * purpose)
	 * <p>
	 * TODO: This should be made properly with a helper which should forbid
	 * any future modifications
	 */
	function setProcessKind() {
		
		var processKind = Utils.asString(BPMUtils.getContextVariable('bcinwf_processKind'));

		if (processKind) {
			document.properties['bluecourrier:processKind'] = processKind;
			document.save();
		}
		
	}
	
	function setStartingDate() {
		
		document.properties['bcinwf:startProcessingDate'] = new Date(); // residual property
		document.save();
		
	}
	

	/**
	 * This part will change ownership of the attachment. Considering the
	 * SiteCollaborator permission which is normally set on the parent, this
	 * will be sufficient to prevent the user from deleting the attachment.
	 * <p>
	 * If the permissions are changed in the future, we may need to break
	 * inheritance of permissions setting the appropriate rights on each
	 * attachment.
	 */
	function protectAttachments() {
		
		var attachments = AttachmentUtils.getAttachments(document);
		Utils.forEach(attachments, function(attachment) {
			attachment.setOwner('admin');
		});
		
	}
	
	function addHistoryEvent() {
		
		var
			processKind = Utils.asString(BPMUtils.getContextVariable('bcinwf_processKind')),
			shares = Utils.asString(BPMUtils.getContextVariable('bcinwf_shares')),
			comment = ''
		;
		
		if (null != processKind) {
			processKind = bluecourrierConfig.getValue('wf.incoming.process-kind.'+ processKind +'.label');
		}
		
		if (null != shares) {
			shares = Yamma.DeliveryUtils.decode(shares);
			if (null != shares) {
				comment += '\n' + 'Préassignation:'+ shares.toString();
			}
		}
		
		HistoryUtils.addEvent(document, {
			
			eventType : 'startDelivery',
			key : 'yamma.actions.startDelivery.comment',
			args : [ processKind, comment ]
			
		});
		
	}
	

})();
