/**
 * The Comments View Controller.
 * 
 * This controller manages the addition of a new comment.
 */
Ext.define('Yamma.controller.comments.CommentsViewController', {

	extend : 'Ext.app.Controller',
	
	uses : [
		'Yamma.view.comments.PromptMessageBox'
	],
	
	views : [
		'comments.CommentsView'
	],
	
	refs : [
		{
			ref : 'commentsView',
			selector : 'commentsview'
		}
	],
	
	init: function() {
		
		this.control({
			
			'commentsview #addComment' : {
				click : this.onAddCommentClick
			}
			
		});

		this.callParent(arguments);
		
	},
	
	/**
	 * Add-Button click-handler.
	 * 
	 * @private
	 */
	onAddCommentClick : function() {
		
		var me = this;
		
		Yamma.view.comments.PromptMessageBox.prompt(
			{
				title : 'Ajouter un commentaire',
				callback : function(buttonId, text, opt) {
					if ('ok' !== buttonId) return;
					me.addDocumentComment(text);
				}
			}
		);
		
	},
	
	/**
	 * Performs the action of adding a comment to the current document.
	 * 
	 * @param {String}
	 *            comment The comment as a HTML formatted String
	 */
	addDocumentComment : function(comment) {

		var
			commentsView = this.getCommentsView(),
			documentNodeRef = commentsView.getDocumentNodeRef(),
			url = Bluexml.Alfresco.resolveAlfrescoProtocol(
				'alfresco://api/node/' + documentNodeRef.replace(/:\//,'') + '/comments'
			)
		;
		
		Bluexml.Alfresco.jsonPost(
			{
				url : url,
				dataObj : {
					nodeRef : documentNodeRef,
					content : comment
				}
			},
			
			function(jsonResponse) { /* onSuccess */
				commentsView.refresh(); 
			}
		);	
		
	}
	
	
	
});