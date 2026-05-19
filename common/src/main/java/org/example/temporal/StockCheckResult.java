package org.example.temporal;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockCheckResult {

    private Long productId;
    private boolean available;
    private Integer availableQuantity;
    private String message;

}
