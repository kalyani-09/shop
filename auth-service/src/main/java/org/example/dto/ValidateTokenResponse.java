package org.example.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ValidateTokenResponse {
    private String email;
    private String role;
    private boolean valid;
}
