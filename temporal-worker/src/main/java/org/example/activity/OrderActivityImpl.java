package org.example.activity;

import io.temporal.activity.Activity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.example.temporal.OrderActivity;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;

import java.util.Map;

@Component
public class OrderActivityImpl implements OrderActivity {

      private static final Logger logger = LoggerFactory.getLogger(OrderActivityImpl.class);

      private static final String CART_SERVICE_URL = "http://localhost:8082";

      @Autowired
      private RestTemplate restTemplate;

      @Override
      public String createOrder(String userId, Map<Long, Integer> productQuantities) {
            logger.info("Activity: Creating order for userId = {}", userId);

            try {
                  String url = CART_SERVICE_URL + "/cart/internal/order?userId=" + userId;
                  ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                              url,
                              HttpMethod.POST,
                              new org.springframework.http.HttpEntity<>(productQuantities),
                              new ParameterizedTypeReference<Map<String, Object>>() {
                              });
                  if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                        String orderNumber = (String) response.getBody().get("orderNumber");
                        logger.info("Order created successfully: {}", orderNumber);
                        return orderNumber;
                  }
            } catch (Exception e) {
                  logger.error("Failed to create order for user {}: {}", userId, e.getMessage());
                  throw Activity.wrap(e);
            }
            throw new RuntimeException("Failed to create order");
      }

      @Override
      public void cancelOrder(String orderNumber) {
            logger.info("Activity : Cancelling order= {}", orderNumber);
            try {
                  String url = CART_SERVICE_URL + "/api/orders/" + orderNumber + "/cancel";
                  restTemplate.postForEntity(url, null, Void.class);
            } catch (Exception e) {
                  logger.error("Failed to cancel order {} : {}", orderNumber, e.getMessage());
                  throw Activity.wrap(e);
            }
      }

      @Override
      public void notifyOrderCreated(String userId, String orderNumber) {
            logger.info("Activity : Notifying user {} about order {}", userId, orderNumber);
      }

      @Override
      public void notifyOrderFailed(String userId, String reason) {
            logger.info("Activity: Notifying user {} about order failure: {}", userId, reason);
      }
}
