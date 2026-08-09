package com.resumeiq.service;

import com.resumeiq.dto.AuthDtos.*;
import com.resumeiq.exception.ApiException;
import com.resumeiq.model.User;
import com.resumeiq.repository.UserRepository;
import com.resumeiq.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.email().toLowerCase())) {
            throw ApiException.conflict("An account with this email already exists");
        }

        User user = new User();
        user.setName(req.name().trim());
        user.setEmail(req.email().toLowerCase().trim());
        user.setPassword(passwordEncoder.encode(req.password()));
        user.setAvatarInitials(initials(req.name()));

        user = userRepository.save(user);
        String token = jwtUtil.generateToken(user.getId());

        return new AuthResponse(toUserResponse(user), token);
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.email().toLowerCase().trim())
                .orElseThrow(() -> ApiException.unauthorized("Invalid email or password"));

        if (!passwordEncoder.matches(req.password(), user.getPassword())) {
            throw ApiException.unauthorized("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getId());
        return new AuthResponse(toUserResponse(user), token);
    }

    @Transactional
    public UserResponse updateProfile(User user, UpdateProfileRequest req) {
        if (req.name() != null && !req.name().isBlank()) {
            user.setName(req.name().trim());
            user.setAvatarInitials(initials(req.name()));
        }
        if (req.headline() != null) {
            user.setHeadline(req.headline());
        }
        userRepository.save(user);
        return toUserResponse(user);
    }

    public UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.getHeadline(),
                user.getAvatarInitials(),
                user.getCreatedAt()
        );
    }

    private String initials(String name) {
        return Arrays.stream(name.trim().split("\\s+"))
                .limit(2)
                .map(part -> part.isEmpty() ? "" : String.valueOf(Character.toUpperCase(part.charAt(0))))
                .collect(Collectors.joining());
    }
}
