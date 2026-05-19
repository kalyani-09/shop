package org.example.dto;

import org.example.entity.CartItem;

public class AddItemResponse {
    private CartItem item;
    private Integer remainingStock;
    private String message;

    public AddItemResponse() {}

    public AddItemResponse(CartItem item, Integer remainingStock, String message) {
        this.item = item;
        this.remainingStock = remainingStock;
        this.message = message;
    }

    public CartItem getItem() {
        return item;
    }

    public void setItem(CartItem item) {
        this.item = item;
    }

    public Integer getRemainingStock() {
        return remainingStock;
    }

    public void setRemainingStock(Integer remainingStock) {
        this.remainingStock = remainingStock;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}