package org.example.services;

import org.example.event.StockCheckResponse;
import org.example.event.StockUpdatedEvent;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.example.event.ProductCreatedEvent;

@Service
public class KafkaConsumerService {

    private static final Logger logger = LoggerFactory.getLogger(KafkaConsumerService.class);


    // Reference to CartService for handling responses
    private final CartService cartService;

    public KafkaConsumerService(CartService cartService){
        this.cartService = cartService;
    }

    @KafkaListener(
            topics = "cart.item-added",
            groupId = "cart-group",
            containerFactory = "kafkaListenerContainerFactory"
    )

    public void consumeProductCreatedEvent(ProductCreatedEvent event){
        logger.info("===================================================");
        logger.info("RECEIVED MESSAGE FROM KAFKA");
        logger.info("===================================================");
        logger.info("Product Id: {}", event.getProductId());
        logger.info("Product Name: {}",event.getProductName());
        logger.info("Stock Quantity: {}", event.getStockQuantity());
        logger.info("Timestamp:{}", event.getTimestamp());
        logger.info("===================================================");

    }

    //NEW:Receive stock check Response
    @KafkaListener(
            topics= "stock.check-response",
            groupId= "cart-group",
            containerFactory = "stockResponseListenerFactory"
    )
    public void consumeStockCheckResponse(@Payload StockCheckResponse response){
        logger.info("=====================================");
        logger.info("Received stock check response");
        logger.info("=====================================");
        logger.info("Cart ID: {}", response.getCartId());
        logger.info("Product ID: {}", response.getProductId());
        logger.info("Is Available: {}", response.getIsAvailable());
        logger.info("Message: {}", response.getIsAvailable());
        logger.info("Message :{}",response.getMessage());
        logger.info("=====================================");


        cartService.handleStockCheckResponse(response);
    }

    @KafkaListener(
            topics = "stock.update-response",
            groupId = "cart-group",
            containerFactory = "stockResponseListenerFactory"
    )
    public void consumeStockUpdateResponse(@Payload StockCheckResponse response){
        logger.info("=====================================");
        logger.info("Received stock update response");
        logger.info("=====================================");
        logger.info("Cart ID: {}", response.getCartId());
        logger.info("Product ID: {}", response.getProductId());
        logger.info("Is Available: {}", response.getIsAvailable());
        logger.info("Available Quantity: {}", response.getAvailableQuantity());
        logger.info("Message: {}", response.getMessage());
        logger.info("=====================================");

        cartService.handleStockUpdateResponse(response);
    }

    @KafkaListener(
            topics = "stock.updated",
            groupId = "cart-group",
            containerFactory = "stockUpdatedListenerFactory"
    )
    public void consumeStockUpdatedEvent(@Payload StockUpdatedEvent event){
        logger.info("=====================================");
        logger.info("Received stock updated event");
        logger.info("=====================================");
        logger.info("Product ID: {}", event.getProductId());
        logger.info("New Stock Quantity: {}", event.getNewStockQuantity());
        logger.info("=====================================");

        cartService.updateCartItemStock(event.getProductId(), event.getNewStockQuantity());
    }
}
