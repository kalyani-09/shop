package org.example.activity;

import org.example.temporal.StockActivity;
import org.example.temporal.StockCheckResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class StockActivityImpl implements StockActivity {

    private static final Logger logger = LoggerFactory.getLogger(StockActivityImpl.class);
    private static final String INVENTORY_SERVICE_URL = "http://localhost:8081";

    @Autowired
    private RestTemplate restTemplate;

    @Override
    public StockCheckResult checkStock(Long productId, Integer quantity) {
        logger.info("Checking stock for productId={}, quantity={}", productId, quantity);

        try {
            String url = INVENTORY_SERVICE_URL + "/products/api/products/" + productId + "/stock";
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Integer availableStock = (Integer) response.getBody().get("stockQuantity");
                boolean available = availableStock != null && availableStock >= quantity;

                return StockCheckResult.builder()
                        .productId(productId)
                        .available(available)
                        .availableQuantity(availableStock)
                        .message(available ? "Stock available" : "Insufficient stock")
                        .build();
            }
        } catch (Exception e) {
            logger.error("Failed to check stock: {}", e.getMessage());
            return StockCheckResult.builder()
                    .productId(productId)
                    .available(false)
                    .message("Stock check failed: " + e.getMessage())
                    .build();
        }

        return StockCheckResult.builder()
                .productId(productId)
                .available(false)
                .message("Unknown error")
                .build();
    }

    @Override
    public boolean reserveStock(Long productId, Integer quantity) {
        logger.info("Reserving stock for productId={}, quantity={}", productId, quantity);

        try {
            String url = INVENTORY_SERVICE_URL + "/products/api/products/" + productId + "/reserve";
            Map<String, Object> request = Map.of("quantity", quantity);

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    new HttpEntity<>(request),
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            return response.getStatusCode().is2xxSuccessful();

        } catch (Exception e) {
            logger.error("Failed to reserve stock: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public void releaseStock(Long productId, Integer quantity) {
        logger.info("Releasing stock for productId={}, quantity={}", productId, quantity);

        try {
            String url = INVENTORY_SERVICE_URL + "/products/api/products/" + productId + "/release";
            Map<String, Object> request = Map.of("quantity", quantity);

            restTemplate.postForEntity(url, request, Map.class);

        } catch (Exception e) {
            logger.error("Failed to release stock: {}", e.getMessage());
        }
    }

    @Override
    public Map<Long, StockCheckResult> checkStockForItems(Map<Long, Integer> productQuantities) {
        Map<Long, StockCheckResult> results = new HashMap<>();

        for (Map.Entry<Long, Integer> entry : productQuantities.entrySet()) {
            results.put(entry.getKey(), checkStock(entry.getKey(), entry.getValue()));
        }

        return results;
    }

    @Override
    public boolean reserveAllStock(Map<Long, Integer> productQuantities) {
        List<Long> reservedKeys = new ArrayList<>();
        
        for (Map.Entry<Long, Integer> entry : productQuantities.entrySet()) {
            if (!reserveStock(entry.getKey(), entry.getValue())) {
                for (Long key : reservedKeys) {
                    releaseStock(key, productQuantities.get(key));
                }
                return false;
            }
            reservedKeys.add(entry.getKey());
        }
        return true;
    }

    @Override
    public void releaseStockForItems(Map<Long, Integer> productQuantities) {
        logger.info("Releasing stock for multiple items: {}", productQuantities);
        for (Map.Entry<Long, Integer> entry : productQuantities.entrySet()) {
            releaseStock(entry.getKey(), entry.getValue());
        }
    }
}