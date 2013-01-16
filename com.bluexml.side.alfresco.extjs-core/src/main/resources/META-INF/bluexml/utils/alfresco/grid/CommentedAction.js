Ext.define('Bluexml.utils.alfresco.grid.CommentedAction', {
	
	uses : [
		'Bluexml.windows.CommentInputDialog'
	],

	commentTitle : "Commentaire",
	commentMessage : "Entrez un commentaire pour cette action.",
	
	askForComment : function() {
		
		var
			me = this,
			args = arguments
		;
			
		Bluexml.windows.CommentInputDialog.askForComment(
			{
				title : this.commentTitle,
				msg : this.commentMessage,
				modal : true
			}, /* overrideConfig */
			onCommentAvailable
		);
			

		function onCommentAvailable(comment) {
			
			var params = ['preparationReady'].concat(Ext.Array.slice(args)).concat(comment);
			me.fireEvent.apply(me, params);
			
		}
		
	}
	
});