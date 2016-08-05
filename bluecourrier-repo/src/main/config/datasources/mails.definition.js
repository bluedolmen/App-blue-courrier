///<import resource="classpath:/${config.target.path}/datasources/sender.definition.js">
(function() {
	
	var userName = Utils.Alfresco.getFullyAuthenticatedUserName();
	
	CommonDatasourceFilters.mails = {
			
		'discardReplies' : {
			
			applyQueryFilter : function(query, areRepliesDiscarded) {
				
				if ('true' !== Utils.asString(areRepliesDiscarded)) return query;
				return (query + ' -ASPECT:"' + YammaModel.REPLY_ASPECT_SHORTNAME + '"');
				
			}
			
		},
		
		'kind' : {
			
			applyQueryFilter : function(query, kind) {
				
				var
					kindAspectName = ({
						'inbound' : YammaModel.INBOUND_DOCUMENT_ASPECT_SHORTNAME,
						'outbound' : YammaModel.OUTBOUND_DOCUMENT_ASPECT_SHORTNAME,
						'copy!inbound' : YammaModel.COPIED_FROM_ASPECT_SHORTNAME
					})[kind]
				;
				
				if (null == kindAspectName) return;
				return (query + ' +ASPECT:"' + kindAspectName + '"');
				
			}
			
		},
		
		// Same as rootService applied to the role of the 'shares' metadata
		'roleRootService' : {
			
			applyQueryFilter : function(query, siteName) {
				
				if (null == siteName) return query;
				
				var 
					descendants = ServicesUtils.getDescendantServices(siteName),
					value
				;
				
				value = '(' + Utils.String.join(
						Utils.map([siteName].concat(descendants), function(siteName) {
							return '"ser_' + siteName + '*"';
						}),
						' '
					) + ')';

				query += ' +' + Utils.Alfresco.getLuceneAttributeFilter(YammaModel.DISTRIBUTABLE_SHARES_PROPNAME, value);
				return query;
				
			}
		},
		
		'lateInXDays' : {
			
			applyQueryFilter : CommonDatasourceFilters.datePropertyRangeFilter(YammaModel.DUEABLE_DUE_DATE_PROPNAME) 
			
		}
		
	}; 
	
	DatasourceDefinitions.register('Mails',
		{
			
			extend : 'Documents',
			
			mixins : ['Sender'],
			
			fields : [
			
				YammaModel.MAIL_SENT_DATE_PROPNAME,
				YammaModel.MAIL_WRITING_DATE_PROPNAME,
				YammaModel.MAIL_OBJECT_PROPNAME,
				
				{
					name : YammaModel.MAIL_ASPECT_SHORTNAME + 'Kind',
					type : 'string',
					evaluate : function(node) {
						return MailUtils.getKind(node);
					}
				},
				
				{
					name : YammaModel.YAMMA_NS_PREFIX + ':isFollowed',
					type : 'boolean',
					evaluate : function(node) {
						return FollowingUtils.isFollowing(node, userName);
					}
				},
				
				
				// TODO: Q&D => These are currently specific to incoming mails
				
				YammaModel.INBOUND_DOCUMENT_DELIVERY_DATE_PROPNAME,
				YammaModel.INBOUND_DOCUMENT_ORIGIN_PROPNAME,
				YammaModel.DISTRIBUTABLE_PROCESS_KIND_PROPNAME, 
				
				{
					name : YammaModel.MAIL_ASPECT_SHORTNAME + 'HasReplies',
					type : 'boolean',
					evaluate : function(node) {
						return ReplyUtils.hasReplies(node);
					}
				},
				
				YammaModel.PROCESSED_BY_PROPNAME,
				YammaModel.DISTRIBUTABLE_SHARES_PROPNAME
				
			],
			
			filters : CommonDatasourceFilters.mails
	
		}
		
	);

})();