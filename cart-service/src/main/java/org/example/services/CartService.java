package org.example.services;
import jakarta.transaction.Transactional;
import org.example.dto.AddItemResponse;
import org.example.dto.ProductDTO;
import org.example.entity.Cart;
import org.example.entity.CartItem;
import org.example.event.StockCheckResponse;
import org.example.repository.CartItemRepository;
import org.example.repository.CartRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CartService {

    private static final Logger logger= LoggerFactory.getLogger(CartService.class);

    private final ConcurrentHashMap<String, StockCheckResponse> pendingStockResponses = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, StockCheckResponse> pendingStockUpdates = new ConcurrentHashMap<>();

    private  final CartRepository cartRepository;




    private  final CartItemRepository cartItemRepository;

    private final StockKafkaProducerService stockKafkaProducerService;

    private final RestTemplate restTemplate;

    @Value("${inventory.service.url}")
    private String inventoryServiceUrl;

    public CartService(CartRepository cartRepository, CartItemRepository cartItemRepository, StockKafkaProducerService stockKafkaProducerService, RestTemplate restTemplate){
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.stockKafkaProducerService= stockKafkaProducerService;
        this.restTemplate = restTemplate;
    }

    //Get or create cart for user
    public Cart getOrCreateCart(String userId){
        return cartRepository.findByUserId(userId)
                .orElseGet(()->{
                    logger.info("Creating new cart for user : {} ", userId);
                    Cart newCart= new Cart(userId);
                    return cartRepository.save(newCart);
                });
    }

    //Get cart by Id
    public Cart getCartById(Long cartId){
        return cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found: "+cartId));
    }

    //Get all items in a cart
    public List<CartItem> getCartItems(Long cartId){
        return cartItemRepository.findByCartId(cartId);
    }

    //Add item to cart
   @Transactional
public AddItemResponse addItemToCart(String userId, Long productId, Integer quantity) {

    Cart cart = getOrCreateCart(userId);

    // Fetch product from inventory-service
    String url = inventoryServiceUrl + "/products/" + productId;
    ProductDTO product = restTemplate.getForObject(url, ProductDTO.class);
    if (product == null) {
        throw new RuntimeException("Product not found");
    }

    String productName = product.getName();
    BigDecimal unitPrice = product.getPrice();
    String imageUrl = product.getImageUrl();

    // Step 1: Send stock check request
    Long cartItemId = System.currentTimeMillis();

    logger.info("Requesting stock check for productId: {}, quantity:{}",
            productId, quantity);

    stockKafkaProducerService.requestStockCheck(
            cart.getId(),
            productId,
            quantity,
            cartItemId
    );

    // Step 2: Wait for response
    StockCheckResponse response = waitForStockResponse(cartItemId, 10000);

    // Step 3: Validate stock
    if (response == null || !response.getIsAvailable()) {

        logger.warn("Stock NOT available for productID: {}. Message:{}",
                productId,
                response != null ? response.getMessage() : "No response");

        throw new RuntimeException(
                "Insufficient stock! " +
                        (response != null ? response.getMessage()
                                : "unable to verify stock")
        );
    }

    // Step 4: Add/update cart item
    CartItem savedItem;
    Integer currentStock = response.getAvailableQuantity();

    List<CartItem> existingItems =
            cartItemRepository.findByCartIdAndProductId(
                    cart.getId(),
                    productId
            );

    if (!existingItems.isEmpty()) {

        CartItem existingItem = existingItems.get(0);

        existingItem.setQuantity(quantity);
        existingItem.setStatus("CONFIRMED");
        existingItem.setStockQuantity(currentStock);
        existingItem.setImageUrl(imageUrl);

        savedItem = cartItemRepository.save(existingItem);

        logger.info("Updated existing item quantity");

    } else {

        CartItem newItem = new CartItem(
                cart,
                productId,
                "CONFIRMED",
                productName,
                quantity,
                unitPrice,
                currentStock,
                imageUrl
        );

        savedItem = cartItemRepository.save(newItem);

        logger.info("Added new item to cart: {}", productName);
    }

    Integer remainingStock = currentStock;

    return new AddItemResponse(
            savedItem,
            remainingStock,
            "Item added to cart successfully!"
    );
}


    @Transactional
    public void removeItemFromCart(String userId, Long cartId, Long itemId){
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found: " + cartId));
        if (!cart.getUserId().equals(userId)) {
            throw new RuntimeException("Cart does not belong to user: " + userId);
        }
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found: " + itemId));
        if (!item.getCart().getId().equals(cartId)) {
            throw new RuntimeException("Item does not belong to cart: " + cartId);
        }
        cartItemRepository.deleteById(itemId);
        logger.info("removed item {} from cart {} for user {}", itemId, cartId, userId);
    }


    @Transactional
    public void clearCart(String userId, Long cartId){
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found: " + cartId));
        if (!cart.getUserId().equals(userId)) {
            throw new RuntimeException("Cart does not belong to user: " + userId);
        }
        cartItemRepository.deleteByCartId(cartId);
        logger.info("Cleared all items from cart: {} for user: {}", cartId, userId);
    }

    //Calculate total
    public BigDecimal calculateCartTotal(Long cartId){
        List<CartItem> items = cartItemRepository.findByCartId(cartId);
        return items.stream()
                .map(CartItem::getsubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

    }
    public void handleStockCheckResponse(StockCheckResponse response) {
        logger.info("Handling stock response for cart: {}", response.getCartId());
        String key = response.getCartItemId().toString();
        pendingStockResponses.put(key, response);

        if (response.getIsAvailable()) {
            logger.info("Product {} is available", response.getProductId());
            // Example: update status to CONFIRMED
            List<CartItem> items = cartItemRepository
                    .findByCartIdAndProductId(response.getCartId(), response.getProductId());

            if (!items.isEmpty()) {
                CartItem item = items.get(0);
                item.setStatus("CONFIRMED");
                item.setStockQuantity(response.getAvailableQuantity());
                cartItemRepository.save(item);
            }
        } else {
            logger.warn("Product {} is NOT available", response.getProductId());
            // Example: mark as FAILED or remove item
            List<CartItem> items = cartItemRepository
                    .findByCartIdAndProductId(response.getCartId(), response.getProductId());

            if (!items.isEmpty()) {
                CartItem item = items.get(0);
                item.setStatus("FAILED");
                item.setStockQuantity(response.getAvailableQuantity());
                cartItemRepository.save(item);
            }
        }
    }



    //Helper method
    private StockCheckResponse waitForStockResponse(Long cartItemId, long timeoutMs){
        long startTime = System.currentTimeMillis();



        while(System.currentTimeMillis() - startTime < timeoutMs){
            StockCheckResponse response = pendingStockResponses.get(cartItemId.toString());
            if(response != null){
                //Remove from pending and return
                pendingStockResponses.remove(cartItemId.toString());
                return response;
            }

            try{
                Thread.sleep(100);

            }
            catch(InterruptedException e){
                Thread.currentThread().interrupt();
                break;
            }
        }
        return null;
    }

    public void handleStockUpdateResponse(StockCheckResponse response){
        logger.info("Handling stock update response for cart: {}, product: {}, success: {}",
                response.getCartId(), response.getProductId(), response.getIsAvailable());
        String key = response.getCartItemId().toString();
        pendingStockUpdates.put(key, response);
    }

    private StockCheckResponse waitForStockUpdate(Long cartItemId, long timeoutMs){
        long startTime = System.currentTimeMillis();

        while(System.currentTimeMillis() - startTime < timeoutMs){
            StockCheckResponse response = pendingStockUpdates.get(cartItemId.toString());
            if(response != null){
                pendingStockUpdates.remove(cartItemId.toString());
                return response;
            }

            try{
                Thread.sleep(100);
            }
            catch(InterruptedException e){
                Thread.currentThread().interrupt();
                break;
            }
        }
        return null;
    }

    public void updateCartItemStock(Long productId, Integer newStockQuantity){
        logger.info("Updating stock quantity for productId: {} to {}", productId, newStockQuantity);
        cartItemRepository.updateStockQuantityByProductId(productId, newStockQuantity);
    }

}
