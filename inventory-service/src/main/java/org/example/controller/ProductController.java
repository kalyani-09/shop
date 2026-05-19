package org.example.controller;

import org.example.entity.Product;
import org.example.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping ("/products")

public class ProductController {

    @Autowired
    private ProductService productService;

    public ProductController(ProductService productService){
        this.productService= productService;
    }

    @GetMapping
    public List<Product> getAllProducts(@RequestParam(required = false) List<Long> ids){
        if (ids != null && !ids.isEmpty()) {
            return productService.getProductsByIds(ids);
        }
        return productService.getAllproducts();
    }

    @GetMapping ("/{id}")
    public ResponseEntity<Product> getProductByid(@PathVariable Long id){
        return productService.getProductById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public List<Product> searchProducts(@RequestParam String q){
        return productService.searchProducts(q);
    }

    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product,
            @RequestHeader(name = "X-User-Email", required = false) String adminEmail){
        if (adminEmail != null && !adminEmail.isEmpty()) {
            product.setCreatedBy(adminEmail);
        }
        Product created = productService.createProduct(product);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product product){
        return productService.updateProduct(id, product)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    @PutMapping("/{id}/stock")
    public ResponseEntity<Product> updateStock(@PathVariable Long id, @RequestParam Integer quantity){
        return productService.updateStock(id, quantity)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());

    }

    @GetMapping("/api/products/{id}/stock")
    public ResponseEntity<Map<String, Object>> getStock(@PathVariable Long id) {
        return productService.getProductById(id)
                .map(product -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("productId", product.getId());
                    response.put("stockQuantity", product.getStockQuantity());
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/api/products/{id}/reserve")
    public ResponseEntity<Map<String, Object>> reserveStock(@PathVariable Long id, @RequestBody Map<String, Integer> request) {
        Integer quantity = request.get("quantity");
        return productService.reserveStock(id, quantity)
                .map(product -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("productId", product.getId());
                    response.put("reservedQuantity", quantity);
                    response.put("success", true);
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.badRequest().body(Map.of("success", false, "message", "Product not found or insufficient stock")));
    }

    @PostMapping("/api/products/{id}/release")
    public ResponseEntity<Map<String, Object>> releaseStock(@PathVariable Long id, @RequestBody Map<String, Integer> request) {
        Integer quantity = request.get("quantity");
        return productService.releaseStock(id, quantity)
                .map(product -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("productId", product.getId());
                    response.put("releasedQuantity", quantity);
                    response.put("success", true);
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.badRequest().body(Map.of("success", false, "message", "Product not found")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable Long id){
        boolean isDeleted = productService.deleteProduct(id);

        if(isDeleted){
            return ResponseEntity.ok("Product deleted successfully");
        }else{
            return ResponseEntity.status(404).body("Product not found");
        }
    }

}
