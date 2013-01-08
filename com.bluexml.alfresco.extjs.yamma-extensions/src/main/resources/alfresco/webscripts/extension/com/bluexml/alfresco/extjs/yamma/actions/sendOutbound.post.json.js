///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/actions/common.lib.js">
///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/actions/parseargs.lib.js">
///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/send-utils.js">

(function() {
	
	const SEND_OUTBOUND_EVENT_TYPE = 'send-outbound';
	
	// PRIVATE
	var 
		fullyAuthenticatedUserName = Utils.Alfresco.getFullyAuthenticatedUserName(), /* string */
		documentNode, /* ScriptNode */ 
		sendByMail, /* boolean */ // whether the reply will be sent by mail on the designed step
		skipValidation
	;
	
	// MAIN LOGIC
	
	Common.securedExec(function() {
		
		var 
			parseArgs = new ParseArgs(
				{ name : 'nodeRef', mandatory : true}, 
				{ name : 'sendByMail', defaultValue : 'true' }, 
				{ name : 'skipValidation', defaultValue : 'false' } 
			),
			documentNodeRef = parseArgs['nodeRef']
		;
		
		sendByMail = ( Utils.asString(parseArgs['sendByMail']) === 'true' );
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
		
		fixWritingDate();
		manageSendByMail();
		
		if (skipValidation === true) {
			SendUtils.sendDocument(documentNode);
		} else {
			sendToValidation();
		}
		
		addHistoryComment();
		setModel(documentNode);
		
	}
	
	function fixWritingDate() {
		
		// Also update writing-date if not yet filled
		var writingDate = documentNode.properties[YammaModel.MAIL_WRITING_DATE_PROPNAME];
		if (!writingDate) {
			documentNode.properties[YammaModel.MAIL_WRITING_DATE_PROPNAME] = new Date();
		}
		documentNode.save();
		
	}
	
	/**
	 * If the replies are meant to be sent by mail, then add the corresponding
	 * aspect to the contained replies
	 */
	function manageSendByMail() {
		
		if (sendByMail !== true) return;
		
		var replies = ReplyUtils.getReplies(documentNode);
		Utils.forEach(replies, function(reply) {
			reply.addAspect(YammaModel.SENT_BY_EMAIL_ASPECT_SHORTNAME);
		});
		
	}	
	
	function sendToValidation() {
		documentNode.properties[YammaModel.STATUSABLE_STATE_PROPNAME] = YammaModel.DOCUMENT_STATE_VALIDATING_PROCESSED;
		documentNode.save();
	}	
	
	function addHistoryComment() {
		
		var 
			replies = ReplyUtils.getReplies(documentNode),
			replyNames = Utils.map(replies, function(replyNode) {
				return replyNode.properties.title || replyNode.name;
			}),			
			formattedRepliesTitle = Utils.String.join(replyNames, ',')
		;
		
		updateDocumentHistory(
			replies.length > 1 ? 'sendOutboundMails.comment' : 'sendOutboundMail.comment', 
			[
				formattedRepliesTitle,
				skipValidation ? 'envoi' : 'validation'
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
			SEND_OUTBOUND_EVENT_TYPE + '!' + (skipValidation ? 'sendOut' : 'sendToValidation'), /* eventType */
			message, /* comment */
			assignedAuthority, /* referrer */
			isAssignedAuthority ? null : fullyAuthenticatedUserName /* delegate */
		);
		
	}
	
	function setModel(documentNode) {
		model.documentNodeRef = Utils.asString(documentNode.nodeRef);
	}
	
	
})();