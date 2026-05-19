package org.example.event;

public class StockUpdateRequest {

    private Long cartId;
    private Long productId;
    private Integer quantity;
    private Long cartItemId;
    private String operation;

    public StockUpdateRequest(){}

    public StockUpdateRequest(Long cartId, Long productId, Integer quantity, Long cartItemId, String operation){
        this.cartId = cartId;
        this.productId = productId;
        this.quantity = quantity;
        this.cartItemId = cartItemId;
        this.operation = operation;
    }

    public Long getCartId(){
        return cartId;
    }

    public void setCartId(Long cartId){
        this.cartId = cartId;
    }

    public Long getProductId(){
        return productId;
    }

    public void setProductId(Long productId){
        this.productId = productId;
    }

    public Integer getQuantity(){
        return quantity;
    }

    public void setQuantity(Integer quantity){
        this.quantity = quantity;
    }

    public Long getCartItemId(){
        return cartItemId;
    }

    public void setCartItemId(Long cartItemId){
        this.cartItemId = cartItemId;
    }

    public String getOperation(){
        return operation;
    }

    public void setOperation(String operation){
        this.operation = operation;
    }
}