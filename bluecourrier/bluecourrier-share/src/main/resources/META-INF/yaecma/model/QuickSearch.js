Ext.define('Yaecma.model.QuickSearch',{
	
	extend : 'Ext.data.Model',
	
    fields: [
        {name: 'nodeRef', type: 'string'},
        {name: 'name',  type: 'string', mapping : 'cm:name'},
        {name: 'title', type : 'string', mapping : 'cm:title'},
        {
        	name: 'display', 
        	type : 'string', 
        	convert : function(value, record) {
        		
        		var 
        			name = record.get('name'),
        			title = record.get('title'),
        			icon = record.get('icon16'),
        			displayValue = ''
        				+ '<div>'
	        				+ (icon ? '<img src="' + icon + '" align="left" style="padding-right:4px; vertical-align:middle" ></img> ' : '')
	        				+ (name ? '<span><b>' + name + '</b></span>' : '')
	        				+ (title && title != name ? '<span> (<i>' + title + '</i>)</span>' : '')
        				+ '</div>'
        		;
        		
        		return displayValue;
        	}
        }
    ]
});
