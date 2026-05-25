package org.example.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;


@Getter
@Setter
public class ReviewResponse {

    private Long id;
    private Long productId;
    private String userEmail;
    private String userName;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;


    public ReviewResponse(){}

    public ReviewResponse(Long id, Long productId, String userEmail, String userName, Integer rating,
                          String comment, LocalDateTime createdAt, LocalDateTime updatedAt){

        this.id = id;
        this.productId = productId;
        this.userEmail = userEmail;
        this.userName = userName;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
