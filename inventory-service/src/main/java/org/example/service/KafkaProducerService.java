package org.example.service;

import org.example.event.ProductCreatedEvent;
import org.example.event.ProductDeletedEvent;
import org.example.event.StockUpdatedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;


@Service
public class KafkaProducerService {

    private static final Logger logger= LoggerFactory.getLogger(KafkaProducerService.class);

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${topic.cart-item-added}")
    private String topicName;

    @Value("${topic.stock-updated}")
    private String stockUpdatedTopic;

    @Value("${topic.product-deleted}")
    private String productDeletedTopic;

    public KafkaProducerService(KafkaTemplate<String, Object> kafkaTemplate){
        this.kafkaTemplate=kafkaTemplate;
    }
    public void sendProductCreatedEvent(ProductCreatedEvent event){
        logger.info("Sending message to Kafka topic '{}':{}",topicName, event);

        CompletableFuture<SendResult<String , Object>> future= kafkaTemplate.send(topicName, event.getProductId().toString(),event);

        future.whenComplete((result,ex)->{
            if(ex==null){
                logger.info("Message sent successfully! Topic: {}, Partition:{}, Offset:{}",
                        result.getRecordMetadata().topic(),
                        result.getRecordMetadata().partition(),
                        result.getRecordMetadata().offset());
            }
            else{
                logger.error("Failed to send message : {}", ex.getMessage(),ex);
            }
        });
    }

    public void sendStockUpdatedEvent(StockUpdatedEvent event){
        logger.info("Sending stock updated event to Kafka topic '{}': {}", stockUpdatedTopic, event);

        CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(
                stockUpdatedTopic,
                event.getProductId().toString(),
                event
        );


        future.whenComplete((result, ex) -> {
            if(ex == null){
                logger.info("Stock updated event sent successfully! Topic: {}, Partition: {}, Offset: {}",
                        result.getRecordMetadata().topic(),
                        result.getRecordMetadata().partition(),
                        result.getRecordMetadata().offset());
            } else {
                logger.error("Failed to send stock updated event: {}", ex.getMessage(), ex);
            }
        });
    }

    public void sendProductDeletedEvent(ProductDeletedEvent event){
        logger.info("Sending product deleted event to Kafka topic '{}':{}", productDeletedTopic, event);

        CompletableFuture<SendResult<String,Object>> future = kafkaTemplate.send(
                productDeletedTopic,
                event.getProductId().toString(),
                event
        );
        future.whenComplete((result, ex)->{
            if(ex==null){
                logger.info("Product deleted event sent successfully! Topic: {}, Partition: {}, Offset: {}",
                        result.getRecordMetadata().topic(),
                        result.getRecordMetadata().partition(),
                        result.getRecordMetadata().offset());
            }
            else{
                logger.error("Failed to send product deleted event: {}", ex.getMessage(),ex);
            }
        });
    }
}
