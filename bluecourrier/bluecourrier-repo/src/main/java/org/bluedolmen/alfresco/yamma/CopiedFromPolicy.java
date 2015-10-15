package org.bluedolmen.alfresco.yamma;

import java.io.Serializable;
import java.util.Collections;
import java.util.Map;

import org.alfresco.repo.copy.CopyBehaviourCallback;
import org.alfresco.repo.copy.CopyDetails;
import org.alfresco.repo.copy.CopyServicePolicies.OnCopyNodePolicy;
import org.alfresco.repo.copy.DefaultCopyBehaviourCallback;
import org.alfresco.repo.policy.Behaviour.NotificationFrequency;
import org.alfresco.repo.policy.JavaBehaviour;
import org.alfresco.repo.policy.PolicyComponent;
import org.alfresco.service.namespace.QName;
import org.alfresco.util.Pair;
import org.alfresco.util.PropertyCheck;

public final class CopiedFromPolicy {
	
    private PolicyComponent policyComponent;
    
    /**
     * Init method.  Registered behaviours.
     */
    public void init() {
    	
        PropertyCheck.mandatory(this, "policyComponent", getPolicyComponent());
        
        /**
         * Bind policies
         */
        this.getPolicyComponent().bindClassBehaviour(OnCopyNodePolicy.QNAME , 
            BlueCourrierModel.ASPECT_COPIED_FROM,
            new JavaBehaviour(this, "getCopyCallback", NotificationFrequency.EVERY_EVENT));
        
    }
    
    
    /**
     * Extends the default copy behaviour to prevent copying of the bluecourrier:copiedfrom association
     * 
     */
    private static class CopiedFromCopyBehaviourCallback extends DefaultCopyBehaviourCallback {
    	
        private static final CopyBehaviourCallback INSTANCE = new CopiedFromCopyBehaviourCallback();
        
        /**
         * @return          Returns an empty map
         */
        public Map<QName, Serializable> getCopyProperties(QName classQName, CopyDetails copyDetails, Map<QName, Serializable> properties) {
            return Collections.emptyMap();
        }
        
        /**
         * 
         * @return          Returns
         *                  {@link AssocCopySourceAction#IGNORE} and
         *                  {@link AssocCopyTargetAction#USE_COPIED_OTHERWISE_ORIGINAL_TARGET}
         */
        @Override
        public Pair<AssocCopySourceAction, AssocCopyTargetAction> getAssociationCopyAction(
                    QName classQName,
                    CopyDetails copyDetails,
                    CopyAssociationDetails assocCopyDetails) {
        	
            return new Pair<AssocCopySourceAction, AssocCopyTargetAction>(
                    AssocCopySourceAction.IGNORE,
                    AssocCopyTargetAction.USE_COPIED_OTHERWISE_ORIGINAL_TARGET);
            
        }
        
    }

    
    public CopyBehaviourCallback getCopyCallback(QName classRef, CopyDetails copyDetails) {
        return CopiedFromCopyBehaviourCallback.INSTANCE;
    }

    public void setPolicyComponent(PolicyComponent policyComponent) {
        this.policyComponent = policyComponent;
    }

    public PolicyComponent getPolicyComponent() {
        return policyComponent;
    }

}
