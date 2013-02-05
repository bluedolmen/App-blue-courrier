package com.bluexml.alfresco.barcode.pdf;

import java.lang.reflect.Field;
import java.util.Iterator;
import java.util.StringTokenizer;

public final class LabelPageConfiguration {
	
	public static final Rectangle PAGE_SIZE_A4 = new Rectangle(210, 297);
	
    static final int DEFAULT_USER_SPACE_UNIT_DPI = 72;
    static final float MM_TO_UNITS = 1/(10*2.54f) * DEFAULT_USER_SPACE_UNIT_DPI; // Copied from Apache pdfbox since not exposed	
	
	private Rectangle pageSize = PAGE_SIZE_A4;
	private MarginConfiguration pageMargin;
	
	private Rectangle labelSize;
	private MarginConfiguration labelMargin;
	private MarginConfiguration labelPadding;
	
	private int labelNumber = -1;
	
	public LabelPageIterator getLabelIterator() {
		
		return new LabelPageIterator();
		
	}
	
	public int getPageLabelNumber() {
		if (labelNumber == -1) {
			final LabelPageIterator iterator = getLabelIterator();
			int i = 0;
			while (null != iterator.next()) i++;
			labelNumber = i;
		}
		
		return labelNumber;
	}
	
	public final class LabelPageIterator implements Iterator<Position> {

		private final float innerLeftX;
		private final float innerRightX;
		private float currentX;
		private float currentY;
		
		private Position nextPosition;
		
		public LabelPageIterator() {
			innerLeftX = pageMargin.getLeft();
			innerRightX = (int) (pageSize.width - pageMargin.getRight());
			
        	currentY = pageSize.height - pageMargin.getUp();
        	nextPosition = startNewLine() ? new Position(currentX, currentY) : null;
		}
		
		public boolean hasNext() {
			return nextPosition != null;
		}

		public Position next() {
			if (nextPosition == null) return null;

			final Position nextPosition_ = nextPosition;
			computeNextPosition();
			
			return nextPosition_;
		}
		
		private void computeNextPosition() {
			endColumn();
			
			if (startNewColumn()) {
				nextPosition = new Position(currentX, currentY);
			} else {
				nextPosition = null;
			}
		}

		public void remove() {
			throw new UnsupportedOperationException();
		}
		
		private boolean startNewLine() {
			
			currentY -= labelMargin.getUp() + labelSize.height;
			currentX = innerLeftX;
			
			return (currentY - labelMargin.getDown() >= pageMargin.getDown());
            
		}
		
		private void endLine() {
			currentY -= labelMargin.getDown();
		}
				
		private boolean startNewColumn() {
			
			float futureX = currentX + labelMargin.getLeft() + labelSize.width + labelMargin.getRight(); 
			if ( futureX  > innerRightX) { // no place for another label
				endLine();
				if (!startNewLine()) return false;
			}
			
			currentX += labelMargin.getLeft();
			
            return true;
		}
		
		private void endColumn() {
            currentX += labelSize.width + labelMargin.getRight();			
		}
		
	}
	
	public static final class Position {
		public final float x;
		public final float y;
		
		private Position(float x, float y) {
			this.x = x;
			this.y = y;
		}
	}
	
	public static final class Rectangle {
		
		public final float width;
		public final float height;
		
		public Rectangle(String sizeDefinition) {
			
			final StringTokenizer tokenizer = new StringTokenizer(sizeDefinition, "x");
			width = Float.parseFloat(tokenizer.nextToken().trim());
			height = Float.parseFloat(tokenizer.nextToken().trim());
			
			checkValid();
		}
		
		public Rectangle(float width, float height) {
			
			this.width = width;
			this.height = height;
			
			checkValid();
		}
		
		private void checkValid() {
			
			if (width <= 0 || height <= 0) {
				throw new IllegalArgumentException("Height and width have to be positive integers");
			}
			
		}
		
	}
	
	public static final class MarginConfiguration {
		
		private static final String[] setOrder = new String[] {"up", "right", "down", "left"};
		private float up = -1;
		private float right = -1;
		private float down = -1;
		private float left = -1;
		
		public MarginConfiguration(float up, float right, float down, float left) {
			this.up = up;
			this.right = right;
			this.down = down;
			this.left = left;
		}
		
		public MarginConfiguration(String config) {
			if (null == config) throw new NullPointerException("config is null");
			final StringTokenizer tokenizer = new StringTokenizer(config);
			int i = 0;
			
			try {
				while (tokenizer.hasMoreElements()) {
					final String tok = tokenizer.nextToken();
					final String marginName = setOrder[i++];
					
					final Field marginField = MarginConfiguration.class.getDeclaredField(marginName);
					marginField.set(this, Float.parseFloat(tok));
					
				}
			} catch (Exception e) {
				throw new IllegalArgumentException(String.format("The format '%s' is not valid.", config), e);
			}
		}
					
		public float getUp() {
			return -1 == up ? 0 /* unset */ : up;
		}
		
		public float getRight() {
			if (-1 != right) return right;
			return getUp();
		}
		
		public float getDown() {
			if (-1 != down) return down;
			return getUp(); // either opposed size, or 0
		}
		
		public float getLeft() {
			if (-1 != left) return left;
			if (-1 != right) return right;
			return getUp(); // either first value set, or 0
		}
	}
	
	public void setPageSize(String pageSize) {
		final Rectangle pageSize_ = new Rectangle(pageSize);
		setPageSize(pageSize_);
	}
	
	public void setPageSize(Rectangle pageSize) {
		this.pageSize = pageSize;
		labelNumber = -1;
	}
	
	Rectangle getPageSize() {
		return pageSize;
	}
	
	public void setPageMargin(String pageMargin) {
		setPageMargin(new MarginConfiguration(pageMargin));
	}

	public void setPageMargin(MarginConfiguration pageMargin) {
		this.pageMargin = pageMargin;
		labelNumber = -1;
	}
	
	MarginConfiguration getPageMargin() {
		return pageMargin;
	}
	
	public void setLabelSize(String labelSize) {
		setLabelSize(new Rectangle(labelSize));
	}
	
	public void setLabelSize(Rectangle labelSize) {
		this.labelSize = labelSize;
		labelNumber = -1;
	}
	
	Rectangle getLabelSize() {
		return labelSize;
	}
	
	public void setLabelMargin(String labelMargin) {
		setLabelMargin(new MarginConfiguration(labelMargin));
	}
	
	public void setLabelMargin(MarginConfiguration labelMargin) {
		this.labelMargin = labelMargin;
		labelNumber = -1;
	}
	
	MarginConfiguration getLabelMargin() {
		return labelMargin;
	}
	
	public void setLabelPadding(String labelPadding) {
		setLabelPadding(new MarginConfiguration(labelPadding));
	}
	
	public void setLabelPadding(MarginConfiguration labelPadding) {
		this.labelPadding = labelPadding;
	}
	
	MarginConfiguration getLabelPadding() {
		return labelPadding;
	}
}
