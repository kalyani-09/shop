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
    private Long cartItemId;
    private Boolean isAvailable;
    private String message;
    private LocalDateTime timestamp;

    public StockCheckResponse(){}
}
