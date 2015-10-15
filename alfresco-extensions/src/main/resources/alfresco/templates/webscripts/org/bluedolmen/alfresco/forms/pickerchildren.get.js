///<import resource="classpath:/alfresco/templates/webscripts/org/alfresco/repository/forms/pickerchildren.get.js">

/**
 * Resolve "virtual" nodeRefs, nodeRefs and xpath expressions into nodes
 * 
 * This is an overridden version of the OOTB Alfresco version.
 * This one also resolve site-datalists.
 *
 * @method resolveNode
 * @param reference {string} "virtual" nodeRef, nodeRef or xpath expressions
 * @return {ScriptNode|null} Node corresponding to supplied expression. Returns null if node cannot be resolved.
 */
function resolveNode(reference)
{
   var 
   	node = null,
   	match = null,
   	selectableType = args['selectableType'];
   ;
   try
   {
      if (reference == "alfresco://company/home")
      {
         node = companyhome;
      }
      else if (reference == "alfresco://user/home")
      {
         node = userhome;
      }
      else if (reference == "alfresco://sites/home")
      {
         node = companyhome.childrenByXPath("st:sites")[0];
      }
      else if (reference == "alfresco://company/shared")
      {
         node = companyhome.childrenByXPath("app:shared")[0];
      }
      else {
    	  
    	  match = reference.match(/alfresco:\/\/([A-Za-z0-9]*)\/datalists/);
    	  if (match && selectableType) {
    		  node = findDataList(match[1], selectableType); 
    	  }
	      else if (reference.indexOf("://") > 0)
	      {
	         node = search.findNode(reference);
	      }
	      else if (reference.substring(0, 1) == "/")
	      {
	         node = search.xpathSearch(reference)[0];
	      }
    	  
      }
   }
   catch (e)
   {
      return null;
   }
   return node;
}

function findDataList(siteName, dataListItemType) {
	
	if (logger.isLoggingEnabled())
		logger.log("siteName = " + siteName);
      
	var datalists = search.xpathSearch("/app:company_home/st:sites/cm:" + search.ISO9075Encode(siteName) + "/cm:dataLists")[0] || null;
	if (!datalists) return null;
	
	return datalists.childrenByXPath("*[@dl:dataListItemType='" + dataListItemType + "']")[0] || null;
	
}
