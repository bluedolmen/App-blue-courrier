(function() {	

	DueableUtils = Utils.Object.create(DatalistUtils, {
		
		DATALIST_XPATH_LOCATION : '/app:company_home/st:sites/cm:' + YammaUtils.ConfigSite.name + '/cm:dataLists/cm:delays',
		PROPERTY_NAME : YammaModel.DUEABLE_DUE_DATE_PROPNAME,
		
		LATE_TEMPLATE : Utils.Object.create(new TemplateDefinition.Default(), {
			  
		  templateName : 'late-mails-alert.html.ftl',
		  delayInDays : 0,
		  roleName : '',
		  serviceName : '',
		  date : null,
		  userDisplayName : '',
		  senderDisplayName : null,
		  lateMails : null,
		  
		  subject : "[BlueCourrier] Rapport d'alerte du " + new Date().toLocaleDateString(),
		  
		  getTemplateArgs : function() {
		    
		    var
		    	lateMails = this.lateMails || DueableUtils.getLateMails(this.delayInDays, this.serviceName),
		        
		        templateArgs = {
		    		roleName : this.roleName,
		    		serviceName : Utils.Alfresco.getSiteTitle(this.serviceName),
		    		date : new Date(),
		    		userDisplayName : this.userDisplayName,
		    		senderDisplayName : this.senderDisplayName,
		    		subject : this.subject
		        },
		        
		        nowInMs = new Date().getTime()
		    ;
		    
		    templateArgs.mails = Utils.Array.map(lateMails, function(mail) {
		    	
		    	var
		    		dueDate = mail.properties[YammaModel.DUEABLE_DUE_DATE_PROPNAME],
		    		overdue,
		    		instructorName = mail.properties['bcinwf:instructorUserName']
		    	;
		    	
		    	if (null == dueDate) return; // shouldn't happen
		    	
		    	if (instructorName) {
		    		instructorName = Utils.Alfresco.getPersonDisplayName(instructorName);
		    	}
		    	
		    	overdue = nowInMs - dueDate.getTime();
		    	// Back to days
		    	overdue = Math.round( overdue / (1000 * 60 * 60 * 24) );
		    	
		    	return {
		    		name : Utils.asString(mail.name),
		    		object : Utils.asString(mail.object),
		    		nodeRef : Utils.asString(mail.nodeRef),
		    		dueDate : dueDate,
		    		lateDaysNb : overdue,
		    		instructorName : instructorName
		    	};
		    	
		    });
		    
		    return templateArgs;
		    
		  }
		  
		}),
		
		updateDueDate : function(documentNode, delay) {
			
			DocumentUtils.checkDocument(documentNode);
			
			if (null == delay) {
				// Reset the delay
				documentNode.properties[this.PROPERTY_NAME] = null;
				documentNode.save();
				return;
			}
			
			var 
				createdDate = ( 
					documentNode.properties[YammaModel.INBOUND_DOCUMENT_DELIVERY_DATE_PROPNAME] 
					|| documentNode.properties.created 
					|| new Date()
				),
				delayItemNode = this.getItemNode(delay),
				delayInDays = Number(this.getDelayInDays(delayItemNode)),
				delayInMillis = delayInDays * 1000 * 60 * 60 *24,
				dueDateMillis = createdDate.getTime() + delayInMillis
			;
			
			documentNode.properties[this.PROPERTY_NAME] = new Date(dueDateMillis);
			documentNode.save();
			
		},
		
		getDelayInDays : function(delayItemNode) {
			
			if (!delayItemNode) return 0;
			if (!delayItemNode.properties) return 0; // not a ScriptNode
			
			return delayItemNode.properties[YammaModel.DELAY_DELAY_PROPNAME] || 0;
			
		},
		
		/**
		 * Uses indexed search to retrieve result. The returned result may not be consistent
		 * with the actual state of the repository.
		 */
		getLateMails : function(daysNbFromNow, siteName) {
			
			var
				nowInMs = new Date().getTime(),
				xDaysAgo = new Date(nowInMs - (daysNbFromNow * 24 * 60 * 60 * 1000)),
				query = '+ASPECT:"' + YammaModel.MAIL_ASPECT_SHORTNAME + '"',
				nodes
			;
	
			query += 
				' +@' + 
				Utils.escapeQName(YammaModel.DUEABLE_DUE_DATE_PROPNAME) +
				':[MIN TO ' + utils.toISO8601(xDaysAgo) + ']'
			;
			
			query +=
				' -@' + Utils.escapeQName(YammaModel.STATUSABLE_STATUS_PROPNAME) + ':"' + YammaModel.DOCUMENT_STATE_PROCESSED + '"' +
				' -@' + Utils.escapeQName(YammaModel.STATUSABLE_STATUS_PROPNAME) + ':"' + YammaModel.DOCUMENT_STATE_ARCHIVED + '"' +
				' -@' + Utils.escapeQName(YammaModel.STATUSABLE_STATUS_PROPNAME) + ':ISNULL'
			;
			
			if (siteName) {
				
				query += ' +PATH:"/app:company_home/st:sites/cm:' + siteName + '//*"'; 
				
			}
			
			nodes = search.luceneSearch(query, YammaModel.DUEABLE_DUE_DATE_PROPNAME /* sortColumn */, true /* asc */);
			
			return nodes || [];
			
		}
		
	});
			
})();
