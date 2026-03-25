package com.skill.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class TokenBlacklistServiceTest {

    private TokenBlacklistService tokenBlacklistService;

    @BeforeEach
    void setUp() {
        tokenBlacklistService = new TokenBlacklistService();
    }

    @Test
    void blacklistToken_shouldAddToken_whenValid() {
        String token = "valid-token";
        tokenBlacklistService.blacklistToken(token);
        assertThat(tokenBlacklistService.isTokenBlacklisted(token)).isTrue();
    }

    @Test
    void blacklistToken_shouldNotAddToken_whenNullOrEmpty() {
        tokenBlacklistService.blacklistToken(null);
        tokenBlacklistService.blacklistToken("");
        assertThat(tokenBlacklistService.getBlacklistedTokensCount()).isEqualTo(0);
    }

    @Test
    void isTokenBlacklisted_shouldReturnFalse_whenNotPresent() {
        assertThat(tokenBlacklistService.isTokenBlacklisted("unknown")).isFalse();
    }

    @Test
    void isTokenBlacklisted_shouldReturnFalse_whenTokenIsNull() {
        assertThat(tokenBlacklistService.isTokenBlacklisted(null)).isFalse();
    }

    @Test
    void cleanupExpiredTokens_shouldRun() {
        // Method currently has no implementation but we call it for coverage
        tokenBlacklistService.cleanupExpiredTokens();
    }

    @Test
    void getBlacklistedTokensCount_shouldReturnCorrectCount() {
        tokenBlacklistService.blacklistToken("t1");
        tokenBlacklistService.blacklistToken("t2");
        assertThat(tokenBlacklistService.getBlacklistedTokensCount()).isEqualTo(2);
    }
}
