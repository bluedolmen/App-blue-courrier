package org.bluedolmen.repo.jscript;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

import javax.xml.namespace.QName;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpressionException;
import javax.xml.xpath.XPathFactory;

import org.alfresco.repo.jscript.Scopeable;
import org.alfresco.repo.jscript.ValueConverter;
import org.apache.xml.serialize.XMLSerializer;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.XML;
import org.mozilla.javascript.Scriptable;
import org.w3c.dom.Document;
import org.xml.sax.SAXException;

public class ScriptableXMLDocument implements Scopeable {
	
	private static final Map<String, QName> XPATH_CONSTANTS_MAP = new HashMap<String, QName>(5);
	
	static {
		
		XPATH_CONSTANTS_MAP.put(XPathConstants.BOOLEAN.getLocalPart(), XPathConstants.BOOLEAN);
		XPATH_CONSTANTS_MAP.put(XPathConstants.NODE.getLocalPart(), XPathConstants.NODE);
		XPATH_CONSTANTS_MAP.put(XPathConstants.NODESET.getLocalPart(), XPathConstants.NODESET);
		XPATH_CONSTANTS_MAP.put(XPathConstants.NUMBER.getLocalPart(), XPathConstants.NUMBER);
		XPATH_CONSTANTS_MAP.put(XPathConstants.STRING.getLocalPart(), XPathConstants.STRING);
		
	}
	
	private final XPathFactory xPathFactory = XPathFactory.newInstance();
	private final DocumentBuilderFactory documentBuilderFactory = DocumentBuilderFactory.newInstance();
	private final ValueConverter converter = new ValueConverter();
	
	private final Document document;

	Scriptable scope;
	
	@Override
	public void setScope(Scriptable scope) {
		this.scope = scope;
	}
	
	public ScriptableXMLDocument(InputStream inputStream) throws ParserConfigurationException, SAXException, IOException {
		
		if (null == inputStream) {
			throw new NullPointerException("The provided stream has to be a non-null input-stream.");
		}
		
		final DocumentBuilder documentBuilder = documentBuilderFactory.newDocumentBuilder();
		document = documentBuilder.parse(inputStream);
		
	}
	
	public ScriptableXMLDocument(Document document) {
		
		if (null == document) {
			throw new NullPointerException("The provided document has to be valid");
		}
		
		this.document = document;
		
	}
	
	public Object xpathValue(final String expression, String returnType) throws XPathExpressionException {
		
		final XPath xPath = xPathFactory.newXPath();
		final Object value = xPath.evaluate(expression, document, getXPathConstant(returnType));
	
		if (value instanceof Serializable) {
			return converter.convertValueForScript(null, scope, null, (Serializable) value);
		}
		
		return value;
		
	}

	public String xpathValue(final String expression) throws XPathExpressionException {
		
		final XPath xPath = xPathFactory.newXPath();
		final String value = (String) xPath.evaluate(expression, document, XPathConstants.STRING);
		
		return value;
		
	}
	
	public JSONObject toJSON() throws JSONException, IOException {

		final ByteArrayOutputStream baos = new ByteArrayOutputStream();
		final XMLSerializer serializer = new XMLSerializer();
		serializer.setOutputByteStream(baos);
		serializer.serialize(document);
		
		return XML.toJSONObject(baos.toString());

	}
	
	private static QName getXPathConstant(String constant) {
	
		final QName xpathConstant = XPATH_CONSTANTS_MAP.get(constant);
		if (null == xpathConstant) {
			throw new IllegalArgumentException("XPath constant '" + constant + "' is unkown");
		}
		
		return xpathConstant;
		
	}
	
}
