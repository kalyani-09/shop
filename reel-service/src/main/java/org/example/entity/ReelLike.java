package org.example.entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "reel_likes", uniqueConstraints={
        @UniqueConstraint(columnNames = {"reel_id", "user_id"})
})
@Getter
@Setter
public class ReelLike {

    @Id
    @GeneratedValue(strategy =   GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reel_id", nullable = false)
    private Long reelId;

    @Column(name = "user_id", nullable = false)
    private String userId;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate(){
        createdAt = LocalDateTime.now();
    }

    public ReelLike(){}
}
