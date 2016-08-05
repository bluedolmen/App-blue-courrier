<@markup target="head-resources" scope="global">
<@inlineScript group="header">
   ${args.varname!"var BCLIC_"} = <#if license??>${license}<#else>{}</#if>
</@inlineScript>
</@markup>
