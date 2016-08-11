<@markup target="head-resources" scope="global">
<@inlineScript group="header">
<#assign bclicense = license!{}>
   ${args.varname!"var BCLIC_"} = ${bclicense}
</@inlineScript>
</@markup>
