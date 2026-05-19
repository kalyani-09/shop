package org.example.controller;

import org.example.dto.AddItemResponse;
import org.example.entity.Cart;
import org.example.entity.CartItem;

import org.example.services.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService){
        this.cartService= cartService;
    }

    @GetMapping
    public ResponseEntity<Map<String,Object>> getCart(){
        String userId = getCurrentUserId();
        Cart cart = cartService.getOrCreateCart(userId);
        List<CartItem> items = cartService.getCartItems(cart.getId());
        BigDecimal total = cartService.calculateCartTotal(cart.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("cartId", cart.getId());
        response.put("userId", userId);
        response.put("items", items);
        response.put("itemCount", items.size());
        response.put("totalAmount", total);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/items")
    public ResponseEntity<AddItemResponse> addToCart(
            @RequestParam Long productId,
            @RequestParam Integer quantity
    ){
        String userId = getCurrentUserId();
        AddItemResponse response = cartService.addItemToCart(userId, productId, quantity);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{cartId}")
    public ResponseEntity<Map<String, String>> clearCart(
            @RequestParam String userId,
            @PathVariable Long cartId){
        cartService.clearCart(userId, cartId);
        return ResponseEntity.ok(Map.of("message", "Cart cleared successfully!"));
    }

    @DeleteMapping("/{cartId}/items/{itemId}")
    public ResponseEntity<Map<String, String>> removeItem(
            @RequestParam String userId,
            @PathVariable Long cartId,
            @PathVariable Long itemId){
        cartService.removeItemFromCart(userId, cartId, itemId);
        return ResponseEntity.ok(Map.of("message", "Item removed from cart"));
    }

    private String getCurrentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}
