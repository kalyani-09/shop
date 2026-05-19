package org.example.service;

import org.example.entity.Product;
import org.example.event.StockCheckResponse;
import org.example.dto.StockCheckRequest;
import org.example.event.StockUpdateEvent;
import org.example.event.StockUpdateRequest;
import org.example.event.StockUpdatedEvent;
import org.example.repository.ProductRepository;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import java.util.Optional;
import org.slf4j.Logger;


@Service
public class StockCheckService {

    private static final Logger logger = LoggerFactory.getLogger(StockCheckService.class);
    private final ProductRepository productRepository;
    private final KafkaTemplate<String, StockCheckResponse> kafkaTemplate;
    private final KafkaProducerService kafkaProducerService;
    @Autowired
    private EntityManager entityManager;

    public StockCheckService(ProductRepository productRepository, 
                             KafkaTemplate<String, StockCheckResponse> kafkaTemplate,
                             KafkaProducerService kafkaProducerService){
        this.productRepository= productRepository;
        this.kafkaTemplate= kafkaTemplate;
        this.kafkaProducerService = kafkaProducerService;
    }

    @Transactional
    @KafkaListener(
            topics= "stock.check-request",
            containerFactory = "stockRequestListenerFactory"
    )
    public void handleStockCheckRequest(StockCheckRequest request) {
        logger.info("Received stock check request: productId={}, quantity={}, cartId={}",
                request.getProductId(), request.getRequestedQuantity(), request.getCartId());

        Optional<Product> productOpt = productRepository.findById(request.getProductId());

        StockCheckResponse response;
        if(productOpt.isEmpty()){

            response = new StockCheckResponse(
                    request.getCartId(),
                    request.getProductId(),
                    false,
                    0,
                    request.getCartItemId(),

                    "Product not found"

            );
        }
        else{
            Product product = productOpt.get();
            if(product.getStockQuantity() >= request.getRequestedQuantity()){

                response= new StockCheckResponse(
                        request.getCartId(),
                        request.getProductId(),
                        true,
                        product.getStockQuantity(),
                        request.getCartItemId(),

                        "Stock available"
                );



        }else{
                //Insufficient stock
                response = new StockCheckResponse(
                        request.getCartId(),
                        request.getProductId(),
                        false,
                        product.getStockQuantity(),
                        request.getCartItemId(),
                        "Insufficient stock. Available "+ product.getStockQuantity()+
                        ", Requested: " + request.getRequestedQuantity()
                );
            }

            }
        //Send response back to Cart
        kafkaTemplate.send("stock.check-response",
                request.getCartItemId().toString(), response);

        logger.info("Sent stock check response : isAvailable={}", response.getIsAvailable());
    }

    //Check stock synchronously
    public boolean checkStock(Long productId, Integer quantity){
        Optional<Product> product= productRepository.findById(productId);
        return product.isPresent() && product.get().getStockQuantity() >= quantity;
    }

    //Reserve stock(decrement)
    public boolean reserveStock(Long productId, Integer quantity){
        Optional<Product> productOpt = productRepository.findById(productId);


        if(productOpt.isPresent()){
            Product product = productOpt.get();
            if(product.getStockQuantity() >= quantity){
                product.setStockQuantity(product.getStockQuantity()-quantity);
                productRepository.save(product);
                entityManager.flush();
                logger.info("Reserved stock : productId ={} , quantity={}", productId, quantity);
                kafkaProducerService.sendStockUpdatedEvent(new StockUpdatedEvent(productId, product.getStockQuantity()));
                return true ;
            }
        }
        return false;
    }

    //Release stock
    public void releaseStock(Long productId, Integer quantity){
        Optional<Product> productOpt= productRepository.findById(productId);

        if(productOpt.isPresent()){
            Product product= productOpt.get();
            product.setStockQuantity(product.getStockQuantity() + quantity);
            productRepository.save(product);
            entityManager.flush();
            logger.info("Released stock: productid={}, quantity= {}", productId, quantity);
            kafkaProducerService.sendStockUpdatedEvent(new StockUpdatedEvent(productId, product.getStockQuantity()));
        }
    }

    @Transactional
    @KafkaListener(
            topics = "stock.update-request",
            containerFactory = "stockUpdateRequestListenerFactory"
    )
    public void handleStockUpdateRequest(StockUpdateRequest request){
        logger.info("Received stock update request: productId={}, quantity={}, operation={}, cartId={}",
                request.getProductId(), request.getQuantity(), request.getOperation(), request.getCartId());

        Optional<Product> productOpt = productRepository.findById(request.getProductId());

        StockCheckResponse response;
        if(productOpt.isEmpty()){
            response = new StockCheckResponse(
                    request.getCartId(),
                    request.getProductId(),
                    false,
                    0,
                    request.getCartItemId(),
                    "Product not found"
            );
        } else {
            Product product = productOpt.get();
            String operation = request.getOperation();

            if("RESERVE".equals(operation)){
                if(product.getStockQuantity() >= request.getQuantity()){
                    product.setStockQuantity(product.getStockQuantity() - request.getQuantity());
                    productRepository.save(product);
                    entityManager.flush();
                    logger.info("Stock reserved: productId={}, quantity={}, remaining={}",
                            request.getProductId(), request.getQuantity(), product.getStockQuantity());
                    kafkaProducerService.sendStockUpdatedEvent(new StockUpdatedEvent(
                            request.getProductId(), product.getStockQuantity()));
                    response = new StockCheckResponse(
                            request.getCartId(),
                            request.getProductId(),
                            true,
                            product.getStockQuantity(),
                            request.getCartItemId(),
                            "Stock reserved successfully"
                    );
                } else {
                    response = new StockCheckResponse(
                            request.getCartId(),
                            request.getProductId(),
                            false,
                            product.getStockQuantity(),
                            request.getCartItemId(),
                            "Insufficient stock"
                    );
                }
            } else if("RELEASE".equals(operation)){
                product.setStockQuantity(product.getStockQuantity() + request.getQuantity());
                productRepository.save(product);
                entityManager.flush();
                logger.info("Stock released: productId={}, quantity={}, remaining={}",
                        request.getProductId(), request.getQuantity(), product.getStockQuantity());
                kafkaProducerService.sendStockUpdatedEvent(new StockUpdatedEvent(
                        request.getProductId(), product.getStockQuantity()));
                response = new StockCheckResponse(
                        request.getCartId(),
                        request.getProductId(),
                        true,
                        product.getStockQuantity(),
                        request.getCartItemId(),
                        "Stock released successfully"
                );
            } else {
                response = new StockCheckResponse(
                        request.getCartId(),
                        request.getProductId(),
                        false,
                        product.getStockQuantity(),
                        request.getCartItemId(),
                        "Unknown operation: " + operation
                );
            }
        }

        kafkaTemplate.send("stock.update-response",
                request.getCartItemId().toString(), response);

        logger.info("Sent stock update response: success={}", response.getIsAvailable());
    }

    @Transactional
    @KafkaListener(
            topics = "cart.stock-updated",
            containerFactory = "stockUpdateListenerFactory"
    )
    public void handleCartStockUpdateEvent(StockUpdateEvent event){
        logger.info("Received cart stock update event: productId={}, newStockQuantity={}, operation={}",
                event.getProductId(), event.getNewStockQuantity(), event.getOperation());

        Optional<Product> productOpt = productRepository.findById(event.getProductId());

        if(productOpt.isPresent()){
            Product product = productOpt.get();
            String operation = event.getOperation();

            if("RESERVE".equals(operation)){
                // Cart reserved stock - update inventory to new lower value
                product.setStockQuantity(event.getNewStockQuantity());
                productRepository.save(product);
                entityManager.flush();
                logger.info("Inventory stock updated from cart event: productId={}, newQuantity={}",
                        event.getProductId(), event.getNewStockQuantity());
            } else if("RELEASE".equals(operation)){
                // Cart released stock - add back to inventory
                product.setStockQuantity(product.getStockQuantity() + event.getNewStockQuantity());
                productRepository.save(product);
                entityManager.flush();
                logger.info("Inventory stock released from cart event: productId={}, addedQuantity={}",
                        event.getProductId(), event.getNewStockQuantity());
            } else if("CLEAR".equals(operation)){
                // Clear - add all reserved stock back
                product.setStockQuantity(product.getStockQuantity() + event.getNewStockQuantity());
                productRepository.save(product);
                entityManager.flush();
                logger.info("Inventory stock cleared from cart event: productId={}, restoredQuantity={}",
                        event.getProductId(), event.getNewStockQuantity());
            }
        } else {
            logger.warn("Product not found for stock update event: productId={}", event.getProductId());
        }
    }

}
