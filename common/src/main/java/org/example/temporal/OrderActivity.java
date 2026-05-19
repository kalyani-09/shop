package org.example.temporal;

import io.temporal.activity.ActivityInterface;
import io.temporal.activity.ActivityMethod;

import java.util.Map;

@ActivityInterface
public interface OrderActivity {

    @ActivityMethod(name = "createOrder" )
    String createOrder(String userId, Map<Long , Integer> productQuantities);

    @ActivityMethod(name = "cancelOrder")
    void cancelOrder(String orderNumber);

    @ActivityMethod(name = "notifyOrderCreated")
    void notifyOrderCreated(String userId, String orderNumber);

    @ActivityMethod(name = "notifyOrderFailed")
    void notifyOrderFailed(String userId, String reason);
}
