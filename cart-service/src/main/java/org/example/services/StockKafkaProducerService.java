package org.example.services;


import org.example.dto.StockCheckRequest;
import org.example.event.StockUpdateEvent;
import org.example.event.StockUpdateRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;


@Service
public class StockKafkaProducerService {

    private static final Logger logger = LoggerFactory.getLogger(StockKafkaProducerService.class);

    private final KafkaTemplate<String, Object>kafkaTemplate;

    @Value("${topic.cart-stock-updated}")
    private String cartStockUpdatedTopic;

    public StockKafkaProducerService(KafkaTemplate<String, Object>kafkaTemplate){
        this.kafkaTemplate= kafkaTemplate;
    }

    public void requestStockCheck(Long cartId, Long productId, Integer quantity, Long cartItemId){
        StockCheckRequest request = new StockCheckRequest(cartId,  productId, cartItemId,quantity  );

        request.setCartItemId(cartItemId);

        logger.info("Sending stock check request: cartId={}, productId={}, quantity={}", cartId, productId, quantity);

        kafkaTemplate.send("stock.check-request", cartId.toString(), request);
        logger.info("Stock check request sent successfully");
    }

    public void requestStockUpdate(Long cartId, Long productId, Integer quantity, Long cartItemId, String operation){
        StockUpdateRequest request = new StockUpdateRequest(cartId, productId, quantity, cartItemId, operation);

        logger.info("Sending stock update request: cartId={}, productId={}, quantity={}, operation={}", 
                cartId, productId, quantity, operation);

        kafkaTemplate.send("stock.update-request", cartId.toString(), request);
        logger.info("Stock update request sent successfully");
    }

    public void publishStockUpdate(Long productId, Integer newStockQuantity, String operation){
        StockUpdateEvent event = new StockUpdateEvent(productId, newStockQuantity, operation);

        logger.info("Publishing stock update event: productId={}, newStockQuantity={}, operation={}",
                productId, newStockQuantity, operation);

        kafkaTemplate.send(cartStockUpdatedTopic, productId.toString(), event);
        logger.info("Stock update event published successfully to topic: {}", cartStockUpdatedTopic);
    }
}
