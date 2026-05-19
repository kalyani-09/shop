package org.example.services;


import io.temporal.client.WorkflowClient;
import io.temporal.client.WorkflowOptions;
import org.example.temporal.OrderFulfillmentWorkflow;
import org.example.temporal.OrderFulfillmentResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class OrderFulfillmentWorkflowClient {


    private final WorkflowClient workflowClient;

    @Autowired
    public OrderFulfillmentWorkflowClient(WorkflowClient workflowClient) {
        this.workflowClient = workflowClient;

    }

    public OrderFulfillmentResult startOrderFulfillment(
            String userId,
            Map<Long, Integer> productQuantities
    ) {
        OrderFulfillmentWorkflow workflow =
                workflowClient.newWorkflowStub(
                        OrderFulfillmentWorkflow.class,
                        WorkflowOptions.newBuilder()
                                .setTaskQueue("ORDER_TASK_QUEUE")
                                .build()
                );

        // ✅ THIS is synchronous
        return workflow.startOrderFulfillment(userId, productQuantities);
    }
}
