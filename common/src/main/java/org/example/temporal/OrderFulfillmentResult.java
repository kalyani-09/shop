package org.example.temporal;

import lombok.Builder;
import lombok.Getter;
import lombok.extern.jackson.Jacksonized;

@Getter
@Builder
@Jacksonized
public class OrderFulfillmentResult {

    private String orderNumber;
    private boolean success;
    private String message;
}
