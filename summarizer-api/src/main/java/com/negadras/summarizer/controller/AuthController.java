package com.negadras.summarizer.controller;

import com.negadras.summarizer.dto.AuthRequest;
import com.negadras.summarizer.dto.AuthResponse;
import com.negadras.summarizer.dto.RegisterRequest;
import com.negadras.summarizer.service.AuthService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        try {
            logger.info("Login attempt for username: {}", request.username());
            AuthResponse response = authService.authenticate(request);
            logger.info("Login successful for username: {}", request.username());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Login failed for username: {} - {}", request.username(), e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}
