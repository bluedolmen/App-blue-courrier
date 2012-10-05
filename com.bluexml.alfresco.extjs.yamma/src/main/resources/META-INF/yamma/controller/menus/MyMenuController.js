Ext.define('Yamma.controller.menus.MyMenuController', {
	
	extend : 'Yamma.controller.menus.MainMenuController',
	
	init: function() {
		
		this.control({
			'mymenu': {
				itemclick : this.onItemClick
			}
		});
		
		this.callParent();
	},	
	
	extractContext : function(record) {
		
		if (!record) return {};
		
		var context = Ext.create('Yamma.utils.Context');
		var nodeId = record.get('id');
		
		switch (nodeId) {
			
			case Yamma.view.menus.MyMenu.MY_DOCUMENTS_ASSIGNED:
				context.setTitle('Documents assignés à traiter');
				context.setFilters([
					{
						property : 'mine',
						value : true // fake value
					},
					{
						property : 'state',
						value : 'delivering'
					}					
				]);
			break;
			
			case Yamma.view.menus.MyMenu.MY_DOCUMENTS_PROCESSING:
				context.setTitle('Documents assignés en cours de traitement');
				context.setFilters([
					{
						property : 'mine',
						value : true // fake value
					},
					{
						property : 'state',
						value : 'processing'
					}
				]);
			break;
			
			case Yamma.view.menus.MyMenu.MY_DOCUMENTS_VALIDATING:
				context.setTitle('Documents assignés en cours de validation par la direction');
				context.setFilters([
					{
						property : 'mine',
						value : true // fake value
					},
					{
						property : 'state',
						value : 'validating!processed'
					}
				]);
			break;
			
			case Yamma.view.menus.MyMenu.MY_DOCUMENTS_LATE:
				context.setTitle('Documents assignés en retard à traiter');
				context.setFilters([
					{
						property : 'mine',
						value : true // fake value
					},
					{
						property : 'late',
						value : true
					}
				]);
			break;
			
			default:
				context.setTitle('Documents assignés');
				context.setFilters([
					{
						property : 'mine',
						value : true // fake value
					}
				]);
			break;			
			
		}
		
		
		return context;
		
	}
	
	
	
	
});