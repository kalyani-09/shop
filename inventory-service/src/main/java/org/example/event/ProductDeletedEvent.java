package org.example.event;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductDeletedEvent {

    private Long productId;
    private String productName;
    private Long timestamp;

    public ProductDeletedEvent(Long productId,String productName){
        this.productId = productId;
        this.productName = productName;
        this.timestamp= System.currentTimeMillis();
    }

}
