///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/alfresco/actions/common.lib.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/alfresco/actions/parseargs.lib.js">

(function() {

	Actions = Utils.ns('Yamma.Actions');
	
	Actions.Utils = {
		
		getRepliesListDescription : function(node) {
			
			var 
				replies = ReplyUtils.getReplies(node),
				replyNames = Utils.map(replies, function(replyNode) {
					return replyNode.properties.title || replyNode.name;
				}),			
				formattedRepliesTitle = Utils.String.join(replyNames, ',')				
			;
			
			return ({
				
				repliesNames : replyNames,
				titleList : formattedRepliesTitle,
				hasMany : replies.length > 1
				
			});			
			
		}
		
	};
	
	Actions.BatchAction = Utils.Object.create({

		fullyAuthenticatedUserName : Utils.Alfresco.getFullyAuthenticatedUserName(),
		
		parseArgs : null,
		
		element : null, // iterator on nodes
		elements : null,
		
		wsArguments : null,
		idArg : 'ref',
		outcomeElementsName : 'elements',

		/**
		 * @cfg {Object} The map of outcomes based on node keys (nodeRef)
		 */
		mappedResult : {},

		/**
		 * @cfg {Object} The map of failures based on node keys (nodeRef)
		 */
		mappedFailures : {},
		
		/**
		 * @cfg {Boolean} Whether to fail if getting a problem while executing
		 *      the action on a given node
		 */
		failOnError : true,
		
		/**
		 * @cfg {String} The error message that will be raised when the action
		 *      is not batch-executable
		 */
		failureReason : '',
		
		execute : function() {
			
			var me = this;
			
			Common.securedExec(function() {
			
				me.parseArguments();
			
				me.extractElements();
				
				me.prepare();
				
				if (!me.isBatchExecutable()) {
					throw {
						code : 403,
						message : 'Forbidden! The action cannot be executed by you in the current context' + (me.failureReason ? ': ' + me.failureReason : '')
					};	
				}
				
				// All methods before this point may fail with an exception
				// The execution may not fail if 'failOnError' is set to false
				
				me.doBatchExecute();
				
				me.setModel();
				
			});
			
		},
		
		parseArguments : function() {
			
			var 
				wsArguments = (this.wsArguments || []).concat({ name : this.idArg, mandatory : true})
			;
			
			this.parseArgs = this.parseArgs || ( new ParseArgs(wsArguments) );
			
		},
		
		extractElements : function() {
			
			if (null == this.idArg) {
				throw {
					code : 400,
					message : 'IllegalStateException! The node-argument is invalid'
				};
			}
			
			var 
				me = this,
				idArg = this.idArg,
				id = this.parseArgs[idArg]
			;
			id = Utils.String.trim(Utils.asString(id));
			
			// Accept with or without square-brackets
			var match = id.match(/^\[(.*)\]$/);
			if (null != match) {
				id = Utils.String.trim(match[1]);
			}
			
			var idList = id.split(',');
			this.elements = Utils.map(idList, function(id) {
				id = extractJSONString(id);
				return me.extractElement(id);
			});
							
			function extractJSONString(str) {				
				var match = str.match(/^"(.*)"$/);
				return Utils.String.trim(null != match ? match[1] : str);
			}
			
		},
		
		extractElement : function(id) {
			
			return id; // should probably be overridden

		},
		
		prepare : function() {
			
		},
		
		isBatchExecutable : function() {
			
			var
				me = this,
				isExecutable = true
			;
			
			Utils.forEach(this.elements, function(element) {
				me.element = element;
				var _isExecutable = me.isExecutable(element);
				
				if ('string' == typeof _isExecutable) {
					// failure
					me.failureReason = _isExecutable;
				}
				
				isExecutable = isExecutable && ( true === _isExecutable );
				return isExecutable; // breaks on isExecutable == false
			});
			
			return isExecutable;
			
		},
		
		isExecutable : function(element) {
			return true;
		},
		
		doBatchExecute : function() {
			
			var me = this;
			
			Utils.forEach(this.elements, function(element) {
				
				me.element = element;
				var key = me.getMappingKey(element);
				
				try {
					
					var beforeExecute_ = me.beforeExecute(element);
					if (false === beforeExecute_) return;
					
					var result = me.doExecute(element);
					
					var afterExecute = me.afterExecute(result);
					if (undefined !== afterExecute) {
						result = afterExecute;
					}
					
					if (undefined !== result) {
						me.mappedResult[key] = result;
					}
					
				} catch(e) {
					
					if (me.failOnError) {
						throw e;
					} else {
						me.mappedFailures[key] = e.message || message;
					}
					
				} 
				
			});
			
		},
		
		getMappingKey : function(element) {
			return Utils.asString(element);
		},
		
		beforeExecute : function(element) {
			// do nothing
		},
		
		doExecute : function(element) {
			// Should be implemented by prototyping classes
		},
		
		afterExecute : function(result) {
			
		},
		
		setModel : function() {
			
			var failedElementsNb = Utils.keys(this.mappedFailures).length;
			
			model.actionStatus = failedElementsNb == 0 ? 'success' : failure;
			model.actionOutcome = this.getActionOutcome(); 
			
		},
		
		getActionOutcome : function() {
			
			var 
				me = this,
				elements = {},
				outcome = {}
			;
			
			Utils.forEach(this.elements, function(element) {
				
				var
					key = me.getMappingKey(element),
					elementOutcome = me.getElementOutcome(element)
				;
				if (undefined === elementOutcome) return;
				
				elements[key] = elementOutcome;
				
			});
			
			outcome[me.outcomeElementsName] = elements;
			
			return outcome;
			
		},
		
		getElementOutcome : function(element) {
			
			var 
				key = this.getMappingKey(element),
				result = this.mappedResult[key],
				failure = this.mappedFailures[key]
			;
			
			if (undefined !== result) return result;
			if (undefined != failure) return ({
				failureReason : failure
			});
			
		}
		
		
	});
	
	Actions.NodeAction = Utils.Object.create(Actions.BatchAction, {

		idArg : 'nodeRef',
		outcomeElementsName : 'nodes',
		
		getMappingKey : function(node) {
			return Utils.asString(node.nodeRef);
		},
		
		extractElement : function(nodeRef) {

			var node = Utils.Alfresco.getExistingNode(nodeRef, true /* failsSilently */);
			if (null != node) return node;
			
			throw {
				code : 404,
				message : "InvalidStateException! The provided nodeRef='" + Utils.asString(nodeRef) + "' is not a valid nodeRef or it does not exist in the repository"
			};
			
		},
		
		beforeExecute : function(node) {
			
			this.node = this.element; // backward compatibility => alias element to node
			
		}		
		
		
	});
	
	Actions.TaskNodeAction = Utils.Object.create(Actions.BatchAction, {

		action : null,
		idArg : 'taskRef',
		outcomeElementsName : 'tasks',
		packageResources : [],
		firstPackageResource : null,
		taskName : null,
		
		getMappingKey : function(task) {
			return Utils.asString(task.getId());
		},
		
		extractElement : function(taskRef) {

			var task = workflow.getTask(taskRef);
			if ( (null != task) && !task.isComplete() ) return task;
			
			throw {
				code : 404,
				message : "InvalidStateException! The provided taskRef='" + Utils.asString(taskRef) + "' is not a valid task-reference or it is not available anymore"
			};
			
		},
		
		parseArguments : function() {
			
			this.wsArguments = (this.wsArguments || []).concat({ name : 'action'});
			Actions.BatchAction.parseArguments.call(this);
			
			this.action = this.parseArgs['action']; // may be null
			
//			var action = this.parseArgs['action'];
//			if (null != action) {
//				this.action = action;
//			} else if (null == this.action){
//				throw {
//					code : 400,
//					message : "InvalidArgumentException! The argument 'action' is mandatory"				
//				};
//			}
			
		},
		
		isExecutable : function(task) {
			
			var parentResult = Actions.BatchAction.isExecutable.call(this);
			if (null == this.action) return parentResult;
			
			var transitions = workflowUtils.getTransitions(task) || {};
			return (parentResult && (null != transitions[this.action]) );
			
		},
		
		getFirstPackageResource : function(task) {

			if (null == task) return null;
			return (task.getPackageResources() || [null])[0];
			
		},
		
		beforeExecute : function(task) {
			
			this.firstPackageResource = this.getFirstPackageResource(task);
			this.node = this.firstPackageResource;
			
//			// if not yet assigned (pooled), assign to the current logged user
//			if (null == task.properties['cm:owner']) {
//				
//				var assignedUsername = Utils.Alfresco.getCurrentUserName();
//				workflowUtils.claimTask(task, assignedUsername, true /* force */);
//
//			}
			
		}		
		
	});	
	
	Actions.DocumentNodeHelper = {

		eventType : null,
		node : null,
		
		_init : function(documentNode) {
			
			if (null == documentNode) {
				throw new Error('IllegalArgumentException! the provided document-node has to be valid! (non-null)');
			}
			node = documentNode;
			
		},
	
		updateDocumentState : function(newState) {
			this.node.properties[YammaModel.STATUSABLE_STATUS_PROPNAME] = newState;				
			this.node.save();
		},
		
		updateDocumentHistory : function(commentKey, commentArgs, referrer, delegate) {
			
			// set a new history event
			HistoryUtils.addEvent(this.node,{ 
				eventType : this.eventType,
				key : commentKey,
				args : commentArgs,
				referrer : referrer, /* referrer */
				delegate : delegate /* delegate */
			});
			
		},
		
		getElementOutcome : function(node) {
			return ({
				state : node.properties[YammaModel.STATUSABLE_STATUS_PROPNAME] || ''
			});
		}
		
		
	};
	
	Actions.TaskDocumentNodeAction = Utils.Object.create(Actions.TaskNodeAction, {
		
		beforeExecute : function(task) {
			
			Actions.TaskNodeAction.beforeExecute.apply(this, arguments);
			this.documentNodeHelper = Utils.Object.create(Actions.DocumentNodeHelper, null, [this.firstPackageResource]);
			
		}
		
	});
	
	Actions.DocumentNodeAction = Utils.Object.create(Actions.NodeAction, {
		
		eventType : null,
	
		updateDocumentState : function(newState) {
			this.element.properties[YammaModel.STATUSABLE_STATUS_PROPNAME] = newState;				
			this.element.save();
		},
		
		updateDocumentHistory : function(commentKey, commentArgs, referrer, delegate) {
			
			HistoryUtils.addEvent(this.element,{ 
				eventType : this.eventType,
				key : commentKey,
				args : commentArgs,
				referrer : referrer, /* referrer */
				delegate : delegate /* delegate */
			});
			
		},
		
		getElementOutcome : function(node) {
			return ({
				state : (node || this.element).properties[YammaModel.STATUSABLE_STATUS_PROPNAME] || ''
			});
		}
		
		
	});
	
	
	
	Actions.ManagerDocumentNodeAction = Utils.Object.create(Actions.DocumentNodeAction, {
		
		managerUserName : null,
		
		parseArguments : function() {
			
			this.wsArguments = (this.wsArguments || []).concat('manager');
			Actions.NodeAction.parseArguments.call(this);
			
		},
		
		prepare : function() {
			
			this.managerUserName = Utils.asString(this.parseArgs['manager']);
			
		},
		
		isExecutable : function(node) {
			
			/*
			 * This complexity is not necessary yet but may be in the future.
			 * The batched nodes actions can indeed only receive nodes from the
			 * same service.
			 */
			var isServiceManager = DocumentUtils.isServiceManager(node, this.fullyAuthenticatedUserName);
			if (!isServiceManager && this.managerUserName) {
				isServiceManager = DocumentUtils.isServiceManager(node, this.managerUserName);
			}
			
			if (!isServiceManager) {
				return 'The action cannot be executed by a service-assistant without providing a manager w.r.t. node=\'' + node.nodeRef + '\'';
			}
			
			return true;
			
		},
		
		updateDocumentHistory : function(msgKey, commentArgs) {
			
			Actions.DocumentNodeAction.updateDocumentHistory.call(this, 
				msgKey, 
				commentArgs,
				this.managerUserName || this.fullyAuthenticatedUserName, /* referrer */
				this.fullyAuthenticatedUserName /* delegate */
			);
			
		}


		
	});

})();