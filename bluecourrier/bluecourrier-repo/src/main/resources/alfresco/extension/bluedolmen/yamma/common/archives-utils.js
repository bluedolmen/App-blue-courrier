(function() {
	
	ArchivesUtils = {
	
		ARCHIVES_LOCATION_SITE_PATH : 'documentLibrary',
		
		ARCHIVES_CONTAINER_TYPE : 'cm:folder',
		ARCHIVES_FOLDER_NAME : 'archives',
		ARCHIVES_FOLDER_TITLE : 'Archives',
		ARCHIVES_SITE_ROOT_PATH : 'cm:documentLibrary'
		
	}
	
	ArchivesUtils.getArchivesContainer = function(siteNode, createIfNotExists /* default = false */) {
		
		if (null == siteNode) return;
		
		createIfNotExists = (createIfNotExists === true);
		
		var 
			archivesPath = this.ARCHIVES_SITE_ROOT_PATH + '/' + 'cm:' + this.ARCHIVES_FOLDER_NAME,
			archivesContainer = siteNode.childrenByXPath(archivesPath)[0]
		;
		
		if (null == archivesContainer && createIfNotExists) {
			archivesContainer = this.createArchivesFolder(siteNode);
		}
		
		return archivesContainer;
		
	}
	
	ArchivesUtils.getArchivedDocuments = function(siteNode) {
		
		if (null == siteNode) return [];
		
		var archivesContainer = this.getArchivesContainer(siteNode);
		if (null == archivesContainer) return [];
		
		return archivesContainer.children;
	}
		
	ArchivesUtils.createArchivesFolder = function(siteNode) {
		
		if (null == siteNode) return;
		
		var
			siteName = siteNode.name,
			archivesFolder = this.getArchivesContainer(siteNode, false /* createIfNotExists */)
		;
		
		if (null == archivesFolder) {
			var parentFolder = Utils.Alfresco.createPath(siteNode, this.ARCHIVES_SITE_ROOT_PATH);
			archivesFolder = parentFolder.createNode(
				this.ARCHIVES_FOLDER_TITLE, /* name */
				this.ARCHIVES_CONTAINER_TYPE, /* type */
				[], /* properties */
				'cm:contains', 
				'cm:' + this.ARCHIVES_FOLDER_NAME /* assocName */
			);
			
			archivesFolder.addAspect('cm:titled');
			archivesFolder.properties['cm:title'] = this.ARCHIVES_FOLDER_TITLE;
			archivesFolder.save();
			
			archivesFolder.setPermission('SiteManager', 'GROUP_site_' + siteName + '_SiteManager');
			archivesFolder.setInheritsPermissions(false);
		}
		
		if (null == archivesFolder) {
			throw { message : "Cannot create the archives folder in the site '" + siteNode.name + "'" };
		}
		
		return archivesFolder;
	};
	
	ArchivesUtils.moveToArchives = function(document) {
		
		if (null == document) {
			throw "IllegalArgumentException! The provided document is not valid (null or undefined)";
		}
		
		var 
			documentContainer = DocumentUtils.getDocumentContainer(document), 
			enclosingSite = DocumentUtils.getCurrentServiceSite(document)
		;
		if (null == documentContainer || null == enclosingSite) return false;
		
		var archivesFolder = this.getArchivesContainer(enclosingSite.node, true);
		if (null == archivesFolder) return false;
		
		return documentContainer.move(archivesFolder);
	}	
	
})();
