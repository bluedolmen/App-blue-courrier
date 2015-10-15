<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
<channel rdf:about="http://www.alfresco.com/">
   <title>Tâches BlueCourrier de ${person.properties.userName}</title>
   <description>Tâches BlueCourrier de ${person.properties.userName} - Changements récents</description>
   <lastBuildDate>${date?string("EEE, dd MMM yyyy HH:mm:ss zzz")}</lastBuildDate>
   <pubDate>${date?string("EEE, dd MMM yyyy HH:mm:ss zzz")}</pubDate>
   <generator>Alfresco ${server.edition} v${server.version}</generator>
   <image>
      <title>BlueCourrier</title>
      <url>${absurl("/")}/share/res/yamma/resources/images/logo-yamma.png</url>
   </image>
   
<#list tasks.count?keys as taskName>
   <item>
      <title><b>${tasks.count[taskName]}</b> ${msg("task." + taskName?replace(":","_") + ".title")}</title>
      <link>${absurl("/")}share/page/yamma</link>
    <#if tasks.lastUpdate[taskName]??>
      <pubDate>${tasks.lastUpdate[taskName]?string("EEE, dd MMM yyyy HH:mm:ss zzz")}</pubDate>
    </#if>
      <guid isPermaLink="false">${taskName}</guid>
   </item>
</#list>
/channel>
</rss>
