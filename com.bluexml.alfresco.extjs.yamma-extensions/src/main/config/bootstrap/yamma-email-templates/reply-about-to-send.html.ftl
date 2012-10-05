<html>
   <#assign senderName=args["senderName"]/>
   <#assign recipientName=args["recipientName"]/>
   <#assign object=args["object"]/>
   <#assign sentDate=args["sentDate"]/>

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
                                                      Concernant votre courrier...
                                                   </div>
                                                   <div style="font-size: 15px; font-style: italic">
                                                      ${object!""}
                                                   </div>
                                                </td>
                                             </tr>
                                          </table>
                                          <div style="font-size: 14px; margin: 12px 0px 24px 0px; padding-top: 10px; border-top: 1px solid #aaaaaa;">
                                             <p>Bonjour ${senderName!""},</p>
                                             
                                             <p>Nous avons bien pris en compte votre courrier en date du ${sentDate?date?string}.</p>
                                             
                                             <p>Une réponse vient de vous être apportée, vous la recevrez très prochainement par courrier postal.</p>
                                                                                          
                                             <p>Cordialement,<br />
                                             ${recipientName!"Votre serviteur."}</p>
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
                              <td style="padding: 0px 30px; font-size: 13px;">
                                 Pour en savoir plus sur sur nous, visitez notre site Web <a href="http://www.bluexml.com">http://www.bluexml.com</a>
                              </td>
                           </tr>
                           <tr>
                              <td>
                                 <div style="border-bottom: 1px solid #aaaaaa;">&nbsp;</div>
                              </td>
                           </tr>
                           <tr>
                              <td style="padding: 10px 30px;">
                                 <a href="http://www.bluexml.com"><img src="${shareUrl}/res/yamma/resources/images/Bluexml_simple.png" alt="" height="40" width="160" border="0" /></a>
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
