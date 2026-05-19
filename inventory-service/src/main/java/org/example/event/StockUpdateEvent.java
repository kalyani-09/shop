package org.example.event;

import java.time.LocalDateTime;

public class StockUpdateEvent {
    private Long productId;
    private Integer newStockQuantity;
    private String operation;
    private LocalDateTime timestamp;

    public StockUpdateEvent() {
        this.timestamp = LocalDateTime.now();
    }

    public StockUpdateEvent(Long productId, Integer newStockQuantity, String operation) {
        this.productId = productId;
        this.newStockQuantity = newStockQuantity;
        this.operation = operation;
        this.timestamp = LocalDateTime.now();
    }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public Integer getNewStockQuantity() { return newStockQuantity; }
    public void setNewStockQuantity(Integer newStockQuantity) { this.newStockQuantity = newStockQuantity; }
    public String getOperation() { return operation; }
    public void setOperation(String operation) { this.operation = operation; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}