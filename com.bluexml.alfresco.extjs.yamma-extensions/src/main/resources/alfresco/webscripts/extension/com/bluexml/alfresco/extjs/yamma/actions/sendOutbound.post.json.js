///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/actions/common.lib.js">
///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/actions/parseargs.lib.js">
///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">

(function() {
	
	const SEND_OUTBOUND_EVENT_TYPE = 'send-outbound';
	
	// PRIVATE
	var 
		fullyAuthenticatedUserName = Utils.Alfresco.getFullyAuthenticatedUserName(), /* string */
		documentNode, /* ScriptNode */ 
		sentByMail, /* boolean */
		skipValidation
	;
	
	// MAIN LOGIC
	
	Common.securedExec(function() {
		
		var 
			parseArgs = new ParseArgs(
				{ name : 'nodeRef', mandatory : true}, 
				{ name : 'sentByMail', defaultValue : 'true' }, 
				{ name : 'skipValidation', defaultValue : 'false' } 
			),
			documentNodeRef = parseArgs['nodeRef']
		;
		
		sentByMail = ( Utils.asString(parseArgs['sentByMail']) === 'true' );
		skipValidation = ( Utils.asString(parseArgs['skipValidation']) === 'true' );
		
		documentNode = search.findNode(documentNodeRef);
		if (!documentNode) {
			throw {
				code : '512',
				message : 'IllegalStateException! The provided nodeRef does not exist in the repository'
			};
		}
		
		if (!ActionUtils.canSendOutbound(documentNode, fullyAuthenticatedUserName)) {
			throw {
				code : '403',
				message : 'Forbidden! The action cannot be executed by you in the current context'
			};			
		}
		
		if (skipValidation && !ActionUtils.canSkipValidation(documentNode, fullyAuthenticatedUserName)) {
			throw {
				code : '403',
				message : 'Forbidden! You are not allowed to skip validation in the current context'
			};						
		}
					
		main();
		
	});
	
	function main() {
		
		updateDocumentState();
		manageSentByMail();
		manageSkippedValidation();
		addHistoryComment();
		setModel(documentNode);
		
	}
	
	function updateDocumentState() {
		
		var newState = (skipValidation === true) ?
			YammaModel.DOCUMENT_STATE_SENDING :
			YammaModel.DOCUMENT_STATE_VALIDATING_PROCESSED
		;
		documentNode.properties[YammaModel.STATUSABLE_STATE_PROPNAME] = newState;
		
		// Also update writing-date if not yet filled
		var writingDate = documentNode.properties[YammaModel.MAIL_WRITING_DATE_PROPNAME];
		if (!writingDate) {
			documentNode.properties[YammaModel.MAIL_WRITING_DATE_PROPNAME] = new Date();
		}
		
		documentNode.save();
		
	}
	
	function manageSentByMail() {
		
		if (sentByMail !== true) return;
		
		var replies = ReplyUtils.getReplies(documentNode);
		Utils.forEach(replies, function(reply) {
			reply.addAspect(YammaModel.SENT_BY_EMAIL_ASPECT_SHORTNAME);
		});
		
	}
	
	function manageSkippedValidation() {
		
		if (skipValidation !== true) return;

		// Moves the document to the outbox tray of the service
		var message = DocumentUtils.moveToSiblingTray(documentNode, TraysUtils.OUTBOX_TRAY_NAME);
		if (message) {
			throw {
				code : '512',
				message : 'IllegalStateException! ' + message
			};			
		}
		
	}
	
	function addHistoryComment() {
		
		var 
			replies = ReplyUtils.getReplies(documentNode),
			formattedRepliesTitle = Utils.reduce(
				replies, 
				function(replyNode, aggregateValue, isLast) {
					var replyTitle = replyNode.properties.title || replyNode.name;
					return aggregateValue + replyTitle + (isLast ? '' : ', ');
				},
				''
			)
		;
		
		updateDocumentHistory(
			replies.length > 1 ? 'sendOutboundMails.comment' : 'sendOutboundMail.comment', 
			[
				formattedRepliesTitle 
			]
		);
		
	}
	
	function updateDocumentHistory(commentKey, args) {
		
		var 
			message = msg.get(commentKey, args),
			assignedAuthority = DocumentUtils.getAssignedAuthority(documentNode),
			isAssignedAuthority = DocumentUtils.isAssignedAuthority(documentNode, fullyAuthenticatedUserName)
		;
		
		// set a new history event
		HistoryUtils.addHistoryEvent(
			documentNode, 
			SEND_OUTBOUND_EVENT_TYPE, /* eventType */
			message, /* comment */
			assignedAuthority, /* referrer */
			isAssignedAuthority ? null : fullyAuthenticatedUserName /* delegate */
		);
		
	}
	
	function setModel(documentNode) {
		model.documentNodeRef = Utils.asString(documentNode.nodeRef);
	}
	
	
})();