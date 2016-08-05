<html>
   <#assign title=args["title"]!"Notification de nouveau commentaire"/>
   <#assign document=args["document"]/>
   <#assign posts=args["posts"]/>
   
   <#assign userDisplayName=args["userDisplayName"]/>
   <#assign senderDisplayName=args["senderDisplayName"]!"BlueCourrier"/>

   <head>
      <style type="text/css"><!--
      body
      {
         font-family: Arial, sans-serif;
         font-size: 14px;
         color: #4c4c4c;
      }
      
      a, a:visited
      {
         color: #0072cf;
      }
      
      --></style>
   </head>

   <body bgcolor="#dddddd">
      <table width="100%" cellpadding="20" cellspacing="0" border="0" bgcolor="#dddddd">
         <tr>
            <td width="100%" align="center">
               <table width="70%" cellpadding="0" cellspacing="0" bgcolor="white" style="background-color: white; border: 1px solid #aaaaaa;">
                  <tr>
                     <td width="100%">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                           <tr>
                              <td style="padding: 10px 30px 0px;">
                                   <div style="font-size: 12px; padding-bottom: 4px; text-align:right">
                                      ${date?date?string.full}
                                   </div>                                   
                                 <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                       <td>
                                          <table cellpadding="0" cellspacing="0" border="0">
                                             <tr>
                                                <td>
                                                   <img src="${shareUrl}/res/yamma/resources/images/mail_64.png" alt="" width="64" height="64" border="0" style="padding-right: 20px;" />
                                                </td>
                                                <td>
                                                   <div style="font-size: 22px; padding-bottom: 4px;">
                                                      ${title}
                                                   </div>
                                                   <div style="font-size: 15px; font-style: italic">
                                                      <a target="bluecourrier" href="${shareUrl}/page/yamma?nodeRef=${document.nodeRef?string}">${document.object!""} [${document.name}]</a>
                                                   </div>
                                                </td>
                                             </tr>
                                          </table>
                                          <div style="font-size: 14px; margin: 12px 0px 24px 0px; padding-top: 20px; border-top: 1px solid #aaaaaa;">
                                             
                                             <table width="80%" cellpadding="2px" cellspacing="0" border="0">
                                             <#list posts as post>
                                             <#if post_index == 1>
                                             <div style="font-size: 18px; font-style: italic; margin-top:20px;" >Commentaires précédents</div>
                                             </#if>
                                             <#assign theAuthor = people.getPerson(post.properties['cm:creator']!"admin")>
                                             	<tr><div style="<#if post_index == 0>background-color:#f2f2eb;</#if> margin-left:20px; margin-right:20px; padding:5px;">
							<div style="font-size: smaller; color: #15498B; padding-bottom: 5px; padding-top: 5px;">
								<span>Le <#if post.properties['cm:modified']??>${post.properties['cm:modified']?date?string}<#else>${post.properties['cm:created']?date?string}</#if>,</span>
								<#if theAuthor??><span> ${theAuthor.properties['cm:firstName']!""} ${theAuthor.properties['cm:lastName']!""} a écrit:</span></#if>
							</div>
							<div style="padding-left: 20px;" >${post.content}</div>
							<div style="margin-bottom: 10px" ></div>

                                             	</div></tr>
                                             </#list>
                                             </table>
                                                                                          
                                             <p>Cordialement,<br />
                                             ${senderDisplayName}.</p>
                                          </div>
                                       </td>
                                    </tr>
                                 </table>
                              </td>
                           </tr>
                           <tr>
                              <td>
                                 <div style="border-top: 1px solid #aaaaaa;">&nbsp;</div>
                              </td>
                           </tr>
                           <tr>
                              <td>
                                 <div style="border-bottom: 1px solid #aaaaaa;">&nbsp;</div>
                              </td>
                           </tr>
                           <tr>
                              <td style="padding: 10px 30px;">
                                 <a href="${shareUrl}/page/yamma"><img src="${url.serverPath}${url.context}/service/bluedolmen/yamma/logo" alt="" height="64px" border="0" /></a>
                              </td>
                           </tr>
                        </table>
                     </td>
                  </tr>
               </table>
            </td>
         </tr>
      </table>
   </body>
</html>