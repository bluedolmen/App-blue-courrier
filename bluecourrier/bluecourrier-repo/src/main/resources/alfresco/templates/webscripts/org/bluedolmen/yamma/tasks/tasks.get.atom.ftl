<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <generator version="${server.version}">Alfresco (${server.edition})</generator>
  <title>Tâches BlueCourrier de ${person.properties.userName}</title> 
  <updated>${xmldate(date)}</updated>
  <icon>${absurl(url.context)}/images/logo/AlfrescoLogo16.icon</icon>
<#list tasks.count?keys as taskName>
  <entry>
    <title><b>${tasks.count[taskName]}</b> ${msg("task." + taskName?replace(":","_") + ".title")}</title>
    <link rel="alternate" href="${absurl("/")}share/page/yamma"/>
    <icon>${absurl("/")}share/res/yamma/resources/icons/${msg("task." + taskName?replace(":","_") + ".icon")}.png</icon>
    <id>${taskName}</id>
    <#if tasks.lastUpdate[taskName]??>
    <updated>${xmldate(tasks.lastUpdate[taskName])}</updated>
    </#if>
  </entry>
</#list>
</feed>