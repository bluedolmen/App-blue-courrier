///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">

(function() {
	
	var NEW_POST_TEMPLATE = Utils.Object.create(new TemplateDefinition.Default(), {
		
		templateName : 'new-post-notification.html.ftl',
		
		post : null,

		userDisplayName : '',
		senderDisplayName : null,
	  
		subject : "Publication d'un nouveau commentaire",
	  
		getTemplateArgs : function() {
	    
			var
				document = this.getDocument(this.post),
				
		        templateArgs = {
					document : document,
					posts : null,
		    		userDisplayName : this.userDisplayName,
		    		senderDisplayName : this.senderDisplayName,
		    		subject : this.subject
		        },
		        
		        nowInMs = new Date().getTime(),
		        
		        document
		    ;
			
			templateArgs.posts = [this.post].concat(this.getPreviousPosts(this.post, document));
	    
			return templateArgs;
	    
		},
		
		getDocument : function(post) {
			
			if (null == post) return null;
			
			var
				topic = post.parent,
				forum = null != topic ? topic.parent : null,
				document = null != forum ? forum.parent : null
			;
			
			return document;
			
		},
		
		getPreviousPosts : function(post, document) {
			
			if (null == post) return [];
			
			document = null != document ? this.getDocument(post) : document;
			
			var
				comments = CommentUtils.getComments(document) || [],
				postDate = post.properties['cm:created']
			;
			
			return Utils.Array.filter(comments, function(comment) {
				
				var created = comment.properties['cm:created'];
				if (null == created) return false;
				return (created < postDate);
				
			}).reverse();
			
		}
	  
	});
	
	function main() {
		
		var 
			childAssoc = behaviour.args[0],
			isNew = behaviour.args[1],
			
			topic = childAssoc.getParent(),
			postNode = childAssoc.getChild(),
			targetUsers
			
		;
		
		targetUsers = getTargetUsers(postNode);
		sendMail(postNode, targetUsers);
		
	}
	
	function getTargetUsers(postNode) {
		
		var author = Utils.asString(postNode.properties['cm:creator']);
		
		if (bdNodeUtils.comments.isPrivate(postNode)) {
			
			return Utils.Array.filter(bdNodeUtils.comments.getPrivateDeclaredAuthorities(postNode), function(authority) {
				return (Utils.asString(authority) != author);
			});
			
		}
		
		return []; // Do not implement yet public nodes
		
	}
	
	function sendMail(post, targetUsers) {
		
		Utils.Array.forEach(targetUsers, function(user) {
			
			user = Utils.Alfresco.getPersonScriptNode(user);
			
			var 
				recipientEmail = Utils.asString(user.properties['cm:email']),
				document = NEW_POST_TEMPLATE.getDocument(post)
			;
			if (!recipientEmail) return;
			
			SendMailUtils.sendMail({
				
				recipientEmail : recipientEmail,
				templateDefinition : Utils.Object.create(NEW_POST_TEMPLATE, {
					userDisplayName : Utils.Alfresco.getPersonDisplayName(user),
					post : post,
					document : document
				}),
				
				document : document, // The sending of Alfresco mail is relative to a document, we take the first mail arbitrarily
				silent : true
				
			});
			
		});
		
	}
	
	main();
	
})();
