package com.tripplanner.service;

import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;

/**
 * Turns a short text query (e.g. "Burj Al Arab hotel Dubai") into an image URL.
 * <p>
 * Ships with a deterministic, key-free placeholder (picsum.photos, seeded off the
 * query so the same place always gets the same photo). Swap the body of
 * {@link #resolve(String, int, int)} for a call to the Google Places Photos API or
 * Unsplash API once you have credentials for a production-quality result.
 */
@Service
public class ImageService {

    public String resolve(String query, int width, int height) {
        String seed = shortHash(query == null || query.isBlank() ? "travel" : query);
        return "https://picsum.photos/seed/%s/%d/%d".formatted(seed, width, height);
    }

    public String resolveHero(String query) {
        return resolve(query, 1600, 700);
    }

    public String resolveCard(String query) {
        return resolve(query, 800, 600);
    }

    private String shortHash(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("MD5");
            byte[] hash = digest.digest(input.trim().toLowerCase().getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash).substring(0, 12);
        } catch (Exception e) {
            return String.valueOf(Math.abs(input.hashCode()));
        }
    }
}
