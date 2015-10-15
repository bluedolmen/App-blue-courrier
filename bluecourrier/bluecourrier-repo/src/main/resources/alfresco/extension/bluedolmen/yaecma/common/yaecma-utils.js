(function() {
	
	var YaecmaUtils = Utils.ns('Yaecma.Utils');
	
	YaecmaUtils.buildFileFoldersLuceneQuery = function(config) {
		
		config = config || {};
		
		var 
			showFiles = config.showFiles !== false,
			showFolders = config.showFolders !== false,
			showLinks = config.showLinks !== false,
			showHidden = config.showHidden === true,
			parentNodeRef = config.parent,
			
			query = 
				( parentNodeRef ? (' +PRIMARYPARENT:"' + parentNodeRef + '"' ) : '' ) +
				' +(' +
					( showFiles ? 'TYPE:"cm:content"' : '') +
					( showFolders ? ' TYPE:"cm:folder"' : '') +
					( showLinks ? ' TYPE:"cm:link"' : '') +
				')' +
				( showHidden ? '' : ' -ASPECT:"sys:hidden"') +
				( showFolders ? ' -TYPE:"cm:systemfolder"' : '' )
		;		
		
		return query;
		
	}
	
})();