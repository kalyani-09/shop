package org.example.service;

import lombok.RequiredArgsConstructor;
import org.example.dto.*;
import org.example.entity.BlacklistedToken;
import org.example.entity.Role;
import org.example.entity.User;
import org.example.repository.BlacklistedTokenRepository;
import org.example.repository.UserRepository;
import org.example.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final BlacklistedTokenRepository blacklistedTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .build();

        userRepository.save(user);

        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    public ValidateTokenResponse validateToken(ValidateTokenRequest request) {
        if (!jwtService.validateToken(request.getToken())) {
            return ValidateTokenResponse.builder().valid(false).build();
        }

        if (blacklistedTokenRepository.existsByToken(request.getToken())) {
            return ValidateTokenResponse.builder().valid(false).build();
        }

        String email = jwtService.extractEmail(request.getToken());
        String role = jwtService.extractRole(request.getToken());

        return ValidateTokenResponse.builder()
                .valid(true)
                .email(email)
                .role(role)
                .build();
    }

    @Transactional
    @Scheduled(cron = "0 0 2 * * ?")
    public void cleanExpiredTokens() {
        blacklistedTokenRepository.deleteByExpiresAtBefore(LocalDateTime.now());
    }

    public void logout(LogoutRequest request) {
        if (!jwtService.validateToken(request.getToken())) {
            throw new RuntimeException("Invalid token");
        }

        if (blacklistedTokenRepository.existsByToken(request.getToken())) {
            return;
        }

        Date expiration = jwtService.extractExpiration(request.getToken());
        LocalDateTime expiresAt = Instant.ofEpochMilli(expiration.getTime())
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime();

        BlacklistedToken blacklistedToken = BlacklistedToken.builder()
                .token(request.getToken())
                .expiresAt(expiresAt)
                .build();

        blacklistedTokenRepository.save(blacklistedToken);
    }
}
