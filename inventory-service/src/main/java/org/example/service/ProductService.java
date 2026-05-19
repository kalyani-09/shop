package org.example.service;

import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import org.example.entity.Product;

import org.example.event.ProductCreatedEvent;
import org.example.event.ProductDeletedEvent;
import org.example.event.StockUpdatedEvent;
import org.example.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    private static final Logger logger = LoggerFactory.getLogger(ProductService.class);

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private EntityManager entityManager;

    private final KafkaProducerService kafkaProducerService;

    public ProductService(ProductRepository productRepository,
            KafkaProducerService kafkaProducerService) {
        this.productRepository = productRepository;
        this.kafkaProducerService = kafkaProducerService;

    }

    // get all products
    public List<Product> getAllproducts() {
        return productRepository.findAll();
    }

    public List<Product> getProductsByIds(List<Long> ids) {
        return productRepository.findAllById(ids);
    }

    // Get product by Id
    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    // Search products by name or description
    public List<Product> searchProducts(String query) {
        return productRepository.searchQuery(query);
    }

    // Create new product and send kafka message
    @Transactional
    public Product createProduct(Product product) {
        logger.info("Creating new product: {}", product.getName());

        // Save to database
        Product savedProduct = productRepository.save(product);

        // Send kafka message
        ProductCreatedEvent event = new ProductCreatedEvent(
                savedProduct.getId(),
                savedProduct.getName(),
                savedProduct.getStockQuantity());
        kafkaProducerService.sendProductCreatedEvent(event);

        return savedProduct;
    }

    @Transactional
    public Optional<Product> updateStock(Long id, Integer quantity) {

        Optional<Product> optionalProduct = productRepository.findById(id);

        if (optionalProduct.isPresent()) {
            Product product = optionalProduct.get();

            // update stock
            product.setStockQuantity(quantity);

            // save updated product
            Product updatedProduct = productRepository.save(product);
            entityManager.flush();

            // Send stock updated event
            kafkaProducerService.sendStockUpdatedEvent(new StockUpdatedEvent(id, quantity));

            return Optional.of(updatedProduct);
        }

        return Optional.empty();
    }

    @Transactional
    public Optional<Product> reserveStock(Long id, Integer quantity) {
        Optional<Product> optionalProduct = productRepository.findById(id);

        if (optionalProduct.isPresent()) {
            Product product = optionalProduct.get();
            if (product.getStockQuantity() >= quantity) {
                product.setStockQuantity(product.getStockQuantity() - quantity);
                Product updatedProduct = productRepository.save(product);
                entityManager.flush();
                logger.info("Reserved {} stock for product {}", quantity, id);
                return Optional.of(updatedProduct);
            }
            logger.warn("Insufficient stock for product {}", id);
        }

        return Optional.empty();
    }

    @Transactional
    public Optional<Product> releaseStock(Long id, Integer quantity) {
        Optional<Product> optionalProduct = productRepository.findById(id);

        if (optionalProduct.isPresent()) {
            Product product = optionalProduct.get();
            product.setStockQuantity(product.getStockQuantity() + quantity);
            Product updatedProduct = productRepository.save(product);
            entityManager.flush();
            logger.info("Released {} stock for product {}", quantity, id);
            return Optional.of(updatedProduct);
        }

        return Optional.empty();
    }

    @Transactional
    public Optional<Product> updateProduct(Long id, Product productDetails) {
        return productRepository.findById(id).map(product -> {
            product.setName(productDetails.getName());
            product.setDescription(productDetails.getDescription());
            product.setPrice(productDetails.getPrice());
            product.setStockQuantity(productDetails.getStockQuantity());
            product.setImageUrl(productDetails.getImageUrl());
            product.setCategory(productDetails.getCategory());

            Product updated = productRepository.save(product);
            entityManager.flush();

            // Optionally send an event if needed
            logger.info("Updated product with id {}", id);
            return updated;
        });
    }

    @Transactional
    public boolean deleteProduct(Long id) {
        Optional<Product> optionalProduct = productRepository.findById(id);

        if (optionalProduct.isPresent()) {
            Product product = optionalProduct.get();

            productRepository.delete(product);
            entityManager.flush();

            logger.info("Deleted product with id {}", id);

            kafkaProducerService.sendProductDeletedEvent(new ProductDeletedEvent(id, product.getName()));

            return true;
        }
        logger.warn("Product not found with id {}", id);
        return false;
    }

}
