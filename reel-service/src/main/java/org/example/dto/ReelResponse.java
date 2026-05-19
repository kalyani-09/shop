package org.example.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class ReelResponse {

    private Long id;
    private String videoUrl;
    private String caption;
    private Long productId;
    private String userId;
    private int likeCount;
    private boolean likeByMe;
    private LocalDateTime createdAt;
    private ProductBrief product;

}
