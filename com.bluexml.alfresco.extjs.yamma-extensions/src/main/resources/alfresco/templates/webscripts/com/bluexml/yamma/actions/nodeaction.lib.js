///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/actions/common.lib.js">
///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/actions/parseargs.lib.js">

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
	
	Actions.NodeAction = Utils.Object.create({
		
		fullyAuthenticatedUserName : Utils.Alfresco.getFullyAuthenticatedUserName(),
		
		parseArgs : null,
		
		node : null, // iterator on nodes
		nodes : null,
		
		wsArguments : null,
		nodeArg : 'nodeRef',

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
			
				me.extractNodes();
				
				me.prepare();
				
				if (!me.isBatchExecutable()) {
					throw {
						code : '403',
						message : 'Forbidden! The action cannot be executed by you in the current context' + (me.failureReason ? ': ' + me.failureReason : '')
					}			
				}
				
				// All methods before this point may fail with an exception
				// The execution may not fail if 'failOnError' is set to false
				
				me.doBatchExecute();
				
				me.setModel();
				
			});
			
		},
		
		parseArguments : function() {
			
			var 
				wsArguments = (this.wsArguments || []).concat({ name : this.nodeArg, mandatory : true})
			;
			
			this.parseArgs = this.parseArgs || ( new ParseArgs(wsArguments) );
			
		},
		
		extractNodes : function() {
			
			if (null == this.nodeArg) {
				throw {
					code : '512',
					message : 'IllegalStateException! The node-argument is invalid'
				}
			}
			
			var 
				me = this,
				nodeArg = this.nodeArg,
				nodeRef = this.parseArgs[nodeArg]
			;
			nodeRef = Utils.String.trim(Utils.asString(nodeRef));
			
			if (Utils.Alfresco.isNodeRef(nodeRef)) {
				this.node = this.extractNode(nodeRef);
				this.nodes = [this.node];
			} else if (nodeRef.indexOf(',') > 0) {
				
				// Accept with or without square-brackets
				if (nodeRef.indexOf('[') == 0) {
					// Trim first and last characters
					nodeRef = nodeRef.substr(1, nodeRef.length - 2);
				}
				
				var nodeRefList = nodeRef.split(',');
				
				this.nodes = Utils.map(nodeRefList, function(nodeRef) {
					return me.extractNode(nodeRef);
				});
				
			} else {
				
				throw {
					code : '512',
					message : 'IllegalStateException! The node-argument is invalid w.r.t. its format'
				}
				
			}
			
			
		},
		
		extractNode : function(nodeRef) {

			var node = Utils.Alfresco.getExistingNode(nodeRef, true /* failsSilently */);
			if (null != node) return node;
			
			throw {
				code : '512',
				message : "InvalidStateException! The provided nodeRef='" + Utils.asString(nodeRef) + "' is not a valid nodeRef or it does not exist in the repository"
			};
			
		},
		
		prepare : function() {
			
		},
		
		isBatchExecutable : function() {
			
			var
				me = this,
				isExecutable = true
			;
			
			Utils.forEach(this.nodes, function(node) {
				me.node = node;
				var _isExecutable = me.isExecutable(node);
				
				if ('string' == typeof _isExecutable) {
					// failure
					this.failureReason = _isExecutable;
				}
				
				isExecutable &= ( true === _isExecutable );
				return isExecutable; // breaks on isExecutable == false
			});
			
			return isExecutable;
			
		},
		
		isExecutable : function(node) {
			return true;
		},
		
		doBatchExecute : function() {
			
			var me = this;
			
			Utils.forEach(this.nodes, function(node) {
				
				me.node = node;
				var key = Utils.asString(node.nodeRef);
				
				try {
					
					var 
						result = me.doExecute(node)
					;
					
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
		
		doExecute : function(node) {
			// Should be implemented by prototyping classes
		},
		
		setModel : function() {
			
			var failedNodesNb = Utils.keys(this.mappedFailures).length;
			
			model.actionStatus = failedNodesNb == 0 ? 'success' : failure;
			model.actionOutcome = this.getActionOutcome(); 
			
		},
		
		getActionOutcome : function() {
			
			var 
				me = this,
				nodes = {}
			;
			
			Utils.forEach(this.nodes, function(node) {
				
				var
					nodeRef = Utils.asString(node.nodeRef),
					nodeOutcome = me.getNodeOutcome(node)
				;
				if (undefined === nodeOutcome) return;
				
				nodes[nodeRef] = nodeOutcome;
				
			})
			
			return ({
				nodes : nodes
			});
			
		},
		
		getNodeOutcome : function(node) {
			var 
				nodeRef = Utils.asString(node.nodeRef),
				result = this.mappedResult[nodeRef],
				failure = this.mappedFailures[nodeRef]
			;
			
			if (undefined !== result) return result;
			if (undefined != failure) return ({
				failureReason : failure
			});
		}
		
	});
	
	Actions.DocumentNodeAction = Utils.Object.create(Actions.NodeAction, {
		
		eventType : null,
	
		updateDocumentState : function(newState) {
			this.node.properties[YammaModel.STATUSABLE_STATE_PROPNAME] = newState;				
			this.node.save();
		},
		
		updateDocumentHistory : function(commentKey, commentArgs, referrer, delegate) {
			
			if (null == this.eventType) return;
			
			var 
				message = msg.get(commentKey, commentArgs || []),
				trimmedMessage = Utils.String.trim(message)
			;
			
			// set a new history event
			HistoryUtils.addHistoryEvent(
				this.node, 
				this.eventType, /* eventType */
				message, /* comment */
				referrer, /* referrer */
				delegate /* delegate */
			);
			
		},
		
		getNodeOutcome : function(node) {
			return ({
				state : node.properties[YammaModel.STATUSABLE_STATE_PROPNAME] || ''
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

	Actions.InstructorDocumentNodeAction = Utils.Object.create(Actions.DocumentNodeAction, {
				
		updateDocumentHistory : function(msgKey, commentArgs) {
			
			var
				assignedAuthority = DocumentUtils.getAssignedAuthority(this.node),
				isAssignedAuthority = DocumentUtils.isAssignedAuthority(this.node, this.fullyAuthenticatedUserName)				
			;
			
			Actions.DocumentNodeAction.updateDocumentHistory.call(this, 
				msgKey, 
				commentArgs,
				assignedAuthority, /* referrer */
				isAssignedAuthority ? null : this.fullyAuthenticatedUserName /* delegate */
			);
			
		}

		
	});
	
	
})();