package org.example.temporal;

import io.temporal.activity.ActivityInterface;
import io.temporal.activity.ActivityMethod;

import java.util.Map;


@ActivityInterface
public interface StockActivity {

    @ActivityMethod(name = "checkStock")
    StockCheckResult checkStock(Long productId, Integer qunatity);

    @ActivityMethod(name = "reserveStock")
    boolean reserveStock(Long productId, Integer qunatity);

    @ActivityMethod(name = "releasestock")
    void releaseStock(Long productId, Integer quantity);

    @ActivityMethod(name = "checkStockForItems")
    Map<Long,StockCheckResult> checkStockForItems(Map<Long , Integer> productQuantities);

    @ActivityMethod(name = "reserveAllStock")
    boolean reserveAllStock(Map<Long, Integer> productQuantities);

    @ActivityMethod(name = "releaseStockForItems")
    void releaseStockForItems(Map<Long, Integer> productQuantities);
}
