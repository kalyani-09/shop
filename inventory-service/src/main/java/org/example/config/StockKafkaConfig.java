package org.example.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;
import org.example.event.StockCheckResponse;
import org.example.dto.StockCheckRequest;
import org.example.event.StockUpdateEvent;
import org.example.event.StockUpdateRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.*;
import org.springframework.kafka.support.serializer.JsonDeserializer;
import org.springframework.kafka.support.serializer.JsonSerializer;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class StockKafkaConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Value("${spring.kafka.consumer.group-id}")
    private String groupId;


    @Bean
    public NewTopic stockCheckRequestTopic(){
        return TopicBuilder.name("stock.check-request")
                .partitions(1)
                .replicas(1)
                .build();
    }


    @Bean
    public NewTopic stockCheckResponseTopic(){
        return TopicBuilder.name("stock.check-response")
                .partitions(1)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic stockUpdateRequestTopic(){
        return TopicBuilder.name("stock.update-request")
                .partitions(1)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic stockUpdateResponseTopic(){
        return TopicBuilder.name("stock.update-response")
                .partitions(1)
                .replicas(1)
                .build();
    }

    //Producer for sending responses (reused for both check and update responses)
    @Bean
    public ProducerFactory<String, StockCheckResponse> stockResponseProducerFactory(){
        Map<String, Object> configProps= new HashMap<>();
        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        return new DefaultKafkaProducerFactory<>(configProps);
    }

    @Bean
    public KafkaTemplate<String, StockCheckResponse> stockResponseKafkaTemplate(){
        return new KafkaTemplate<>(stockResponseProducerFactory());
    }

    @Bean
    public ConsumerFactory<String, StockCheckRequest> stockRequestConsumerFactory(){
        Map<String, Object> props= new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);
        props.put(JsonDeserializer.TRUSTED_PACKAGES,"*");
        props.put(JsonDeserializer.VALUE_DEFAULT_TYPE,StockCheckRequest.class.getName());
        return new DefaultKafkaConsumerFactory<>(props);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, StockCheckRequest>
    stockRequestListenerFactory(){
        ConcurrentKafkaListenerContainerFactory<String, StockCheckRequest> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(stockRequestConsumerFactory());

        return factory;
    }

    @Bean
    public ConsumerFactory<String, StockUpdateRequest> stockUpdateRequestConsumerFactory(){
        Map<String, Object> props= new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);
        props.put(JsonDeserializer.TRUSTED_PACKAGES,"*");
        props.put(JsonDeserializer.VALUE_DEFAULT_TYPE,StockUpdateRequest.class.getName());
        return new DefaultKafkaConsumerFactory<>(props);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, StockUpdateRequest>
    stockUpdateRequestListenerFactory(){
        ConcurrentKafkaListenerContainerFactory<String, StockUpdateRequest> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(stockUpdateRequestConsumerFactory());

        return factory;
    }

    @Bean
    public ConsumerFactory<String, StockUpdateEvent> stockUpdateEventConsumerFactory(){
        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);
        props.put(JsonDeserializer.TRUSTED_PACKAGES, "*");
        props.put(JsonDeserializer.VALUE_DEFAULT_TYPE, StockUpdateEvent.class.getName());
        return new DefaultKafkaConsumerFactory<>(props);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, StockUpdateEvent> stockUpdateListenerFactory(){
        ConcurrentKafkaListenerContainerFactory<String, StockUpdateEvent> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(stockUpdateEventConsumerFactory());
        return factory;
    }
}
