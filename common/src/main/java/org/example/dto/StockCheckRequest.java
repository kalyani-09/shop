package org.example.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;


@Getter
@Setter
public class StockCheckRequest {

    private Long cartId;
    private Long productId;
    private Integer requestedQuantity;
    private Long cartItemId;
    private LocalDateTime timestamp;


    public StockCheckRequest(){}

    public StockCheckRequest(Long cartId, Long productId, Long cartItemId , Integer requestedQuantity){
        this.cartId=cartId;
        this.productId=productId;
        this.requestedQuantity=requestedQuantity;
        this.cartItemId = cartItemId;
        this.timestamp = LocalDateTime.now();
    }
}
