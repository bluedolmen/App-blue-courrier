<#escape x as jsonUtils.encodeJSONString(x)>
{
	success : true,
	traysNodeRef : "${targetTrayNodeRef}",
	newCopiedDocuments : [<#list newCopiedDocuments as doc>"${doc.nodeRef}"<#if doc_has_next>,</#if></#list>]
}
</#escape>