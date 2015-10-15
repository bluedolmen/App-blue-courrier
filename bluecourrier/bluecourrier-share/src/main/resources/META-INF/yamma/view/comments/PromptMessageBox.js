Ext.define('Yamma.view.comments.PromptMessageBox', {

	extend : 'Ext.window.MessageBox',
	alias : 'widget.promptmessagebox',
	
	requires : [
		'Ext.form.field.HtmlEditor'
	],
	
	title : 'Ajouter un commentaire',
	width : 450,
	height : 250,
	
	statics : {
		
	    prompt : function(config){
	    	
	    	var 
	    		msgBox = Ext.create('Yamma.view.comments.PromptMessageBox'),
	    		cfg = Ext.apply({
			            msg : '',
			            buttons : Ext.MessageBox.OKCANCEL,
			            resizable : true
			        },
			        config
	    		)
	    	;
	        
			msgBox.htmlEditor.setValue(cfg.value);
	        return msgBox.show(cfg);
	    }	
		
	},
	
	initComponent : function() {
		
		this.callParent();
		this.htmlEditor = Ext.create('Ext.form.field.HtmlEditor');
		this.promptContainer.add(this.htmlEditor);
		
	},
	
    btnCallback: function(btn) {
    	
        var me = this,
            field = me.htmlEditor,
            value = field.getValue()
		;
		field.reset();

        // Important not to have focus remain in the hidden Window; Interferes with DnD.
        btn.blur();
        me.hide();
        me.userCallback(btn.itemId, value, me.cfg);
    }	
	
	
	
	
});