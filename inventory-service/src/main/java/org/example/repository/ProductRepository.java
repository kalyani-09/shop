package org.example.repository;

import org.example.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    //Search by name or description
    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%',:query, '%'))")
    List<Product> searchQuery(@Param("query") String query);


    //Find by category
    List<Product> findByCategory(String category);

    //Find products with low stock
    List<Product> findByStockQuantityLessThan(Integer threshold);
}
