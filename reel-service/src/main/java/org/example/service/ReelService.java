package org.example.service;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.example.dto.LikeResponse;
import org.example.dto.ProductBrief;
import org.example.dto.ReelResponse;
import org.example.entity.Reel;
import org.example.entity.ReelLike;
import org.example.exception.ReelNotFoundException;
import org.example.exception.UnauthorizedException;
import org.example.repository.ReelLikeRepository;
import org.example.repository.ReelRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ReelService {

    private final ReelRepository reelRepository;
    private final ReelLikeRepository reelLikeRepository;
    private final RestTemplate restTemplate;
    private final Path uploadDir;

    private static final List<String> ALLOWED_EXTENSIONS = List.of("mp4", "mov", "webm", "avi");
    public ReelService(ReelRepository reelRepository, ReelLikeRepository reelLikeRepository, RestTemplate restTemplate, @Value("${app.upload.dir}") String uploadPath){
        this.reelRepository = reelRepository;
        this.reelLikeRepository= reelLikeRepository;
        this.restTemplate = restTemplate;
        this.uploadDir = Paths.get(uploadPath).toAbsolutePath();
        initUploadDir();
    }

    private void initUploadDir(){
        try{
            Files.createDirectories(uploadDir);
        }catch(IOException e){
            throw new RuntimeException("Could not create Upload directory",e);
        }
    }

    public List<ReelResponse> getReels(int page , int size, String currentUser){
        Pageable pageable = PageRequest.of(page, size);
        Page<Reel> reelPage = reelRepository.findAllByIsActiveTrueOrderByCreatedAtDesc(pageable);

        return reelPage.getContent().stream()
                .map(reel -> toReelResponse(reel, currentUser))
                .collect(Collectors.toList());
    }

    public ReelResponse getReelById(Long id, String currentUser){
        Reel reel = reelRepository.findById(id)
                .orElseThrow(()-> new ReelNotFoundException(id));
        return toReelResponse(reel, currentUser);


    }

    @Transactional
    public ReelResponse createReel(String userEmail, MultipartFile video, String caption , Long productId){
        if(video.isEmpty()){
            throw new IllegalArgumentException("Video file is required");
        }

        String extension = getExtension(Objects.requireNonNull(video.getOriginalFilename()));
        if(!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())){
            throw new IllegalArgumentException("Invalid file type: " + extension + ". Allowed: " + ALLOWED_EXTENSIONS );
        }
        validateProductId(productId);
        String filename = UUID.randomUUID() + "." + extension;
        Path targetPath = uploadDir.resolve(filename);

        try{
            video.transferTo(targetPath.toFile());
        }
        catch(IOException e){
            throw new RuntimeException("Failed to store video file", e);
        }

        Reel reel = new Reel();
        reel.setVideoUrl("/videos/" + filename);
        reel.setCaption(caption);
        reel.setProductId(productId);
        reel.setUserId(userEmail);
        reel.setLikeCount(0);
        reel.setIsActive(true);

        reel = reelRepository.save(reel);
        return toReelResponse(reel, userEmail);
    }

    @Transactional
    public void deleteReel(String userEmail, Long id){
        Reel reel = reelRepository.findById(id)
                .orElseThrow(()-> new ReelNotFoundException(id));

        if(!reel.getUserId().equals(userEmail)){
             throw new UnauthorizedException("You can only delete your own reels");
        }
        reel.setIsActive(false);
        reelRepository.save(reel);
    }

    @Transactional
    public LikeResponse toggleLike(String userEmail, Long reelId){
        if(!reelRepository.existsById(reelId)){
            throw new ReelNotFoundException(reelId);
        }
        var existingLike = reelLikeRepository.findByReelIdAndUserId(reelId, userEmail);

        if(existingLike.isPresent()){
            reelLikeRepository.delete(existingLike.get());
            Reel reel = reelRepository.findById(reelId).orElseThrow();
            reel.setLikeCount(reel.getLikeCount()-1);
            reelRepository.save(reel);
            return new LikeResponse(false, reel.getLikeCount());
        }
        else{
            ReelLike like = new ReelLike();
            like.setReelId(reelId);
            like.setUserId(userEmail);
            reelLikeRepository.save(like);

            Reel reel = reelRepository.findById(reelId).orElseThrow();
            reel.setLikeCount(reel.getLikeCount()+1);
            reelRepository.save(reel);
            return new LikeResponse(true, reel.getLikeCount());
        }
    }

    private ReelResponse toReelResponse(Reel reel , String currentUser){
        boolean likedByMe = currentUser != null &&
        reelLikeRepository.existsByReelIdAndUserId(reel.getId(), currentUser);

        ProductBrief product = fetchProduct(reel.getProductId());

        return new ReelResponse(
                reel.getId(),
                reel.getVideoUrl(),
                reel.getCaption(),
                reel.getProductId(),
                reel.getUserId(),
                reel.getLikeCount(),
                likedByMe,
                reel.getCreatedAt(),
                product
        );
    }

    private void validateProductId(Long productId){
        try{
            String url= "http://localhost:8081/products/"+productId;
            var response = restTemplate.getForEntity(url, Object.class);
            if(!response.getStatusCode().is2xxSuccessful()){
                throw new IllegalArgumentException("Product not found with id: "+ productId);
            }
        }catch(Exception e){
            throw new IllegalArgumentException("Product not found with id: " + productId);
        }
    }

    private ProductBrief fetchProduct(Long productId){
        try{
            String url= "http://localhost:8081/products/" + productId;
            var response = restTemplate.getForEntity(url, ProductBrief.class);
            return response.getBody();
        }
        catch(Exception e){
            return new ProductBrief(productId, "Unknown Product", 0.0, null);
        }
    }

    private String getExtension(String filename){
        int dotIndex = filename.lastIndexOf('.');
        if(dotIndex == -1 || dotIndex == filename.length() -1){
            return "";
        }
        return filename.substring(dotIndex +1);
    }

}
