package org.example.controller;

import jakarta.validation.Valid;
import org.example.dto.ProductRatingResponse;
import org.example.dto.ReviewRequest;
import org.example.dto.ReviewResponse;
import org.example.service.ReviewService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    // Get all reviews of a product
    @GetMapping("/products/{productId}/reviews")
    public ResponseEntity<Page<ReviewResponse>> getReviews(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(
                reviewService.getReviewsByProduct(productId, page, size)
        );
    }

    // Get single review
    @GetMapping("/products/{productId}/reviews/{reviewId}")
    public ResponseEntity<ReviewResponse> getReview(
            @PathVariable Long productId,
            @PathVariable Long reviewId) {

        return reviewService.getReview(productId, reviewId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get product rating
    @GetMapping("/products/{productId}/rating")
    public ResponseEntity<ProductRatingResponse> getRating(
            @PathVariable Long productId) {

        return ResponseEntity.ok(
                reviewService.getProductRating(productId)
        );
    }

    // Create review
    @PostMapping("/products/{productId}/reviews")
    public ResponseEntity<?> createReview(
            @PathVariable Long productId,
            @Valid @RequestBody ReviewRequest request) {

        String userEmail = getCurrentUserEmail();

        try {
            ReviewResponse response =
                    reviewService.createReview(productId, userEmail, request);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {

            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Update review
    @PutMapping("/products/{productId}/reviews/{reviewId}")
    public ResponseEntity<?> updateReview(
            @PathVariable Long productId,
            @PathVariable Long reviewId,
            @Valid @RequestBody ReviewRequest request) {

        String userEmail = getCurrentUserEmail();
        String userRole = getCurrentUserRole();

        Optional<ReviewResponse> updated = reviewService
                .updateReview(productId, reviewId, userEmail, userRole, request);
        
        if (updated.isPresent()) {
            return ResponseEntity.ok(updated.get());
        }
        
        return ResponseEntity.status(403)
                .body(Map.of(
                        "error",
                        "Not authorized or review not found"
                ));
    }

    // Delete review
    @DeleteMapping("/products/{productId}/reviews/{reviewId}")
    public ResponseEntity<Map<String, String>> deleteReview(
            @PathVariable Long productId,
            @PathVariable Long reviewId) {

        String userEmail = getCurrentUserEmail();
        String userRole = getCurrentUserRole();

        boolean deleted = reviewService.deleteReview(
                productId,
                reviewId,
                userEmail,
                userRole
        );

        if (deleted) {
            return ResponseEntity.ok(
                    Map.of("message", "Review deleted successfully")
            );
        }

        return ResponseEntity.status(403)
                .body(Map.of(
                        "error",
                        "Not authorized or review not found"
                ));
    }

    // Get logged-in user email
    private String getCurrentUserEmail() {
        return SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
    }

    // Get logged-in user role
    private String getCurrentUserRole() {
        return SecurityContextHolder.getContext()
                .getAuthentication()
                .getAuthorities()
                .stream()
                .findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .orElse(null);
    }
}