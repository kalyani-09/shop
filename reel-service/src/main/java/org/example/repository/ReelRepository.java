package org.example.repository;

import org.example.entity.Reel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReelRepository extends JpaRepository<Reel, Long> {

    Page<Reel> findAllByIsActiveTrueOrderByCreatedAtDesc(Pageable pageable);
    Optional<Reel> findByIdAndUserId(Long id, String userId);
}
