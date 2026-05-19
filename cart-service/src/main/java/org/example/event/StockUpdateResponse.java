package org.example.event;

public class StockUpdateResponse {

    private Long cartId;
    private Long productId;
    private Boolean success;
    private Integer remainingStock;
    private Long cartItemId;
    private String message;

    public StockUpdateResponse(){}

    public StockUpdateResponse(Long cartId, Long productId, Boolean success, Integer remainingStock, Long cartItemId, String message){
        this.cartId = cartId;
        this.productId = productId;
        this.success = success;
        this.remainingStock = remainingStock;
        this.cartItemId = cartItemId;
        this.message = message;
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

    public Boolean getSuccess(){
        return success;
    }

    public void setSuccess(Boolean success){
        this.success = success;
    }

    public Integer getRemainingStock(){
        return remainingStock;
    }

    public void setRemainingStock(Integer remainingStock){
        this.remainingStock = remainingStock;
    }

    public Long getCartItemId(){
        return cartItemId;
    }

    public void setCartItemId(Long cartItemId){
        this.cartItemId = cartItemId;
    }

    public String getMessage(){
        return message;
    }

    public void setMessage(String message){
        this.message = message;
    }
}