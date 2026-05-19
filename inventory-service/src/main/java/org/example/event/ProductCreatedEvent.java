package org.example.event;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ProductCreatedEvent {

    private Long productId;
    private String productName;
    private Integer stockQuantity;
    private LocalDateTime timestamp;

    public ProductCreatedEvent(){}

    public ProductCreatedEvent(long productId, String productName, Integer stockQuantity ){
        this.productId= productId;
        this.productName= productName;
        this.stockQuantity = stockQuantity;
        this.timestamp=LocalDateTime.now();
    }

    @Override
    public String toString(){
        return "ProductCreatedEvent{"+
                "productId="+productId +
                ",productName='" + productName + '\'' +
                ",stockQuantity=" + stockQuantity +
                ",timestamp=" + timestamp +
                '}';
    }
}
