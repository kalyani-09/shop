package org.example.repository;

import org.example.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    //Find specific item by cart and product
    List<CartItem> findByCartIdAndProductId(Long cartId, Long productId);

    //Delete all items in a cart
    void deleteByCartId(Long cartId);

    //find ALL items in a cart
    List<CartItem> findByCartId(Long cartId);

    @Modifying
    @Transactional
    @Query("UPDATE CartItem c SET c.stockQuantity = :stockQuantity WHERE c.productId = :productId")
    void updateStockQuantityByProductId(@Param("productId") Long productId, @Param("stockQuantity") Integer stockQuantity);

}
