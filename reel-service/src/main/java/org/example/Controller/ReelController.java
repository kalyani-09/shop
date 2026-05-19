package org.example.Controller;

import org.apache.coyote.Response;
import org.example.dto.LikeResponse;
import org.example.dto.ReelResponse;
import org.example.service.ReelService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

import static org.springframework.http.ResponseEntity.ok;



@RestController
@RequestMapping("/reels")
public class ReelController {

    private final ReelService reelService;

    public ReelController(ReelService reelService){
        this.reelService = reelService;
    }
    @GetMapping
    public ResponseEntity<List<ReelResponse>> getReels(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication){

        String  currentUser = authentication != null ? authentication.getName() : null;
        return ResponseEntity.ok(reelService.getReels(page, size, currentUser));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReelResponse> getReel(@PathVariable Long id, Authentication authentication){
        String currentUser = authentication != null ? authentication.getName() : null;
        return ResponseEntity.ok(reelService.getReelById(id, currentUser));
    }

    @PostMapping
    public ResponseEntity<ReelResponse> createReel(
            @RequestParam("video") MultipartFile video,
            @RequestParam("caption") String caption,
            @RequestParam("productId") Long productId,
            Authentication authentication){

        if(authentication == null){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(reelService.createReel(authentication.getName(), video, caption, productId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReel(@PathVariable Long id, Authentication authentication){
        if(authentication == null){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        reelService.deleteReel(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("{id}/like")
    public ResponseEntity<LikeResponse> toggleLike(@PathVariable Long id, Authentication authentication){
        if(authentication == null){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(reelService.toggleLike(authentication.getName(), id));
    }
}
