package org.example.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;


@Entity
@Table(name="cart_items")
@Getter
@Setter
public class CartItem {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    @JsonIgnoreProperties({"items"})
    private Cart cart;

    @Column(name="product_id", nullable= false)
    private Long productId;

    @Column(name = "product_name", nullable= false)
    private String productName;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name ="unit-price", nullable= false, precision= 10, scale=2)
    private BigDecimal unitPrice;

    @Column(name="item_status", nullable = false)
    private String status;

    @Column(name="stock_quantity")
    private Integer stockQuantity;

    @Column(name="image_url")
    private String imageUrl;

    @Column(name= "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name= "updated_at")
    private LocalDateTime updatedAt;


    //Default constuctor
    public CartItem(){
        this.status="PENDING";
        this.createdAt= LocalDateTime.now();
        this.updatedAt= LocalDateTime.now();
    }

    //Constructor
    public CartItem(Cart cart, Long productId, String status, String productName, Integer quantity, BigDecimal unitPrice, Integer stockQuantity, String imageUrl){
        this.cart=cart;
        this.productId = productId;
        this.productName= productName;
        this.quantity = quantity;
        this.unitPrice= unitPrice;
        this.status=status;
        this.stockQuantity = stockQuantity;
        this.imageUrl= imageUrl;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    //Calculate subtotal
    public BigDecimal getsubtotal(){
        return unitPrice.multiply(BigDecimal.valueOf(quantity != null ? quantity : 0));
    }
}
