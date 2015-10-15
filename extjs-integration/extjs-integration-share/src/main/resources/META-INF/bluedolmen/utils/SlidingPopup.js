Ext.define('Bluedolmen.utils.SlidingPopup', {
	
	singleton : true,
	
	msgCt : null,
	
	createBox : function(t, s){
		return '<div class="msg"><h3>' + t + '</h3><p>' + s + '</p></div>';
	},
	
    msg : function(title, config){
    	
        if(!this.msgCt){
            this.msgCt = Ext.DomHelper.insertFirst(document.body, {id:'msg-div'}, true);
        }
        
        if (!Ext.isString(title)) {
        	config = title;
        	title = config.title;
        }
        
        var 
        	message = Ext.isString(config) ? config : config.message,
        	delay = config.delay || 1000,
        	m = Ext.DomHelper.append(this.msgCt, this.createBox(title, message), true)
        ;
        
        m.hide();
        m.slideIn('t').ghost("t", { delay: delay, remove: true});

    }
	
});
