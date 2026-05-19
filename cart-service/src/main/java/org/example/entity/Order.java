package org.example.entity;




import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;



    @Entity
    @Table(name = "orders")
    @Getter
    @Setter
    public class Order{

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(name= "order_number", unique = true, nullable = false)
        private String orderNumber;

        @Column(name = "user_id", nullable = false)
        private String userId;

        @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
        @JsonManagedReference
        private List<OrderItem> items = new ArrayList<>();

        @Column(name = "total_amount", nullable = false, precision = 10, scale= 2)
        private BigDecimal totalAmount;

        @Column(nullable = false)
        private String status;

        @Column(name= "created_at", nullable = false)
        private LocalDateTime createdAt;

        @Column(name = "updated_at")
        private LocalDateTime updatedAt;

        @Column(name = "image_url")
        private String imageUrl;

        @Column(name = "approved_by")
        private String approvedBy;

        //Default constructor
        public Order(){
            this.status= "PENDING";
            this.createdAt = LocalDateTime.now();
            this.updatedAt= LocalDateTime.now();
        }

        //Constructor
        public Order(String userId, String orderNumber){
            this.userId = userId;
            this.orderNumber = orderNumber;
            this.status= "PENDING";
            this.createdAt = LocalDateTime.now();
            this.updatedAt= LocalDateTime.now();
        }
        public void addItem(OrderItem item){
            items.add(item);
            item.setOrder(this);
        };
    }


