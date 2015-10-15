package org.bluedolmen.alfresco.delegates;

import java.util.Date;

public final class Delegate {
	
	private final String name;
	private final Date startDate;
	private final boolean isDefaultAssignee;
	
	Delegate(String name, Date startDate, boolean isDefaultAssignee) {
		
		if (null == name || name.isEmpty()) {
			throw new IllegalArgumentException("The providec name is null or empty");
		}
		this.name = name;
		
		this.startDate = startDate; // null is an allowed value
		this.isDefaultAssignee = isDefaultAssignee;
	}

	public boolean isDefaultAssignee() {
		return isDefaultAssignee;
	}
	
	public String getName() {
		return name;
	}
	
	public Date getStartDate() {
		return (Date) startDate.clone();
	}
	
	public boolean isActive() {
		if (null == startDate) return true;
		
		return startDate.before(new Date());
	}
	
}
