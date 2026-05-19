package org.example.repository;

import org.example.entity.ReelLike;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReelLikeRepository extends JpaRepository<ReelLike, Long> {

    Optional<ReelLike> findByReelIdAndUserId(Long reelId, String userId);
    boolean existsByReelIdAndUserId(Long reelId, String userId);
    int countByReelId(Long reelId);
}
