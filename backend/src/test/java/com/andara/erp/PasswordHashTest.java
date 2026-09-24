package com.andara.erp;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertTrue;

class PasswordHashTest {

    @Test
    void testAndGenerateBcryptHashes() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String opHash = encoder.encode("operator123");
        String adminHash = encoder.encode("admin123");

        System.out.println("=== BCRYPT HASHES ===");
        System.out.println("operator123: " + opHash);
        System.out.println("admin123: " + adminHash);

        assertTrue(encoder.matches("operator123", opHash));
        assertTrue(encoder.matches("admin123", adminHash));
    }
}
