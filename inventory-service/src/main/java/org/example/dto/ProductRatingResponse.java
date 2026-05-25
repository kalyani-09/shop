package org.example.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductRatingResponse {
    private double averageRating;
    private long reviewCount;

    public ProductRatingResponse(){}

    public ProductRatingResponse(double averageRating, long reviewCount){
        this.averageRating = averageRating;
        this.reviewCount = reviewCount;
    }
}
