<#macro actionsForm status>
<form action="${url.context}/service/bluexml/init/${status.id}/action" method="post">
	<input type="hidden" name="init-id" value="${status.id}"/>
	<input type="hidden" name="redirect" value="${url.context}/service/bluexml/init/list?format=html"/>
	<#list status.actions as action>
		<div>
		<input type="submit" name="action_${action.id}" value="${action.title!action.id}"/>
		</div>
	</#list>
</form>
</#macro>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
   <head>
	   <title>Initialization Home</title> 
	   <link rel="stylesheet" href="/alfresco/css/webscripts.css" type="text/css" />
	</head>

	<body>
		<div>
		
			<table>
				<tr>
					<td>
						<img src="/alfresco/images/logo/AlfrescoLogo32.png" alt="Alfresco" />
					</td>
					<td><span class="title">Initialization Home</span></td>
				</tr>
			</table>
			
			<br/>
			
			<table width="100%">
			<#list statuses as status>
				<tr>
					<td width="200px" valign="top">${(status.id!"")?html}</td>
					<td width="200px" valign="top">${status.state?html}</td>
					<td width="400px" valign="top">
						<pre>${(status.details!"")?html}</pre>
					</td>
					<td width="100px">
						<@actionsForm status/>
					</td>
				</tr>
			</#list>
			</table>
			
		</div>
	</body>
</html>

