package org.example.temporal;

import io.temporal.workflow.WorkflowInterface;
import io.temporal.workflow.WorkflowMethod;

import java.util.Map;

@WorkflowInterface
public interface OrderFulfillmentWorkflow {

        @WorkflowMethod
        OrderFulfillmentResult startOrderFulfillment(
                String userId,
                Map<Long, Integer> productQuantities
        );
}