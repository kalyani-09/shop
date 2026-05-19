package org.example.event;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;


@Getter
@Setter
public class StockCheckResponse {

    private Long cartId;
    private Long productId;
    private Integer availableQuantity;
    private Boolean isAvailable;
    private Long cartItemId;
    private String message;
    private LocalDateTime timestamp;


    public StockCheckResponse(){}

    public StockCheckResponse(Long cartId, Long productId, Boolean isAvailable, Integer availableQuantity, Long cartItemId, String message){
        this.cartId= cartId;
        this.productId= productId;
        this.isAvailable= isAvailable;
        this.availableQuantity= availableQuantity;
        this.cartItemId= cartItemId;
        this.message = message;
        this.timestamp= LocalDateTime.now();

    }
}
