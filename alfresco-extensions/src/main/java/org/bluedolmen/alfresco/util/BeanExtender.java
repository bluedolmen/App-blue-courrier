package org.bluedolmen.alfresco.util;

import org.alfresco.util.ParameterCheck;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.MutablePropertyValues;
import org.springframework.beans.PropertyValue;
import org.springframework.beans.factory.NoSuchBeanDefinitionException;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;

/**
 * Extends the definition of a bean with another.
 * <p>
 * Implements bean factory post processor.
 *
 * @author Roy Wetherall
 * @since 5.0
 */
public class BeanExtender implements BeanFactoryPostProcessor
{
    /** name of bean to extend */
    private String beanName;

    /** extending bean name */
    private String extendingBeanName;

    /**
     * @param beanName  bean name
     */
    public void setBeanName(String beanName) {
        this.beanName = beanName;
    }

    /**
     * @param extendingBeanName extending bean name
     */
    public void setExtendingBeanName(String extendingBeanName) {
        this.extendingBeanName = extendingBeanName;
    }

    /**
     * @see org.springframework.beans.factory.config.BeanFactoryPostProcessor#postProcessBeanFactory(org.springframework.beans.factory.config.ConfigurableListableBeanFactory)
     */
    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) {
    	
        ParameterCheck.mandatory("beanName", beanName);
        ParameterCheck.mandatory("extendingBeanName", extendingBeanName);

        // check for bean name
        if (!beanFactory.containsBean(beanName)) {
            throw new NoSuchBeanDefinitionException("Can't find bean '" + beanName + "' to be extended.");
        }

        // check for extending bean
        if (!beanFactory.containsBean(extendingBeanName)) {
            throw new NoSuchBeanDefinitionException("Can't find bean '" + extendingBeanName + "' that is going to extend origional bean definition.");
        }

        // get the bean definitions
        final BeanDefinition beanDefinition = beanFactory.getBeanDefinition(beanName);
        final BeanDefinition extendingBeanDefinition = beanFactory.getBeanDefinition(extendingBeanName);

        // update class
        if (
        	StringUtils.isNotBlank(extendingBeanDefinition.getBeanClassName()) &&
            !beanDefinition.getBeanClassName().equals(extendingBeanDefinition.getBeanClassName())
        ) {
        	
            beanDefinition.setBeanClassName(extendingBeanDefinition.getBeanClassName());
            
        }

        // update properties
        final MutablePropertyValues properties = beanDefinition.getPropertyValues();
        final MutablePropertyValues extendingProperties = extendingBeanDefinition.getPropertyValues();
        for (PropertyValue propertyValue : extendingProperties.getPropertyValueList()) {
            properties.add(propertyValue.getName(), propertyValue.getValue());
        }
        
    }
}
