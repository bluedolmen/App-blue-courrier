package org.bluedolmen.alfresco.mongodb;

import java.net.UnknownHostException;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.InitializingBean;

public class MongoDBConnector implements InitializingBean {

	private static final Log logger = LogFactory.getLog(MongoDBConnector.class);
	private String host = "localhost";
	private Integer port = 27017;
	
//	private MongoClient client;
	
	public void afterPropertiesSet() {//throws Exception {
		
		if (null == host || null == port) {
			return;
		}
		
		try {
			buildClient();
		} catch (UnknownHostException e) {
			logger.warn(String.format("Cannot build MongoDB client with host='%s' and port='%s'. Check for parameters before using this connector.", host, port), e);
			// do not stop yet
		}
		
	}
	
	private void buildClient() throws UnknownHostException {
		
		if (null == host) {
			throw new IllegalStateException("The host has to be provided");
		}
		
		if (null == port) {
			throw new IllegalStateException("The port has to be provided");
		}
		
//		client = new MongoClient(host, port);
		
	}
	
//	public DB DBFactory(String databaseName) {
//		
//		if (null == client) {
//			try {
//				buildClient();
//			} catch (UnknownHostException e) {
//				throw new IllegalStateException("The client has not been correctly initialized", e);
//			}
//		}
//		
//		return client.getDB(databaseName);
//		
//	}
	
	// Spring IoC material
	
	public void setHost(String host) {
		this.host = host;
	}
	
	public void setPort(int port) {
		this.port = port;
	}

}
