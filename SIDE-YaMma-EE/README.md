# Sites/services management

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
