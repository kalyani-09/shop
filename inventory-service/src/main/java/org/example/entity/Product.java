package org.example.entity;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "products")
@Getter
@Setter
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private Double price;

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity;

    private String category;

    @JsonProperty("imageURL")
    @JsonAlias({ "imageURL", "imageUrl" })
    @Column(name = "imageURL")
    private String imageUrl;

    private String sku;

    @Column(name = "created_by")
    private String createdBy;

    // Default Constructor(required by JPA)
    public Product() {
    }

    // Constructor with fields
    public Product(String name, String description, Double price,
            Integer stockQuantity, String category, String imageUrl, String sku) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.stockQuantity = stockQuantity;
        this.category = category;
        this.imageUrl = imageUrl;
        this.sku = sku;
    }
}
