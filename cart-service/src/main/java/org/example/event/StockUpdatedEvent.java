package org.example.event;

import java.time.LocalDateTime;

public class StockUpdatedEvent {
    private Long productId;
    private Integer newStockQuantity;
    private LocalDateTime updatedAt;

    public StockUpdatedEvent() {}

    public StockUpdatedEvent(Long productId, Integer newStockQuantity) {
        this.productId = productId;
        this.newStockQuantity = newStockQuantity;
        this.updatedAt = LocalDateTime.now();
    }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public Integer getNewStockQuantity() { return newStockQuantity; }
    public void setNewStockQuantity(Integer newStockQuantity) { this.newStockQuantity = newStockQuantity; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}