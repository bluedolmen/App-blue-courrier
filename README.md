# App Blue Courrier Configuration

## Trays initialization

Trays are normally initialized through a policy but you can initialize them at any time through this code snippet:

        <import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">

        var sites = siteService.listSites("","");

        Utils.forEach(sites, function(site) {

          var siteNode = site.node;
          if (YammaUtils.isConfigSite(siteNode)) return;

          TraysUtils.createSiteTrays(siteNode);

        });

## Initializing the services

Use the ServicesUtils helper. This helper is available through the importing of the yamma environment:

<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">

### Declaring a site as a service

    ServicesUtils.setAsService('myservice');

### Declaring a site as a signing service

    ServicesUtils.setAsService('myservice', true /* canSign */);
    OR
    ServicesUtils.setAsService('myservice', { canSign : true });

### Declaring a pole/service structure

    ServicesUtils.setAsService('myservice', { parent : 'mypole' });
    OR
    ServicesUtils.setParentService('myservice','mypole',true /* forceReset */)

Of course, you can also declare a signing and hierarchical service/pole:

    ServicesUtils.setAsService('myservice',{
        canSign : true,
        parent : 'mypole'
    });

# License

    Blue Courrier is a software to manage ingoing and outgoing mails

    Copyright (C) 2013 BlueDolmen www.bluedolmen.org

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
