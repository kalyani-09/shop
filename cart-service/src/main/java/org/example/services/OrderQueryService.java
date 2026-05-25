package org.example.services;

import org.example.entity.Order;
import org.example.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderQueryService {

    private static final Logger logger = LoggerFactory.getLogger(OrderQueryService.class);

    private final OrderRepository orderRepository;

    public OrderQueryService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Order findByOrderNumberWithNewTransaction(String orderNumber) {
        logger.info("Fetching order with items (REQUIRES_NEW): {}", orderNumber);

        Order order = orderRepository.findByOrderNumberWithItems(orderNumber)
                .orElse(null);

        return order;
    }
}
