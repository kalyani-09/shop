package org.example.config;


import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.support.serializer.JsonSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Value("${topic.cart-item-added}")
    private String cartItemAddedTopic;

    @Value("${topic.stock-updated}")
    private String stockUpdatedTopic;

    @Value("${topic.cart-stock-updated}")
    private String cartStockUpdatedTopic;

    @Value("${topic.product-deleted}")
    private String productDeletedEvent;

    @Bean
    public NewTopic cartItemAddedTopic(){
        return TopicBuilder.name(cartItemAddedTopic)
                .partitions(1)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic stockUpdatedTopic(){
        return TopicBuilder.name(stockUpdatedTopic)
                .partitions(1)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic cartStockUpdatedTopic(){
        return TopicBuilder.name(cartStockUpdatedTopic)
                .partitions(1)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic productDeletedEvent(){
        return TopicBuilder.name(productDeletedEvent)
                .partitions(1)
                .replicas(1)
                .build();
    }

    //Configure Kafka producer
    @Bean
    public ProducerFactory<String, Object> producerFactory(){
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);

        return new DefaultKafkaProducerFactory<>(configProps);

    }

    //KafkaTemplate is used to send message
    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate(){
        return new KafkaTemplate<>(producerFactory());
    }


}
