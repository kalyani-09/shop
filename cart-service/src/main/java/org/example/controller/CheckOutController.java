package org.example.controller;

import org.example.entity.Order;
import org.example.services.CheckOutService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RequestMapping("/cart")
@RestController
public class CheckOutController {

    private final CheckOutService checkOutService;
    private final org.example.services.NotificationService notificationService;

    public CheckOutController(CheckOutService checkOutService, org.example.services.NotificationService notificationService) {
        this.checkOutService = checkOutService;
        this.notificationService = notificationService;
    }

    @PostMapping("/checkout")
    public ResponseEntity<Map<String, Object>> checkout() {
        String userId = getCurrentUserId();
        try {
            Order order = checkOutService.checkout(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Checkout completed successfully");
            response.put("order", order);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());

            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/orders")
    public ResponseEntity<Map<String, Object>> deleteUserOrders() {
        String effectiveUserId = getCurrentUserId();
        try {
            checkOutService.deleteUserOrders(effectiveUserId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Orders deleted successfully for user: " + effectiveUserId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/orders/{orderNumber}")
    public ResponseEntity<Map<String, Object>> deleteOrder(@PathVariable String orderNumber) {
        try {
            checkOutService.deleteOrderByNumber(orderNumber);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Order deleted successfully: " + orderNumber);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/internal/order")
    public ResponseEntity<Map<String, Object>> createOrderInternal(@RequestParam String userId,
            @RequestBody Map<Long, Integer> productQuantities) {
        try {
            Order order = checkOutService.createOrderDirectly(userId, productQuantities);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("orderNumber", order.getOrderNumber());
            response.put("order", order);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/admin/orders")
    public ResponseEntity<Map<String, Object>> getAdminOrders() {
        List<Order> orders = checkOutService.getAllOrders();
        Map<String, Object> response = new HashMap<>();
        response.put("orders", orders);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/admin/orders/{orderNumber}/accept")
    public ResponseEntity<Map<String, Object>> acceptOrder(@PathVariable String orderNumber) {
        String adminEmail = getCurrentUserId();
        Order order = checkOutService.acceptOrder(orderNumber, adminEmail);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Order accepted successfully");
        response.put("order", order);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/admin/orders/{orderNumber}/reject")
    public ResponseEntity<Map<String, Object>> rejectOrder(@PathVariable String orderNumber) {
        String adminEmail = getCurrentUserId();
        Order order = checkOutService.rejectOrder(orderNumber, adminEmail);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Order rejected successfully");
        response.put("order", order);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/orders")
    public ResponseEntity<Map<String, Object>> getUserOrders() {
        String userId = getCurrentUserId();
        List<Order> orders = checkOutService.getUserOrders(userId);
        Map<String, Object> response = new HashMap<>();
        response.put("orders", orders);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/orders/{orderNumber}")
    public ResponseEntity<Map<String, Object>> getOrderByNumber(@PathVariable String orderNumber) {
        Order order = checkOutService.getOrderByNumber(orderNumber);
        Map<String, Object> response = new HashMap<>();
        response.put("order", order);
        return ResponseEntity.ok(response);
    }

    @GetMapping(value = "/admin/orders/notifications", produces = org.springframework.http.MediaType.TEXT_EVENT_STREAM_VALUE)
    public org.springframework.web.servlet.mvc.method.annotation.SseEmitter getNotifications() {
        return notificationService.registerAdmin();
    }

    private String getCurrentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

}
