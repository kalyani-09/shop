package org.example.services;

import org.springframework.transaction.annotation.Transactional;
import org.example.entity.Cart;
import org.example.entity.CartItem;
import org.example.entity.Order;
import org.example.entity.OrderItem;
import org.example.repository.OrderRepository;
import org.example.dto.ProductDTO;
import org.example.temporal.OrderFulfillmentResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;


@Service
public class CheckOutService {

    private static final Logger logger = LoggerFactory.getLogger(CheckOutService.class);

    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final OrderFulfillmentWorkflowClient workflowClient;
    private final OrderQueryService orderQueryService;

    @Autowired
    private RestTemplate restTemplate;

    public CheckOutService(OrderRepository orderRepository,
                           CartService cartService,
                           OrderFulfillmentWorkflowClient workflowClient,
                           OrderQueryService orderQueryService) {
        this.orderRepository = orderRepository;
        this.cartService = cartService;
        this.workflowClient = workflowClient;
        this.orderQueryService = orderQueryService;
    }

    @Transactional
    public Order createOrderDirectly(String userId, Map<Long, Integer> productQuantities) {
        logger.info("Creating order directly for userId= {}, productQuantities: {}", userId, productQuantities);

        String orderNumber = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Order order = new Order(userId, orderNumber);

        String inventoryServiceUrl = "http://localhost:8081";

        String productIds = productQuantities.keySet().stream()
                .map(String::valueOf)
                .collect(Collectors.joining(","));

        String url = inventoryServiceUrl + "/products?ids=" + productIds;

        try {
            logger.info("Fetching products for IDs: {}", productIds);
            ResponseEntity<List<ProductDTO>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new org.springframework.core.ParameterizedTypeReference<List<ProductDTO>>() {}
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {

                List<ProductDTO> products = response.getBody();
                logger.info("Fetched {} products from inventory service", products.size());

                Cart cart = cartService.getOrCreateCart(userId);
                List<CartItem> cartItems = cartService.getCartItems(cart.getId());
                logger.info("Found cart id={} with {} items for userId={}", cart.getId(), cartItems.size(), userId);
                for (CartItem ci : cartItems) {
                    logger.info("CartItem: productId={}, imageUrl='{}'", ci.getProductId(), ci.getImageUrl());
                }
                Map<Long, CartItem> cartItemMap = cartItems.stream()
                        .collect(Collectors.toMap(CartItem::getProductId, ci -> ci));

                BigDecimal totalAmount = BigDecimal.ZERO;

                for (ProductDTO product : products) {
                    // Try to get quantity, handling both Long and String keys in the map
                    Integer quantity = productQuantities.get(product.getId());
                    if (quantity == null) {
                        logger.warn("Product ID {} returned by inventory but not found in original request map or quantity is null", product.getId());
                        continue;
                    }

                    logger.info("Adding item to order: productId={}, quantity={}, name={}", 
                            product.getId(), quantity, product.getName());

                    CartItem cartItem = cartItemMap.get(product.getId());
                    String cartImageUrl = (cartItem != null) ? cartItem.getImageUrl() : null;
                    String productImageUrl = product.getImageUrl();
                    String imageUrl = (cartImageUrl != null) ? cartImageUrl : productImageUrl;
                    logger.info("OrderItem productId={}: cartImageUrl='{}', productImageUrl='{}', resolved='{}'",
                            product.getId(), cartImageUrl, productImageUrl, imageUrl);

                    OrderItem orderItem = new OrderItem(
                            product.getId(),
                            product.getName(),
                            quantity,
                            product.getPrice(),
                            imageUrl
                    );

                    if (order.getImageUrl() == null) {
                        order.setImageUrl(imageUrl);
                    }

                    order.addItem(orderItem);
                    totalAmount = totalAmount.add(orderItem.getSubtotal());
                }

                if (order.getItems().isEmpty()) {
                    logger.error("No items were added to the order! productQuantities: {}, products fetched: {}", 
                            productQuantities, products.stream().map(ProductDTO::getId).collect(Collectors.toList()));
                }

                order.setTotalAmount(totalAmount);

                order.setStatus("PENDING");

                logger.info("Saving order: {}", orderNumber);
                Order savedOrder = orderRepository.saveAndFlush(order);
                logger.info("Order saved successfully: {} with id: {}", savedOrder.getOrderNumber(), savedOrder.getId());

                return savedOrder;

            } else {
                throw new RuntimeException("Failed to fetch product details from inventory service");
            }

        } catch (Exception e) {
            logger.error("Error creating order directly: {}", e.getMessage());
            throw new RuntimeException("Failed to create order. " + e.getMessage());
        }
    }

    @Transactional
    public Order checkout(String userId) {
        logger.info("Starting checkout for user: {}", userId);

        Cart cart = cartService.getOrCreateCart(userId);
        List<CartItem> cartItems = cartService.getCartItems(cart.getId());

        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty. Cannot checkout.");
        }

        boolean allConfirmed = cartItems.stream()
                .allMatch(item -> "CONFIRMED".equals(item.getStatus()));

        if (!allConfirmed) {
            throw new RuntimeException("Some items are not confirmed.");
        }

        Map<Long, Integer> productQuantities = cartItems.stream()
                .collect(Collectors.toMap(
                        CartItem::getProductId,
                        CartItem::getQuantity
                ));

        OrderFulfillmentResult result;
        try {
            logger.info("Calling workflow for userId: {}", userId);
            result = workflowClient.startOrderFulfillment(userId, productQuantities);
            logger.info("Workflow completed. Success: {}, Message: {}, OrderNumber: {}",
                    result.isSuccess(), result.getMessage(), result.getOrderNumber());
        } catch (Exception e) {
            logger.error("Workflow call failed with exception: {}", e.getMessage(), e);
            throw new RuntimeException("Workflow execution failed: " + e.getMessage());
        }

        if (!result.isSuccess()) {
            logger.error("Workflow returned failure: {}", result.getMessage());
            throw new RuntimeException("Order fulfillment failed: " + result.getMessage());
        }

        if (result.getOrderNumber() == null || result.getOrderNumber().isEmpty()) {
            logger.error("Workflow succeeded but orderNumber is null or empty");
            throw new RuntimeException("Workflow succeeded but no order number returned");
        }

        // Fetch order using separate transaction to see committed changes
        Order order = null;
        int maxRetries = 10;
        for (int i = 0; i < maxRetries; i++) {
            try {
                order = orderQueryService.findByOrderNumberWithNewTransaction(result.getOrderNumber());
                if (order != null) {
                    logger.info("Order found on attempt {}: {}", i + 1, result.getOrderNumber());
                    break;
                }
                logger.warn("Order not found on attempt {}/{}: {}", i + 1, maxRetries, result.getOrderNumber());
            } catch (Exception e) {
                logger.error("Error fetching order on attempt {}: {}", i + 1, e.getMessage());
            }
            if (i < maxRetries - 1) {
                try {
                    Thread.sleep(500);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("Interrupted while waiting for order");
                }
            }
        }

        if (order == null) {
            logger.error("Order not found after {} retries: {}", maxRetries, result.getOrderNumber());
            throw new RuntimeException("Order not found after workflow success: " + result.getOrderNumber());
        }

        cartService.clearCart(cart.getUserId(), cart.getId());

        logger.info("Checkout completed successfully. Order: {}", result.getOrderNumber());

        return order;
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAllWithItems();
    }

    @Transactional
    public Order acceptOrder(String orderNumber, String adminEmail) {
        Order order = orderRepository.findByOrderNumberWithItems(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderNumber));
        order.setStatus("CONFIRMED");
        order.setApprovedBy(adminEmail);
        order.setUpdatedAt(LocalDateTime.now());
        return orderRepository.save(order);
    }

    @Transactional
    public Order rejectOrder(String orderNumber, String adminEmail) {
        Order order = orderRepository.findByOrderNumberWithItems(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderNumber));
        order.setStatus("REJECTED");
        order.setApprovedBy(adminEmail);
        order.setUpdatedAt(LocalDateTime.now());

        // Release stock back to inventory for each item
        String inventoryServiceUrl = "http://localhost:8081";
        for (OrderItem item : order.getItems()) {
            try {
                String url = inventoryServiceUrl + "/api/products/" + item.getProductId() + "/release";
                Map<String, Integer> requestBody = Map.of("quantity", item.getQuantity());
                HttpEntity<Map<String, Integer>> request = new HttpEntity<>(requestBody);
                restTemplate.exchange(url, HttpMethod.POST, request, Map.class);
                logger.info("Released {} stock for product {} (order {})", item.getQuantity(), item.getProductId(), orderNumber);
            } catch (Exception e) {
                logger.error("Failed to release stock for product {}: {}", item.getProductId(), e.getMessage());
            }
        }

        return orderRepository.save(order);
    }

    public Order getOrderByNumber(String orderNumber) {
        return orderRepository.findByOrderNumberWithItems(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderNumber));
    }

    public List<Order> getUserOrders(String userId) {
        return orderRepository.findByUserId(userId);
    }

    @Transactional
    public void deleteUserOrders(String userId) {
        List<Order> orders = orderRepository.findByUserId(userId);

        if (orders.isEmpty()) {
            throw new RuntimeException("No orders found for user: " + userId);
        }

        orderRepository.deleteAll(orders);
        logger.info("Deleted all orders for user: {}", userId);
    }

    @Transactional
    public void deleteOrderByNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderNumber));
        orderRepository.delete(order);
        logger.info("Deleted order: {}", orderNumber);
    }
}