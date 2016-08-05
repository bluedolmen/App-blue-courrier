(function() {
	
	var 
		NO_SUBJECT = '(Pas de sujet)',
		GENERIC_FAILURE_MESSAGE = 'échec',
		DICTIONARY_MAIL_TEMPLATES_PATH = 'app:dictionary/app:email_templates/cm:bluecourrier' // TODO: SHOULD BE CHANGED TO BE REUSABLE 
	;
	
	
	SendMailUtils = {
			
		getMailTemplatesPath : function() {
			
			return DICTIONARY_MAIL_TEMPLATES_PATH;
			
		},
		
		/**
		 * @argument {Object} config The configuration for sending the mail
		 * @argument {String} config.recipientMail The address of the recipient
		 *           in an email format
		 * @argument {Object} config.templateDefinition The definition of the
		 *           template
		 * @argument {ScriptNode} config.document The document on which the
		 *           template will be processed (optional)
		 * @argument {Function} config.sendMailSuccess The callback to be called
		 *           when there is no problem
		 * @argument {Function} config.sendMailFailure The callback to be called
		 *           when there is a failure
		 */
		sendMail : function(config) {
			
			ParameterCheck.mandatoryParameter(config, 'config');
			ParameterCheck.mandatoryParameter(config.recipientEmail, 'config.recipientEmail');
			ParameterCheck.mandatoryParameter(config.templateDefinition, 'config.templateDefinition');
			
			var 
				document = config.document || null,
				recipientEmail = config.recipientEmail,
				templateDefinition = config.templateDefinition,
				sendMailSuccess = Utils.isFunction(config.sendMailSuccess) ? config.sendMailSuccess : Utils.emptyFn,
				sendMailFailure = Utils.isFunction(config.sendMailFailure) ? config.sendMailFailure : Utils.emptyFn,
				silent = ( true === config.silent )
			;
				
			
			try {
				
				sendMailInternal();
				manageSentMailSuccess();
				return '';
				
			} catch (e) {
				
				return manageSentMailFailure(e);
				
			}
			
			function sendMailInternal() {
				
				var
					mail = actions.create("mail"),
					template = templateDefinition.getTemplate(),
					templateArgs = templateDefinition.getTemplateArgs() || {},
					subject = templateDefinition.getMailSubject() || NO_SUBJECT,
					templateModel = new Array()
				;
				
				templateModel['args'] = templateArgs;
				
				mail.parameters["to"] = recipientEmail;
				mail.parameters["subject"] = subject;
				mail.parameters["template"] = template;
				mail.parameters["template_model"] = templateModel;
				mail.parameters["ignore_send_failure"] = silent;

				mail.execute(document);
				
			}
			
			function manageSentMailSuccess() {
				
				if (sendMailSuccess && Utils.isFunction(sendMailSuccess)) {
					sendMailSuccess();
				}
				
			}
			
			function manageSentMailFailure(exception) {
				
				var errorMessage = GENERIC_FAILURE_MESSAGE;
				
				if ( ('string' == typeof exception) && exception) {
					errorMessage = exception;
				}
				
				if ( ('string' == typeof exception.message) && exception.message) {
					errorMessage = exception;
				}
				
				if (sendMailFailure && Utils.isFunction(sendMailFailure)) {
					var result = sendMailFailure(exception, errorMessage);
					if ('string' == typeof result) { // means error message
						errorMessage = result;
					} else if (true === typeof result) { // means silent
						silent = true;
					}
				}				
				
				if (silent) {
					return errorMessage;
				}

				throw {
					
					message : errorMessage,
					cause : exception
					
				};
			}
			
		}		
	
	};
	
	
	/*
	 * TEMPLATE DEFINITIONS
	 */
	
	TemplateDefinition = {
		
		getDictionaryTemplate : function(templateName) {
			
			ParameterCheck.mandatoryParameter(templateName, 'templateName');
			
			var templateDir = Utils.Alfresco.getCompanyHome().childrenByXPath(SendMailUtils.getMailTemplatesPath())[0];
			if (null == templateDir) throw { message : "The mail templates directory '" + SendMailUtils.getMailTemplatesPath() + "' cannot be found in the repository" };
			
			var template = templateDir.childByNamePath(templateName);
			if (null == template) throw new Error("The mail template '" + templateName + "' cannot be found in folder '" + templateDir.displayPath + "'");
			
			return template;
		}
		
	};
	
	TemplateDefinition.Default = function(document, templateName) {
		this.document = document;
		this.templateName = templateName;
		return this;
	};
	
	TemplateDefinition.Default.prototype = {
		
		getTemplate : function() {
			if (this.templateName) return TemplateDefinition.getDictionaryTemplate(this.templateName);
		},
		
		getTemplateArgs : function() {
			return {};
		},
		
		getMailSubject : function() {
			
			var 
				me = this,
				subjectPrefix = this.getSubjectPrefix()
			;

			function getTemplateArgsSubject() {
				
				var templateArgs = me.getTemplateArgs();
				if (null == templateArgs) return '';
				
				return templateArgs['subject'] || '';
					
			}
			
			return ( subjectPrefix ? '[' + subjectPrefix + '] ' : '' ) + (getTemplateArgsSubject() || NO_SUBJECT);

		},
		
		getSubjectPrefix : function() {
			
			if (null == this.document) return '';
			
			if (this.document.hasAspect(YammaModel.REFERENCEABLE_ASPECT_SHORTNAME)) {
				
				return ( 
					Utils.wrapString(this.document.properties[YammaModel.REFERENCEABLE_REFERENCE_PROPNAME]) ||
					Utils.wrapString(this.document.properties[YammaModel.REFERENCEABLE_INTERNAL_REFERENCE_PROPNAME]) ||
					''
				);
				
			}
			
			return '';
			
		}

	};	
	
})();