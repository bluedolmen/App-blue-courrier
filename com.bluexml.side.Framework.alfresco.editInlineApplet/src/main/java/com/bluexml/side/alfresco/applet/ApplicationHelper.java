package com.bluexml.side.alfresco.applet;

import java.io.File;
import java.lang.reflect.InvocationTargetException;
import java.util.List;

public final class ApplicationHelper {
	
	private ApplicationHelper() {
	}
	
	public static enum ApplicationExe {
		
		SOFFICE("soffice"),
		WINWORD("winword"),
		EXCEL("excel"),
		POWERPOINT("powerpnt");

		public final String executable;
		
		private ApplicationExe(String executable) {
			if (!executable.endsWith(".exe")) {
				executable = executable + ".exe";
			}
			this.executable = executable;
		}
		
	};
	
	public static ApplicationExe getApplicationExecutable(String mimetype) {
				
		if (
				"application/vnd.ms-powerpoint".equals(mimetype) ||
				"application/vnd.powerpoint".equals(mimetype) ||
				"application/vnd.openxmlformats-officedocument.presentationml.presentation".equals(mimetype)
		) {
			return ApplicationExe.POWERPOINT;
		}
		else if (
				"application/vnd.ms.excel".equals(mimetype) ||
				"application/vnd.ms-excel".equals(mimetype) ||
				"application/vnd.excel".equals(mimetype) ||
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet".equals(mimetype)
		) {
			return ApplicationExe.EXCEL;
		}
		else if (
				"application/msword".equals(mimetype) ||
				"application/vnd.openxmlformats-officedocument.wordprocessingml.document".equals(mimetype)
		) {
			return ApplicationExe.WINWORD;
		}
		else if (
				"application/vnd.oasis.opendocument.spreadsheet".equals(mimetype) ||
				"application/vnd.oasis.opendocument.text".equals(mimetype) ||
				"application/vnd.oasis.opendocument.presentation".equals(mimetype)
		) {
			return ApplicationExe.SOFFICE;
		}		
		
		return null;
	}
	
	public static String getApplicationFullPath(final ApplicationExe applicationExecutable) {
		
		try {
			final String applicationFullFolderPath = getApplicationFullFolderPath(applicationExecutable);
			return (
					applicationFullFolderPath +
					( applicationFullFolderPath.endsWith(File.separator) ? "" : File.separator ) + 
					applicationExecutable.executable
			);
		} catch (Exception e) {
			e.printStackTrace(System.err);
		}
		
		return null;
		
	}
	
	private static String getApplicationFullFolderPath(final ApplicationExe applicationExecutable) throws IllegalAccessException, InvocationTargetException {
		
		String fullPath = null;
		
		if (ApplicationExe.SOFFICE.equals(applicationExecutable)) {
			fullPath = WinRegistry.readString(WinRegistry.HKEY_LOCAL_MACHINE, getSoftwareKeyPrefixed("OpenOffice.org\\OpenOffice.org"), "Path");
		}
		else if (
				ApplicationExe.EXCEL.equals(applicationExecutable) ||
				ApplicationExe.WINWORD.equals(applicationExecutable) ||
				ApplicationExe.POWERPOINT.equals(applicationExecutable)
		) {
			final List<String> versions = WinRegistry.readStringSubKeys(WinRegistry.HKEY_LOCAL_MACHINE, getSoftwareKeyPrefixed("Microsoft\\Office") );
			for (final String version : versions) {
				if (! version.matches("$[0-9\\.]+")) continue; // weak but sufficient testing
				fullPath = WinRegistry.readString(WinRegistry.HKEY_LOCAL_MACHINE, "\\SOFTWARE\\Microsoft\\Office\\" + version + "\\Common\\InstallRoot", "Path");
				if (null != fullPath) break;
			}
		}
		
		return null;
		
	}
	
	/**
	 * Returns the Wow6432Node prefix (mapping between 32b software on 64b
	 * machines) whether the key can be found in this way
	 * 
	 * @return The software key potentially prefixed by "Wow6432\\"
	 */
	private static String getSoftwareKeyPrefixed(String softwareKey) {
		
		try {
			final String softwareKey64 = "\\SOFTWARE\\Wow6432Node\\" + softwareKey;
			final List<String> reg = WinRegistry.readStringSubKeys(WinRegistry.HKEY_LOCAL_MACHINE, softwareKey64);
			if (!reg.isEmpty()) return softwareKey64;
		} catch (Exception e) {
			// ignore
		}
		
		return "\\SOFTWARE\\" + softwareKey;
	}

}
