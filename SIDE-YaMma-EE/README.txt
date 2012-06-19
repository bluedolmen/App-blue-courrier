 						SIDE Project README
==========================================================================

Table of Contents:
------------------
- Introduction
- Configuration
- Usage
- Customization
- Custom Modules
- Pointers & License Notice


Introduction:
-------------

This generated project aim to :
* beside SIDE process to include host specific configuration
* include your own alfresco/share modules
* build and package all stuff as an archive that can be used to deploy on 

Configuration:
-------------
edit build.<userName>.properties

Usage:
-------------
1 - create SIDE project
* option Data diagram
* fill package "pk1/pk2"

2 - edit data model

3 - edit application model (manage configuration)
* select alfresco data model generator
* select alfresco deployer (not direct one)
* fill tomcat.home and alfresco-mmt.jar location
* save/close

4 - use command "Generate Ant build file" on application model, this generate another ant build file that execute SIDE process, this file is used in
the main build ant script at your project home

Now minimal configuration is set and the build.xml ant file can be used

5 - select /<project>/build.xml file right click open run as/Ant Build …
* on "JRE" tab, select "Run in the same JRE as the workspace", this allow to run ant task embedded in Eclipse
* run configuration, Eclipse will execute Ant build script

6 - at the end build folder must contains a zip file ready to be unziped in yout tomcat installation (that contains alfresco)
you can use install instead of applyConfig target, this execute applyConfig produce the same zip file but also unzip archive in tomcat.


Customization:
--------------
You can edit generated ant build file to fit your needs.


Custom modules:
---------------
If you have some amp that you want to install, just add them in <project.home>/src/modules or any subdirectory,
the target "copyForSideDeployer" will copy them in right folder to allow alfresco deployer to install them all.

If you can use maven2, and have it installed you can :
- define in your build.{username}.properties the maven.home property to enable maven build
- create new maven2 project inside <project.home>/src/modules/mavenProjects (this project must produce amp or zip file)
- add this project as maven module in the pom.xml in <project.home>/src/modules/mavenProjects/pom.xml, so "build" target will build your project.


Pointers & License notices :
----------------------------
For support, refer to: http://www.side-labs.org/forum
More information at http://www.side-labs.org and www.bluexml.com

Copyright (C) 2007-2009  BlueXML - www.bluexml.com

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.


