Ext.define('Yamma.view.dialogs.AboutDialog', {

	extend : 'Ext.window.Window',
	alias : 'widget.aboutdialog',
	
	title : 'A propos',
	height : 300,
	width : 450,
	modal : true,
	
	layout : 'vbox',
	
	imgSrc : '/alfresco/service/bluedolmen/yamma/logo.png',
	
	defaults : {
		margin : 10,
		flex : 1,		
		width : '100%',
		border : 1
	},
	
	headerPosition : Yamma.utils.Preferences.getPV(Yamma.utils.Preferences.PREFERED_HEADER_POSITION),
	
	renderTo : Ext.getBody(),
	
	initComponent : function() {
		
		var
			me = this,
			html, svnrev, version
		;
		
		this.aboutTemplate = new Ext.XTemplate(
			'<div class="about-dialog">',
				'<div class="image">', '<img src="' + this.imgSrc + '" />', '</div>',
				'<div class="version">',
					'<div class="main">v. {version}</div>',
					'<div class="revision">rév. {revision}</div>',
					'<div class="date">{buildDate}</div>',
				'</div>',
				'<div class="application-name">{applicationName}</div>',
				'<div class="description">{description}</div>',
			'</div>'
		);
		
		svnrev = Yamma.config.client['application.svnrev'];
		if (!svnrev || -1 != svnrev.indexOf('$')) { // fallback on revision
			svnrev = Yamma.config.client['application.revision'];
		}
		
		version = Yamma.config.client['application.full-version'];
		if (!version || -1 != version.indexOf('$')) {
			version = Yamma.config.client['application.version'];
		}
		
		html = this.aboutTemplate.apply({
			
			applicationName : Yamma.config.client['application.name'],
			description : Yamma.config.client['application.description'],
			version : version,
			revision : svnrev,
			buildDate : Yamma.config.client['application.build-date']
			
		});
		
		this.items = [
		    {
				xtype : 'component',
				html : html
		    }
		];
		
		this.callParent();
		
	}
	
});