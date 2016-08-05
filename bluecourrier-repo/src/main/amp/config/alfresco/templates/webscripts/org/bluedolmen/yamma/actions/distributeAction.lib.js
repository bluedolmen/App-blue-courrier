///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/privacy-utils.js">

(function() {	
	
	var 
		AdviseCopy = Utils.Object.create(new TemplateDefinition.Default(), {
		  
		  document : null,
		  templateName : 'copy-acknowledgment.html.ftl',
		  senderName : '',
		  recipientName : '',
		  operation : 'information',
		  
		  getTemplateArgs : function() {
		    
		    var 
		        enclosingSiteShortName = Utils.Alfresco.getEnclosingSiteName(this.document), 
		        
		        link = 'page/site/{siteName}/document-details?nodeRef={nodeRef}'
		        .replace(/\{siteName\}/, enclosingSiteShortName)
		        .replace(/\{nodeRef\}/, Utils.asString(this.document.nodeRef)),
		        
		        templateArgs = {
		          subject : "Assignation d'une copie",
		          object : this.document.properties[YammaModel.MAIL_OBJECT_PROPNAME] || '',
		          senderName : this.senderName,
		          recipientName : this.recipientName,
		          nodeRef : Utils.asString(this.document.nodeRef),
		          operation : this.operation,
		          link : link
		        }
		    ;
		    
		    return templateArgs;
		    
		  }		
		  
		}),
		
		INCOMING_WORKFLOW_ID = 'activiti$incomingDocument'
	;
	
	
	Utils.ns('Yamma').DeliveryUtils = {
		
		PROCESS_KINDS : ['ep', 'fu'],
		
		ROLE_PROCESSING : 'procg',
		ROLE_COLLABORATION : 'col',
		ROLE_INFORMATION : 'inf',
		
		ROLE_LABELS : {
			
			'procg'  : 'Traitement',
			'col' : 'Collaboration',
			'inf' : 'Information'
			
		},
		
		/**
		 * A role may be decorated by a function
		 * <p>
		 * e.g. procg/to to provide a source and target information
		 */
		getActualRole : function(role) {

			if (!role) return role;
			
			var slashIndex = role.indexOf('/');
			if (-1 == slashIndex) return role;
			
			return role.substring(0, slashIndex);

		},
		
		checkRoleIsValid : function(role) {
			
			role = this.getActualRole(role);
			
			if (undefined === this.ROLE_LABELS[role]) {
				throw new Error("The role '" + role + "' is not valid");
			}
			
		},
		
		getDefaultProcessKind : function() {
			
			return this.PROCESS_KINDS[0] || 'ep'; // ensure a valid value at any moment
			
		},
			
		Share : {

//			services : [/*
//			    {
//			    	serviceName : string,
//			    	displayName : string,
//			    	role : string,
//                  status : string [pending|ongoing|done]
//			    }
//			]*/], ...
			
			_descr : {
				
				'ser' : {
					set : 'services',
					title : Utils.Alfresco.getMessage('yamma.shares.services'),
					prefix : 'ser',
					getDisplayName : Utils.Alfresco.getSiteTitle,
					isValid : function(service) {
						return (
							ServicesUtils.isService(service.name) &&
							(undefined !== Yamma.DeliveryUtils.ROLE_LABELS[(service.role || '').split('/')[0]])
						);
					}
				},
				'loc' : {
					set : 'localUsers',
					title : Utils.Alfresco.getMessage('yamma.shares.localUsers'),
					prefix : 'loc',
					getDisplayName : Utils.Alfresco.getPersonDisplayName,
					isValid : function(localUser) {
						
						var
							userName = localUser.name,
							user = people.getPerson(userName)
						;
						
						return null != user;
						
					}
				},
				'ext' : {
					set : 'externalUsers',
					title : Utils.Alfresco.getMessage('yamma.shares.externalUsers'),
					prefix : 'ext',
					isValid : function(externalUser) {
						return Utils.String.isEmail(externalUser.name);
					}
					
				},
				'grp' : {
					set : 'groups',
					title : Utils.Alfresco.getMessage('yamma.shares.groups'),
					prefix : 'grp'
				}
				
			},
			
			_init : function(other) {
				
				var prefix = null, set;
				
				this._setnames = [];
				this._sets = [];
				other = other || {};
				
				for (prefix in this._descr) {
					set = this._descr[prefix].set;
					this[set] = other[set] || [];
					this._setnames.push(set);
					this._sets.push(this[set]);
				}
				
				this._sort();
				
			},
			
			_sort : function() {
				
				Utils.Array.forEach(this._sets, function(set) {
					set.sort(function(a,b) {
						return a.name < b.name ? -1 : 1;
					});
				});
				
			},
			
			isEmpty : function() {
				return !Utils.Array.exists(this._sets, function(set) {return !Utils.Array.isEmpty(set); });
			},
			
			_get : function(set, name) {
				
				set = Utils.isString(set) ? this[set] : set;
				return Utils.Array.first(set, function(elem) {
					return elem.name == name;
				}) ;
				
			},
			
			_getService : function(service) {
				
				var serviceName = Utils.isString(service) ? service : service.name;
				return this._get(this.services, serviceName);
				
			},
			
			_getStatus : function(setname, name) {
				
				var elem = this._get(setname, name);
				if (null == elem) return null;
				return elem.status;
				
			},
			
			getServiceStatus : function(service) {
				
				var elem = this._getService(service);
				if (null == elem) return null;
				return elem.status;
				
			},
			
			isServiceOngoing : function(service) {
				
				return 'ongoing' == this.getServiceStatus(service);
				
			},
			
			_equals : function(elem1, elem2) {
				
				if (null == elem1 || null == elem2) return elem1 == elem2;
				if (elem1 == elem2) return true;
				
				return (
					elem1.name == elem2.name &&
					elem1.role == elem2.role
				);
				
			},
			
			_equalServices : function(service1, service2) {
				return this._equals(service1, service2);
			},
			
			_getLocalUser : function (localUser) {
				return this._get(this.localUsers, localUser);
			},
			
			_equalLocalUsers : function(localUser1, localUser2) {				
				return this._equals(localUser1, localUser2);
			},
			
			_getExternalUser : function(externalUserEmail) {
				return this._get(this.externalUsers, externalUserEmail);
			},
			
			_equalExternalUsers : function(externalUser1, externalUser2) {
				return this._equals(externalUser1, externalUser2);
			},
			

			/**
			 * @param {Object}
			 *            addedShares
			 * @param {Boolean}
			 *            checkExisting: whether the duplicates
			 *            should be checked. If true and a duplicate
			 *            is found, then it is updated
			 * @param {Object}
			 *            defaults: the default values to apply to
			 *            the added items
			 */
			add : function(addedShares, checkExisting, defaults) {
				
				var me = this;
				
				if (null == addedShares) {
					return this;
				}
				
				if (Utils.isString(addedShares)) {
					addedShares = Yamma.DeliveryUtils.decode(addedShares);
				}
				
				Utils.forEach(this._setnames, function(setname) {
					
					var addedSet = addedShares[setname];
					if (undefined === addedSet) return; // continue
					
					Utils.forEach(addedSet, function(elem) {
						
						var existingElem = null;
						
						if (!elem) return; // continue
						
						if (false !== checkExisting && null != elem.name) {
							existingElem = me._get(me[setname], elem.name); 
						}
						
						if (defaults) {
							Utils.apply(elem, defaults);
						}
						
						if (null == existingElem) {
							me[setname].push(elem);
						}
						else {
							if ('ongoing' === elem.status && elem.role != elem.role) {
								throw new Error('IllegalStateException! You tried to update an ongoing share.');
							}
							Utils.apply(existingElem, elem);
						}
						
					});
					
				});
				
				this._sort();
				
				return this;
				
			},
			
			remove : function(removedShares) {
				
				var me = this;
				
				if (null == removedShares) return this;
				
				if (Utils.isString(removedShares)) {
					removedShares = Yamma.DeliveryUtils.decode(removedShares);
				}
				
				Utils.forEach(this._setnames, function(setname) {
					
					var removedSet = removedShares[setname];
					if (undefined === removedSet) return; // continue

					Utils.forEach(removedSet, function(elem) {
						
						var index = Utils.Array.indexOf(me[setname], function(_elem) {
							return _elem.name == elem.name;
						});
						if (-1 == index) return;
						
						Utils.Array.remove(me[setname], index);
						
					});
					
				});
				
				return this;
				
			},
			
			difference : function(others) {
				
				var result = Utils.Object.create(Yamma.DeliveryUtils.Share); // create a new empty result
				result.add(this, false /* checkExisting */); // perform a copy of me
				
				if (null != others) {
					result.remove(others);				
				}
				
				return result;
				
			},
			
			hashCode : function() {
				
				return Utils.String.hashCode(this.encode());
				
			},
			
			encode : function() {
				
				var descr, setname, prefix, result = [];
								
				for (var id in this._descr) {
					descr = this._descr[id];
					setname = descr.set;
					prefix = descr.prefix;
					
					Utils.forEach(this[setname], function(elem) {
						result.push(prefix + '_' + elem.name + (elem.role ? '|' + elem.role : '') + (elem.status ? '|' + elem.status : ''));
					});
				}
				
				return result;
				
			},
			
			encodeAsString : function() {
				
				return this.encode().join(','); 
				
			},
			
			filterServicesBy : function(role, status) {
				
				if (null == role && null == status) return this;
				
				role = null == role ? null : [].concat(role);
				status = null == status ? null : [].concat(status);
				
				var 
					result = Utils.Object.create(Yamma.DeliveryUtils.Share),
					removedServices
				;
				
				result.add(this, false /* checkExisting */); // copy this
				
				removedServices = Utils.Array.filter(this.services, function accept(service) {
					return !(
						(null == role || Utils.Array.contains(role, service.role ? service.role.split('/')[0] : null) ) // a role may contains a suffix /xxx 
						&& (null == status || Utils.Array.contains(status, service.status))
					); 
				})
				
				result.remove({services : removedServices});
				
				return result;
				
			},
			
			getServicesBy : function(role, status) {
				
				var accept = Utils.isFunction(role) ? role : null;
				
				if (null == role && null == status) return [];

				if (null == accept) {
					
					role = null == role ? null : [].concat(role);
					status = null == status ? null : [].concat(status);
					
					accept = function(service) {
						return (
							(null == role || Utils.Array.contains(role, service.role ? service.role.split('/')[0] : null) ) // a role may contains a suffix /xxx 
							&& (null == status || Utils.Array.contains(status, service.status))
						); 
					};
					
				}
				
				return Utils.Array.filter(this.services, accept);
				
			},
			
			store : function(document, save) {
				
				if (null == document) throw new Error('IllegalArgumentException! The provided document is not valid!');
				document.properties[YammaModel.DISTRIBUTABLE_SHARES_PROPNAME] = this.encode();
				
				if (true === save) {
					document.save();
				}
				
			},
			
			toString : function() {
				
				var descr, setname, title, getDisplayName, displayElems, result = "";
				
				for (var id in this._descr) {
					
					descr = this._descr[id];
					setname = descr.set;
					title = descr.title;
					getDisplayName = descr.getDisplayName || function(v) {return v;};
					
					displayElems = Utils.map(this[setname], function(elem) {
						
						var
							displayName = elem.displayName || getDisplayName(elem.name)
							role = Yamma.DeliveryUtils.getActualRole(elem.role) || ''
						;
						
						return displayName + (role ? ' (' + (Yamma.DeliveryUtils.ROLE_LABELS[role] || 'inconnu') + ')': '');
						
					});
					
					if (!Utils.Array.isEmpty(displayElems)) {
						result += '\n[' + title + '] ' + Utils.String.join(displayElems, ', ');
					}
					
				}
				
				return result;				
				
			}
	
		},
			
		
		/**
		 * An encoded copy string is composed of a comma separated list of strings,
		 * which prefixes determine the type :
		 * - 'ser_' for a service
		 * - 'loc_' for a local user (Alfresco valid user)
		 * - 'ext_' for an external user identified by an email
		 * 
		 * Also a local user can have an optional role which will define the
		 * allowed actions (permissions), set by using the separator '|':
		 * - 'consumer'
		 * - 'contributor'
		 * 
		 * e.g.: ser_diradmgen,loc_bpajot|consumer,ext_jck@bluexml.com
		 */
		decode : function(copies, performCheck /* = false */) {
			
			if (null == copies) {
				return Utils.Object.create(Yamma.DeliveryUtils.Share);
			}
			
			if (Utils.isJavaArray(copies)) { // A Java Array should serialize correctly to the expected string value
				copies = Utils.asString(copies);
			}
			
			var result = Utils.Object.create(Yamma.DeliveryUtils.Share, null);
			
			decode();
			
			if (true === performCheck) {
				doPerformCheck();
			}
			
			return  Utils.Object.create(Yamma.DeliveryUtils.Share, null, [result] /* initArgs */);
			
			function decode() {
				
				if (!Utils.isArray(copies)) {
					copies = Utils.String.splitToTrimmedStringArray(copies);
				}

				Utils.forEach(copies, function(copy) {
					
					if (!copy) return;
					
					var 
						indexOfPrefixEnd = copy.indexOf('_'),
						prefix = copy.substr(0, indexOfPrefixEnd) || 'ser',
						_descr = result._descr[prefix],
						setname, _split
					;
					
					if (null == _descr) return;
					copy = copy.substr(indexOfPrefixEnd + 1);
					setname = _descr.set;
					
					_split = copy.split('|');
					result[setname].push({
						name : _split[0],
						displayName : Utils.isFunction(_descr.getDisplayName) ? _descr.getDisplayName(_split[0]) : _split[0],
						role : _split[1] || 'inf',
						status : _split[2] || null
					});					
					
				});
				
			} 
			
			function doPerformCheck() {
				
				var prefix, _descr, isValid, setname;
				
				for (prefix in Yamma.DeliveryUtils.Share._descr) {
					
					_descr = Yamma.DeliveryUtils.Share._descr[prefix];
					isValid = _descr.isValid;
					if (!Utils.isFunction(isValid)) continue;

					setname = _descr.set;
					Utils.forEach(result[setname] || [], function(elem) {
						
						if (!isValid(elem)) {
							
							throw {
								code : 500,
								message : 'IllegalStateException! Element \'' + elem.name + '\' is not valid'
							};
							
						};
						
					});
					
				}
				
			}
			
		},
		
		getCurrentShares : function(node) {
			
			var 
				properties = node.properties,
				currentShares = properties[YammaModel.DISTRIBUTABLE_SHARES_PROPNAME]
			;
			
			return Yamma.DeliveryUtils.decode(currentShares || '');
			
		},
		
		
		getBPMStoredShares : function(task) {
			
			return Yamma.DeliveryUtils.decode(Utils.asString(getStoredShares()) || '');
			
			function getStoredShares() {
				
				if (null == task) return BPMUtils.getContextVariable('bcinwf_shares');
				if (undefined !== task.properties) return task.properties['bcinwf:shares'];
				return task.getVariable('bcinwf_shares');
				
			}
			
		},
		
		clearBPMStoredShares : function() {
			
			execution.setVariable('bcinwf_shares', '');
			
		},
		
		/**
		 * Do the difference between the bpm-stored shares and the current shares
		 */
		getAddedShares : function(node, task) {
			
			var
				taskShares = this.getBPMStoredShares(task),
				currentShares = Yamma.DeliveryUtils.getCurrentShares(node).filterServicesBy(null, ['ongoing','pending'])
			;
			
			return taskShares.difference(currentShares);
			
		},
		
		/**
		 * Check the added service with respect to the currently assigned role
		 */
		checkAddedShares : function(document, role, task) {
			
			var
				me = this,
				availableRoles = Utils.Array.toMap(getAvailableRolesForProcessKind()),
				addedShares, services
			;
			
			function getAvailableRolesForProcessKind() {
				
				var 
					currentProcessKind = me.getCurrentProcessKind(),
					availaibleRoles
				;
				if (!currentProcessKind) return me.PROCESS_KINDS;
				
				availableRoles = ConfigUtils.getConfigValue('wf.incoming.process-kind.' + currentProcessKind + '.active-roles', Yamma.DeliveryUtils.getDefaultProcessKind(), 'string');
				return availableRoles ? Utils.String.splitToTrimmedStringArray(Utils.asString(availableRoles)) : me.PROCESS_KINDS;
				
			}
	
			document = null == document ? Utils.Alfresco.BPM.getFirstPackageResource() : document;
			
			role = role || BPMUtils.getContextVariable('serviceRole') || this.ROLE_INFORMATION;
			
			addedShares = this.getAddedShares(document, task);
			
			if (
				!Utils.Array.every(
					Utils.Array.map(addedShares.services, function(service) { return (service.role || '').split('/')[0]; }),
					function(role) { return undefined !== availableRoles[role]; }
				)
			) {
				throw new Error("Only the roles " + getAvailableRolesForProcessKind().join(',') + " are active for process-kind '" + this.getCurrentProcessKind() + "'");
			}
			
			if (this.ROLE_PROCESSING == role) return; // a processing role can add anybody
			
			// Collaboration or information
			services = addedShares.getServicesBy(this.ROLE_PROCESSING);
			if (!Utils.Array.isEmpty(services)) {
				throw new Error("Unable to add a processing role while you're only assigned to collaboration or information role.");
			}
			
			if (this.ROLE_COLLABORATION == role) return;
			
			services = addedShares.getServicesBy(this.ROLE_COLLABORATION);
			if (!Utils.Array.isEmpty(services)) {
				throw new Error("Unable to add a collaboration role while you're only assigned to an information role.");
			}
			
			// Information role can only add information services
			
		},
		
		getCurrentProcessKind : function() {
			
			var processKind = Utils.asString(BPMUtils.getContextVariable('bcinwf:processKind'));
			return processKind || ConfigUtils.getConfigValue('wf.incoming.default-process-kind', Yamma.DeliveryUtils.getDefaultProcessKind(), 'string');
			
		},
		
		getCurrentBPMServiceAndRole : function() {

			var serviceAndRole = Utils.asString(BPMUtils.getContextVariable('serviceAndRole')) || '';
			return this.decodeServiceAndRole(serviceAndRole);
			
		},
		
		decodeServiceAndRole : function(serviceAndRole) {
			
			serviceAndRole = serviceAndRole || '';
			
			var
				split = serviceAndRole.split('|'),
				serviceName = split[0],
				serviceRole = split[1]
			;
			
			return {
				name : serviceName,
				role : serviceRole
			};
			
		},
		
		encodeServiceAndRole : function(serviceName, serviceRole) {
			return serviceName + '|' + serviceRole;
		},
		
		getBPMContextualServiceName : function() {
			
			var
				serviceAndRole = Yamma.DeliveryUtils.getCurrentBPMServiceAndRole(),
				serviceName = serviceAndRole.name,
				document
			;
			
			if (!serviceName) {
				
				document = Utils.Alfresco.BPM.getFirstPackageResource();
				if (null == document) {
					logger.warn("Cannot retrieve the document whereas the enclosing-service name is unknown, skipping task-assignment.")
					return null;
				}
				
				serviceName = Utils.Alfresco.getEnclosingSiteName(document);
				
			}
			
			return serviceName;
			
		},
		
		updateServiceShare : function(document, status, serviceName, serviceRole) {
			
			var
				currentShares,
				service = {}
			;
			
			if (!serviceName) {
				
				serviceName = Utils.asString(BPMUtils.getContextVariable('serviceName'))
					|| Utils.Alfresco.getEnclosingSiteName(document);
			
				if (null == serviceName) {
					throw new Error("IllegalArgumentException! The service-name is mandatory.");
				}
				
			}
			
			serviceRole = serviceRole 
				|| Utils.asString(BPMUtils.getContextVariable('serviceRole')) 
				|| this.ROLE_PROCESSING; // may be null
			
			currentShares = Yamma.DeliveryUtils.getCurrentShares(document);
			if (null == currentShares) return; // cannot retrieve current shares
			
//			// TO BE REMOVED => DEBUG
//			if (null == serviceName || 'undefined' == serviceName) {
//				throw new Error('INVALID SERVICE-NAME');
//			}
//			// END TO BE REMOVED
			
			service = currentShares._getService(serviceName);
			if (null == service) {
				
				currentShares.add({
					services : [{
						name : serviceName,
						role : serviceRole, 
						status : status
					}]
				});
				
			}
			else {
				
				if (null != serviceRole) {
					service.role = serviceRole;
				}
				
				if (undefined !== status) {
					service.status = status;
				}
				
			}
			
			currentShares.store(document, true /* save */);
			
		},
		
		/**
		 * @param {ScriptNode} document
		 * @param {String|Object} user
		 * @param {Object} config
		 * @param {string}['inf'] config.role (inf | col)
		 * @param {boolean}[false] config.checkExisting
		 * @param {boolean}[true] config.sendEmail  
		 */
		shareWithUser : function(document, user, config) {
			
			if (null == user) return;
			
			config = config || {};
			config.role = config.role || user.role || 'inf';
			config.sendEmail = config.sendEmail || ConfigUtils.getConfigValue('shares.user.notify-email', true, 'boolean');
			config.followDocument = config.followDocument || ConfigUtils.getConfigValue('shares.user.follow-on-share', true, 'boolean');
			
			var 
				userName = Utils.Alfresco.getPersonUserName(user),
				authenticatedPersonDN = Utils.Alfresco.getPersonDisplayName(Utils.Alfresco.getFullyAuthenticatedUserName()) || '',
				currentShares, person
			;
			if (!userName) return;
			
			person = people.getPerson(userName);
			if (null == person) return;
			
			if (false !== config.setUserAccess) _enableAccess();
			if (true === config.sendEmail) _sendEmailToUser();
			if (true === config.followDocument) _followDocument();
			
			
			return true;
			
			function _enableAccess() {
				
				var
					documentContainer = DocumentUtils.getDocumentContainer(document),
					role = 'col' == config.role ? 'Collaborator' : ConfigUtils.getConfigValue('shares.user.information.default-permission', 'Contributor', 'string')
				;
				
				documentContainer.setPermission(role, userName);
				
			}
			
			function _sendEmailToUser (onSendMailSuccess, onSendMailFailure) {
				
				var email = Utils.asString(person.properties['cm:email']);
				if (!email) return;
				
				var templateDefinition = Utils.Object.create(AdviseCopy, {
					
					document : document,
					operation : 'col' == config.role ? 'avis' : 'information',
					senderName : authenticatedPersonDN,
					recipientName : null != person ? Utils.Alfresco.getPersonDisplayName(person) : ''
					
				});
				
				return SendMailUtils.sendMail({
					
					document : document,
					recipientEmail : email,
					templateDefinition : templateDefinition,
					
					sendMailSuccess : onSendMailSuccess || undefined,
					sendMailFailure : onSendMailFailure || undefined,
					silent : true
				
				});						
				
			}
			
			function _followDocument() {
				
				FollowingUtils.follow(document, userName, null /* do not set permission, this is already done */);
				
			}
			
		},
		
		/**
		 * @param {ScriptNode} document
		 * @param {String|Object} group
		 * @param {Object} config
		 * @param {string}['inf'] config.role (inf | col)
		 * @param {boolean}[false] config.checkExisting
		 * @param {boolean}[true] config.sendEmail  
		 */
		shareWithGroup : function(document, group, config) {
			
			if (null == group) return;
			
			config = config || {};
			config.role = config.role || group.role || 'inf';
			config.shareOnGroup = config.shareOnGroup || ConfigUtils.getConfigValue('shares.group.share-on-group', true, 'boolean');
			
			var
				me = this,
				groupName = Utils.isString(group) ? group : group.name,
				groupNode = Utils.Alfresco.getGroupNode(groupName)
			;
			if (!groupNode) return;
			
			if (false !== config.shareOnGroup) {
				enableGroupAccess();
			}
			
			processIndividualMembers();
			
			
			function enableGroupAccess() {
				
				var
					documentContainer = DocumentUtils.getDocumentContainer(document),
					authorityName = Utils.asString(groupNode.properties['cm:authorityName']),
					role = 'col' == config.role ? 'Collaborator' : ConfigUtils.getConfigValue('shares.group.information.default-permission', 'Contributor', 'string')
				;
				
				if (!authorityName) return;
				
				documentContainer.setPermission(role, authorityName);
				
			}
			
			function processIndividualMembers() {
				
				var shareWithUserConfig = Utils.apply({setUserAccess : true !== config.shareOnGroup}, config);
				
				Utils.Array.forEach(people.getMembers(groupNode) || [], function(member) {
					var userName = Utils.Alfresco.getPersonUserName(member);
					me.shareWithUser(document, userName, shareWithUserConfig);
				});
				
			}
			
		},
		
		shareWithCollaborationService : function(document, service, config) {
			
			var permission = ConfigUtils.getConfigValue('shares.services.collaboration.default-permission', 'Contributor', 'string');

			if (null == service) return;
			
			config = config || {};
			config.roleGroup = config.roleGroup || service.roleGroup;
			
			if (false !== config.checkExisting) {
				if (this._checkServiceOngoing(service, document)) return false; 
			}
			
			this._enableServiceRoleAccess(document, service, config.roleGroup, permission);
			
			return true;
			
		},
		
		_checkServiceOngoing : function(service, document) {

			var 
				service = ServicesUtils.getCheckedService(service), 
				serviceName = service.shortName,
				currentShares = Yamma.DeliveryUtils.getCurrentShares(document)
			;
			
			return currentShares.isServiceOngoing(serviceName); 
			
		},
		
		_enableServiceRoleAccess : function(document, service, serviceRole, permissions) {
			
			service = ServicesUtils.getCheckedService(service);
			permissions = [].concat(permissions || 'SiteConsumer');
			serviceRole = serviceRole || ServicesUtils.SERVICE_ASSISTANT_ROLENAME;
			
			if (!ServicesUtils.isService(service)) {
				throw new Error('IllegalStateException! The provided site does not match a valid service');
			}
			
			var 
				serviceName = service.shortName,
				serviceRoleGroup = ServicesUtils.getSiteRoleGroup(serviceName, serviceRole),
				serviceRoleGroupName = serviceRoleGroup.properties.authorityName,
				documentContainer = DocumentUtils.getDocumentContainer(document)
			;
			
			Utils.forEach(permissions, function(permission) {
				if (!permission) return;
				documentContainer.setPermission(permission, serviceRoleGroupName);
			});
			
		},
		
		shareWithInformationService : function(document, service, config) {
			
			var permission = ConfigUtils.getConfigValue('shares.services.information.default-permission', 'Contributor', 'string'); 
			
			if (null == service) return;
			
			config = config || {};
			config.roleGroup = config.roleGroup || service.roleGroup;
			
			service = ServicesUtils.getCheckedService(service);
			
			var 
				me = this,
				serviceName = service.shortName
			;
			
			if (false !== config.checkExisting) {
				if (this._checkServiceOngoing(service, document)) return false; 
			}
			
			this._enableServiceRoleAccess(document, service, config.roleGroup, permission);
			_linkToCCBox();				
			
			return true;
			
			function _linkToCCBox() {
				
				var 
					ccbox = TraysUtils.getCCboxTray(serviceName),
					documentName
				;
				if (null == ccbox) return;
				
				documentName = Utils.Alfresco.getUniqueChildName([ccbox], document.name, function nameGenerator(namePrefix, count) {
					return namePrefix + '#' + count;
				});
				
				ccbox.createNode(documentName, 'cm:link', {
					'cm:destination' : document.nodeRef
				});
				
			}
			
		},
		
		
		deliverToService : function(document, service, config) {
			
			config = config || {};
			config.role = config.role || this.ROLE_PROCESSING ;			
			
			service = ServicesUtils.getCheckedService(service);
			var serviceName = service.shortName;
			
			/**
			 * Move the document in the selected service tray
			 * @returns the tray-node in which the document was moved
			 */
			function moveDocumentToTray(node) {
				
				var 
					documentContainer = DocumentUtils.getDocumentContainer(node),
					currentTray = TraysUtils.getEnclosingTray(node),
					currentTrayKind = null != currentTray ? TraysUtils.getTrayKind(currentTray) : YammaModel.TRAY_KIND_INBOX,						
					document = documentContainer,
					documentName = null
				;
				
				if (null == documentContainer) {
					logger.warn('Cannot find the container of document ' + document.nodeRef + '. Using the actual document instead.');
					document = node;
				}
				
				var targetServiceTray = TraysUtils.getSiteTray(serviceName, currentTrayKind );
				if (null == targetServiceTray) return;
				if (targetServiceTray.equals(currentTray)) return; // same destination
				
				documentName = document.name;
				
				var newName = Utils.Alfresco.getUniqueChildName([targetServiceTray], documentName, function nameGenerator(namePrefix, count) {
					return namePrefix + '#' + count;
				});
				
				if ( !bdNodeUtils.moveAndRename(document, targetServiceTray, newName) ) {
					throw {
						code : 500,
						message : 'IllegalStateException! Cannot move the document ' + document.name + ' to the new tray ' + targetServiceTray.name
					};
				}
				
				document = DocumentUtils.getDocumentNode(document);
				
				PrivacyUtils.updatePermissions(document);
				
				return targetServiceTray;
				
			}
			
			function storeService(node) {
				
				var 
					currentShares = Yamma.DeliveryUtils.getCurrentShares(node)
				;
				
				currentShares.add({
					services : [
					    {
					    	name : serviceName,
					    	role : config.role,
					    	status : 'ongoing'
					    }
					] 
				});
				
				currentShares.store(node);
				
			}
			
			moveDocumentToTray(document);
			storeService(document);
						
		},
		
		startIncomingWorkflow : function(document, validateDelivery, extraParameters) {
			
			extraParameters = extraParameters || {};
			Utils.apply(extraParameters, yammaHelper.getContextualIncomingParameters());
			
			var 
				workflow = actions.create("start-workflow"),
				siteShortName = Utils.Alfresco.getEnclosingSiteName(document),
				startingMode = extraParameters.startingMode,
				shares = extraParameters.shares,
				processKind = extraParameters.processKind || Utils.asString(ConfigUtils.getConfigValue('wf.incoming.default-process-kind', Yamma.DeliveryUtils.getDefaultProcessKind(), 'string'))
			;
			
			workflow.parameters.workflowName = INCOMING_WORKFLOW_ID;
			workflow.parameters["bpm:workflowDescription"] = "Un document entrant doit être traité.";
			
			if (undefined !== startingMode) {
				workflow.parameters["bcinwf:startingMode"] = startingMode;
			}
			
			shares = shares || Utils.asString(yammaHelper.getContextualShares());
			if (shares) {
				// Check shares before
				shares = this.decode(shares, true /* performCheck */);
				workflow.parameters["bcinwf:shares"] = shares.encode(); // serialized version
			}
			
			workflow.parameters['bcinwf:processKind'] = processKind; // system property
			
			workflow.parameters['bcinwf:validateDelivering'] = ('never' != ConfigUtils.getConfigValue('wf.incoming.enable-supervisor-validation', 'first', 'string'));
			if (null != validateDelivery) {
				workflow.parameters['bcinwf:validateDelivering'] = false !== validateDelivery;
			}
			
			Utils.applyIf(workflow.parameters, extraParameters, function skippedIf(value){ return null != value; });
			
			workflow.execute(document);
			
		},
		
		_getFirstIncomingWaitingTask : function(document) {
			
			var tasks = workflowUtils.getTasksForNode(document);
			return BPMUtils.filterTasks(tasks, 'waitingForNewServices')[0] || null;
			
		}
			
	};
	
	Yamma.DeliveryUtils.PROCESS_KINDS = ConfigUtils.getConfigValue(
		'wf.incoming.process-kinds', Yamma.DeliveryUtils.PROCESS_KINDS /* defaultValue */,
		function interpret(value) {
			if (null == value) return value;
			return Utils.String.splitToTrimmedStringArray(Utils.asString(value));
		}
	);	
	
	
})();