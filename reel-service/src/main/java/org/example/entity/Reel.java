package org.example.entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name= "reels")
@Getter
@Setter
public class Reel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String videoUrl;

    @Column(length = 255)
    private String caption;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "like_count")
    private Integer likeCount = 0;

    @Column(name="created_at")
    private LocalDateTime createdAt;

    @Column(name = "is_active")
    private Boolean isActive  = true;

    @PrePersist
    protected void onCreate(){
        createdAt = LocalDateTime.now();

    }

    public Reel(){}

}
