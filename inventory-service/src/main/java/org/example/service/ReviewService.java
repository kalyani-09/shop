package org.example.service;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.example.dto.ProductRatingResponse;
import org.example.dto.ReviewRequest;
import org.example.dto.ReviewResponse;
import org.example.entity.Review;
import org.example.repository.ProductRepository;
import org.example.repository.ReviewRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ReviewService {

    private static final Logger log = LoggerFactory.getLogger(ReviewService.class);

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;

    public ReviewService(ReviewRepository reviewRepository,
                         ProductRepository productRepository){
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
    }

    public Page<ReviewResponse> getReviewsByProduct(Long productId, int page , int size){
        Pageable pageable = PageRequest.of(page, size);
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId, pageable)
                .map(this::toResponse);
    }

    public Optional<ReviewResponse> getReview(Long productId, Long reviewId){
        return reviewRepository.findById(reviewId)
                .filter(r->r.getProductId().equals(productId))
                .map(this::toResponse);
    }

    public ProductRatingResponse getProductRating(Long productId){
        Double avg = reviewRepository.findAverageRatingByProductId(productId);
        Long count = reviewRepository.countByProductId(productId);
        return new ProductRatingResponse(avg != null ? avg : 0.0, count !=null ? count : 0L);
    }

    @Transactional
    public ReviewResponse createReview(Long productId, String userEmail, @Valid ReviewRequest request){
        //Step 1:- Check product exists
        productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product Not Found"));

        //Check not already reviewed
        if(reviewRepository.existsByProductIdAndUserEmail(productId, userEmail)){
            throw new RuntimeException("You have already reviewed this product");
        }


        //Save review
        Review review = new Review();
        review.setProductId(productId);
        review.setUserEmail(userEmail);
        review.setUserName(request.getUserName());
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        Review saved = reviewRepository.save(review);

        //Update product rating
        updateProductRating(productId);

        return toResponse(saved);
    }

    @Transactional
    public Optional<ReviewResponse> updateReview(Long productId, Long reviewId, String userEmail,
                                                 String userRole, @Valid ReviewRequest request){
        return reviewRepository.findById(reviewId)
                .filter(r->r.getProductId().equals(productId))
                .filter(r -> r.getUserEmail().equals(userEmail) || "ADMIN".equals(userRole))
                .map(r->{
                    r.setRating(request.getRating());
                    r.setComment(request.getComment());
                    r.setUserName(request.getUserName());
                    Review saved = reviewRepository.save(r);
                    updateProductRating(productId);
                    return toResponse(saved);
                });
    }

    @Transactional
    public boolean deleteReview(Long productId, Long reviewId, String userEmail, String userRole){
        Optional<Review> opt = reviewRepository.findById(reviewId);
        if(opt.isEmpty() || !opt.get().getProductId().equals(productId)){
            return false;
        }

        Review review = opt.get();
        if(!review.getUserEmail().equals(userEmail) && !"ADMIN".equals(userRole)){
            return false;
        }

        reviewRepository.delete(review);
        updateProductRating(productId);
        return true;
    }


    private void updateProductRating(Long productId){
        Double avg = reviewRepository.findAverageRatingByProductId(productId);
        Long count = reviewRepository.countByProductId(productId);
        productRepository.findById(productId).ifPresent(p->{
            p.setAverageRating(avg != null ? Math.round(avg *10.0) / 10.0 : 0.0);
            p.setReviewCount(count != null ? count.intValue() : 0);
            productRepository.save(p);
        });
    }

    private ReviewResponse toResponse(Review r){
        return new ReviewResponse(
                r.getId(), r.getProductId(), r.getUserEmail(),
                r.getUserName(), r.getRating(), r.getComment(),
                r.getCreatedAt(), r.getUpdatedAt()
        );
    }
}
