How to install BlueCourrier
===========================

# Get BlueCourrier

There are several ways to get BlueCourrier :

* From war file : go to the release page and download our prepackaged Alfresco 5.0.d war file (comming soon)
* Install the extension : go to the release page and download our Alfresco 5.0.d extension file and install them on top of your Alfresco instance. (comming soon)
* From the source see our [Build instructions](BUILD.md)

When it's done you can get back here and follow the installation instruction.

# Installation from the war file

To get BlueCourrier running quickly you just have to :

* deploy the 2 war file into an alfresco-5.0.d installation 
* unzip extjs.zip (located in target/artifacts) into tomcat/webapps directory
* and follow the [App Blue Courrier Configuration](INSTALL.md)

# Installation from the artifacts

This method you need the following files :
* alfresco-extensions-1.0-alf5.0.amp
* bluecourrier-repo-2.1-alf5.0.amp 
* bluecourrier-share-2.1-alf5.0.jar
* extjs-integration-share-1.0-alf5.0.jar
* extjs.zip

To install BlueCourrier follow those steps: 

* install alfresco-extensions-1.0-alf5.0.amp to your alfresco war or deployed folder
* install bluecourrier-repo-2.1-alf5.0.amp to your alfresco war or deployed folder
* deploy bluecourrier-share-2.1-alf5.0.jar to your Share WEB-INF/lib directory
* deploy extjs-integration-share-1.0-alf5.0.jar to your Share WEB-INF/lib directory
* unzip the extjs.zip file into the tomcat webapps folder
