package org.example.workflow;

import io.temporal.activity.ActivityOptions;
import io.temporal.common.RetryOptions;
import io.temporal.workflow.Workflow;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.example.temporal.OrderFulfillmentWorkflow;
import org.example.temporal.OrderFulfillmentResult;
import org.example.temporal.StockActivity;
import org.example.temporal.OrderActivity;
import org.example.temporal.StockCheckResult;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

public class OrderFulfilmentWorkflowImpl implements OrderFulfillmentWorkflow {

    private static final Logger logger = LoggerFactory.getLogger(OrderFulfilmentWorkflowImpl.class);

    private static final RetryOptions ACTIVITY_RETRY_OPTIONS = RetryOptions.newBuilder()
            .setInitialInterval(Duration.ofSeconds(1))
            .setMaximumInterval(Duration.ofSeconds(10))
            .setBackoffCoefficient(2)
            .setMaximumAttempts(3)
            .build();

    private static final ActivityOptions DEFAULT_ACTIVITY_OPTIONS = ActivityOptions.newBuilder()
            .setStartToCloseTimeout(Duration.ofMinutes(2))
            .setRetryOptions(ACTIVITY_RETRY_OPTIONS)
            .build();

    private final StockActivity stockActivity = Workflow.newActivityStub(StockActivity.class, DEFAULT_ACTIVITY_OPTIONS);
    private final OrderActivity orderActivity = Workflow.newActivityStub(OrderActivity.class, DEFAULT_ACTIVITY_OPTIONS);

    public OrderFulfilmentWorkflowImpl() {
    }

    @Override
    public OrderFulfillmentResult startOrderFulfillment(String userId, Map<Long, Integer> productQuantities) {
        logger.info("Starting order fulfillment for userId={}", userId);
        String orderNumber = null;
        boolean stockReserved = false;

        try {
            Map<Long, StockCheckResult> stockResults = stockActivity.checkStockForItems(productQuantities);
            Map<Long, Integer> unavailableItems = new HashMap<>();
            for (Map.Entry<Long, StockCheckResult> entry : stockResults.entrySet()) {
                if (!entry.getValue().isAvailable()) {
                    unavailableItems.put(entry.getKey(), productQuantities.get(entry.getKey()));
                    logger.warn("Insufficient stock for productId={}", entry.getKey());
                }
            }
            if (!unavailableItems.isEmpty()) {
                logger.error("Insufficient stock for items: {}", unavailableItems);
                orderActivity.notifyOrderFailed(userId, "Insufficient stock for items: " + unavailableItems);
                return OrderFulfillmentResult.builder()
                        .success(false)
                        .message("Insufficient stock for items: " + unavailableItems)
                        .build();
            }

            logger.info("Stock check passed, reserving stock for userId={}", userId);
            stockReserved = stockActivity.reserveAllStock(productQuantities);
            if (!stockReserved) {
                logger.error("Failed to reserve stock for userId={}", userId);
                orderActivity.notifyOrderFailed(userId, "Failed to reserve stock");
                return OrderFulfillmentResult.builder()
                        .success(false)
                        .message("Failed to reserve stock")
                        .build();
            }

            logger.info("Creating order for userId={}", userId);
            orderNumber = orderActivity.createOrder(userId, productQuantities);
            if (orderNumber == null || orderNumber.isEmpty()) {
                logger.error("Failed to create order for userId={}", userId);
                stockActivity.releaseStockForItems(productQuantities);
                orderActivity.notifyOrderFailed(userId, "Failed to create order");
                return OrderFulfillmentResult.builder()
                        .success(false)
                        .message("Failed to create order")
                        .build();
            }

            logger.info("Order created successfully: {} for userId={}", orderNumber, userId);
            orderActivity.notifyOrderCreated(userId, orderNumber);

            return OrderFulfillmentResult.builder()
                    .orderNumber(orderNumber)
                    .success(true)
                    .message("Order fulfilled successfully")
                    .build();

        } catch (Exception e) {
            logger.error("Error during order fulfillment for userId={}: {}", userId, e.getMessage(), e);
            if (stockReserved) {
                try {
                    stockActivity.releaseStockForItems(productQuantities);
                } catch (Exception releaseException) {
                    logger.error("Failed to release stock after error: {}", releaseException.getMessage());
                }
            }
            try {
                orderActivity.notifyOrderFailed(userId, e.getMessage());
            } catch (Exception notificationException) {
                logger.error("Failed to notify user about order failure: {}", notificationException.getMessage());
            }
            return OrderFulfillmentResult.builder()
                    .success(false)
                    .message("Error: " + e.getMessage())
                    .build();
        }
    }
}
