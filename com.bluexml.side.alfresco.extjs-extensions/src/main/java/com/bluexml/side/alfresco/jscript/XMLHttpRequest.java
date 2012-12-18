/*
 * Copyright (C) 2005-2012 Alfresco Software Limited.
 */
package com.bluexml.side.alfresco.jscript;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStreamWriter;
import java.io.StringReader;
import java.net.Authenticator;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.PasswordAuthentication;
import java.net.URL;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import org.alfresco.repo.processor.BaseProcessorExtension;
import org.apache.xerces.parsers.DOMParser;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.NativeFunction;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;
import org.w3c.dom.Document;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

/**
 * 
 *  This code is a merging of the XMLHttpRequest code provided by Ant Elder and a couple of my own
 *  changes to make this work easily with Alfresco's webscript environment.  Thanks Ant!
 *  
 *  @author <a href="mailto:nmcminn@gmail.com">Nathan McMinn</a>
 */

/**
 * XMLHttpRequest simulates the Mozilla XMLHttpRequest.
 * 
 * Add this class to the Rhino classpath and then define to Rhino
 * with <code>defineClass('xmlhttp.XMLHttpRequest');</code>
 * 
 * @author <a href="mailto:ant.elder@uk.ibm.com">Ant Elder </a>
 */
public class XMLHttpRequest extends BaseProcessorExtension{

    private String url;
    private String httpMethod;
    private HttpURLConnection urlConnection;

    private int httpStatus;
    private String httpStatusText;

    private Map requestHeaders;

    private String userName;
    private String password;

    private String responseText;
    private Document responseXML;

    private int readyState;
    private NativeFunction readyStateChangeFunction;

    private boolean asyncFlag;
    private Thread asyncThread;
    
    private ScriptableXMLHttpRequest scriptable;
    
    public XMLHttpRequest() {
    	scriptable = new ScriptableXMLHttpRequest();
    }

    public void jsConstructor() {
    }

    public String getClassName() {
        return "XMLHttpRequest";
    }

    public void setRequestHeader(String headerName, String value) {
        if (readyState > 1) {
            throw new IllegalStateException("request already in progress");
        }

        if (requestHeaders == null) {
            requestHeaders = new HashMap();
        }

        requestHeaders.put(headerName, value);
    }

    public Map getAllResponseHeaders() {
        if (readyState < 3) {
            throw new IllegalStateException(
                    "must call send before getting response headers");
        }
        return urlConnection.getHeaderFields();
    }

    public String getResponseHeader(String headerName) {
        return getAllResponseHeaders().get(headerName).toString();
    }

    public void open(String httpMethod, String url,
            boolean asyncFlag, String userName, String password) {

        if (readyState != 0) {
            throw new IllegalStateException("already open");
        }

        this.httpMethod = httpMethod;

        if (url.startsWith("http")) {
            this.url = url;
        } else {
            throw new IllegalArgumentException("URL protocol must be http: "
                    + url);
        }

        this.asyncFlag = asyncFlag;

        if ("undefined".equals(userName) || "".equals(userName)) {
            this.userName = null;
        } else {
            this.userName = userName;
        }
        if ("undefined".equals(password) || "".equals(password)) {
            this.password = null;
        } else {
            this.password = password;
        }
        if (this.userName != null) {
            setAuthenticator();
        }

        setReadyState(1);
    }

    private void setAuthenticator() {
        Authenticator.setDefault(new Authenticator() {
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(userName, password.toCharArray());
            }
        });        
    }

    public void send(Object o) {
        final String content = (o == null) ? "" : o.toString();
        if (asyncFlag) {
            Runnable r = new Runnable() {
                public void run() {
                    doSend(content);
                }
            };
            this.asyncThread = new Thread(r);
            asyncThread.start();
        } else {
            doSend(content);
        }
    }
    
    public void close() {
    	setReadyState(0);
    }
    
    public void abort() {
        if (asyncThread != null) {
            asyncThread.interrupt();
        }
        //after abort, reset ready sate
        setReadyState(0);
    }

    /**
     * @return Returns the readyState.
     */
    public int getReadyState() {
        return readyState;
    }

    /**
     * @return Returns the responseText.
     */
    public String getResponseText() {
        if (readyState < 2) {
            throw new IllegalStateException("request not yet sent");
        }
        return responseText;
    }

    /**
     * @return Returns the responseXML as a DOM Document.
     */
    public Document getResponseXML() {
        if (responseXML == null && responseText != null) {
            convertResponse2DOM();
        }
        return responseXML;
    }

    private void convertResponse2DOM() {
        try {

            DOMParser parser = new DOMParser();
            StringReader sr = new StringReader(getResponseText());
            parser.parse(new InputSource(sr));
            this.responseXML = parser.getDocument();

        } catch (SAXException e) {
            throw new RuntimeException("ex: " + e, e);
        } catch (IOException e) {
            throw new RuntimeException("ex: " + e, e);
        }
    }

    /**
     * @return Returns the htto status.
     */
    public int getStatus() {
        return httpStatus;
    }

    /**
     * @return Returns the http status text.
     */
    public String getStatusText() {
        return httpStatusText;
    }

    /**
     * @return Returns the onreadystatechange.
     */
    public Object getOnreadystatechange() {
        return readyStateChangeFunction;
    }

    /**
     * @param onreadystatechange
     *            The onreadystatechange to set.
     */
    public void setOnreadystatechange(NativeFunction function) {
        readyStateChangeFunction = function;
    }

    private void doSend(String content) {

        connect(content);

        setRequestHeaders();

        try {
            urlConnection.connect();
        } catch (IOException e) {
            throw new RuntimeException("ex: " + e, e);
        }

        sendRequest(content);

        if ("POST".equals(this.httpMethod) || "GET".equals(this.httpMethod)) {
            readResponse();
        }

        setReadyState(4);

    }

    private void connect(String content) {
        try {

            URL url = new URL(this.url);
            urlConnection = (HttpURLConnection) url.openConnection();
            urlConnection.setRequestMethod(httpMethod);
            if ("POST".equals(this.httpMethod) || content.length() > 0) {
                urlConnection.setDoOutput(true);
            }
            if ("POST".equals(this.httpMethod) || "GET".equals(this.httpMethod)) {
                urlConnection.setDoInput(true);
            }
            urlConnection.setUseCaches(false);

        } catch (MalformedURLException e) {
            throw new RuntimeException("MalformedURLException: " + e, e);
        } catch (IOException e) {
            throw new RuntimeException("IOException: " + e, e);
        }
    }

    private void setRequestHeaders() {
        if (this.requestHeaders != null) {
            for (Iterator i = requestHeaders.keySet().iterator(); i.hasNext();) {
                String header = (String) i.next();
                String value = (String) requestHeaders.get(header);
                urlConnection.setRequestProperty(header, value);
            }
        }
    }

    private void sendRequest(String content) {
        try {

            if ("POST".equals(this.httpMethod) || content.length() > 0) {
                OutputStreamWriter out = new OutputStreamWriter(urlConnection
                        .getOutputStream(), "ASCII");
                out.write(content);
                out.flush();
                out.close();
            }

            httpStatus = urlConnection.getResponseCode();
            httpStatusText = urlConnection.getResponseMessage();

        } catch (IOException e) {
            throw new RuntimeException("IOException: " + e, e);
        }

        setReadyState(2);
    }

    private void readResponse() {
        try {

            InputStream is = urlConnection.getInputStream();
            StringBuffer sb = new StringBuffer();

            setReadyState(3);

            int i;
            while ((i = is.read()) != -1) {
                sb.append((char) i);
            }
            is.close();

            this.responseText = sb.toString();

        } catch (IOException e) {
            throw new RuntimeException("IOException: " + e, e);
        } 
    }

    private void setReadyState(int state) {
        this.readyState = state;
        callOnreadyStateChange();
    }

    private void callOnreadyStateChange() {
        if (readyStateChangeFunction != null) {
            Context cx = Context.enter();
            try {
                Scriptable scope = cx.initStandardObjects();
                readyStateChangeFunction.call(cx, scope, this.scriptable, new Object[] {});
            } finally {
                Context.exit();
            }
        }
    }
    
    public class ScriptableXMLHttpRequest extends ScriptableObject {

		public String getClassName() {
			return "XMLHttpRequest";
		}    	
    }
}

