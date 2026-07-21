package com.tripplanner.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.http.client.SimpleClientHttpRequestFactory;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;

@Slf4j
@Service
public class ImageService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    @Value("${pexels.api-key:}")
    private String pexelsApiKey;

    @Value("${google.places.api-key:}")
    private String googlePlacesApiKey;

    public ImageService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(3000);
        requestFactory.setReadTimeout(5000);

        this.restClient = RestClient.builder()
                .requestFactory(requestFactory)
                .build();
    }

    /**
     * Resolves a real photo of a specific, named place (e.g. a hotel) using the
     * Google Places API, so the image actually matches the business rather than
     * being a loosely-related stock photo. Returns null if no key is configured,
     * the place can't be found, or it has no photos — callers should fall back
     * to {@link #resolveCard(String)} in that case.
     */
    public String resolvePlacePhoto(String placeName, String locationContext, int maxWidth) {

        if (googlePlacesApiKey == null || googlePlacesApiKey.isBlank()) {
            return null;
        }
        if (placeName == null || placeName.isBlank()) {
            return null;
        }

        try {
            String query = locationContext == null || locationContext.isBlank()
                    ? placeName
                    : placeName + " " + locationContext;

            String findUrl =
                    "https://maps.googleapis.com/maps/api/place/findplacefromtext/json"
                            + "?input=%s&inputtype=textquery&fields=place_id,photos&key=%s"
                            .formatted(
                                    URLEncoder.encode(query, StandardCharsets.UTF_8),
                                    googlePlacesApiKey);

            String findResponse = restClient.get().uri(findUrl).retrieve().body(String.class);
            JsonNode findRoot = objectMapper.readTree(findResponse);
            JsonNode candidates = findRoot.path("candidates");

            if (!candidates.isArray() || candidates.isEmpty()) {
                log.info("Google Places: no candidates for '{}'", query);
                return null;
            }

            JsonNode photos = candidates.get(0).path("photos");
            if (!photos.isArray() || photos.isEmpty()) {
                log.info("Google Places: candidate for '{}' has no photos", query);
                return null;
            }

            String photoReference = photos.get(0).path("photo_reference").asText(null);
            if (photoReference == null || photoReference.isBlank()) {
                return null;
            }

            return "https://maps.googleapis.com/maps/api/place/photo?maxwidth=%d&photo_reference=%s&key=%s"
                    .formatted(maxWidth, photoReference, googlePlacesApiKey);

        } catch (Exception e) {
            log.error("Google Places lookup failed for '{}'", placeName, e);
            return null;
        }
    }

    /**
     * Fetches the actual JPEG bytes of a Google Places photo, given the
     * short-lived photo_reference returned by resolvePlacePhoto(). Used by
     * ImageProxyController so the frontend never sees the Google API key.
     */
    public byte[] fetchPlacePhotoBytes(String photoReference, int maxWidth) {

        if (googlePlacesApiKey == null || googlePlacesApiKey.isBlank()) {
            throw new IllegalStateException("Google Places API key is not configured");
        }
        if (photoReference == null || photoReference.isBlank()) {
            throw new IllegalArgumentException("photoReference must not be blank");
        }

        String photoUrl =
                "https://maps.googleapis.com/maps/api/place/photo?maxwidth=%d&photo_reference=%s&key=%s"
                        .formatted(
                                maxWidth,
                                URLEncoder.encode(photoReference, StandardCharsets.UTF_8),
                                googlePlacesApiKey);

        return restClient.get()
                .uri(photoUrl)
                .retrieve()
                .body(byte[].class);
    }

    public String resolve(String query, int width, int height) {

        String safeQuery = (query == null || query.isBlank())
                ? "travel"
                : cleanQuery(query);

        System.out.println("Searching Pexels: " + safeQuery);

        String image = searchPexels(safeQuery);

        System.out.println("Returned Image: " + image);

        if (image != null && !image.isBlank()) {
            return image;
        }

        return fallback(safeQuery, width, height);
    }

    public String resolveHero(String query) {
        return resolve(query, 1600, 700);
    }

    public String resolveCard(String query) {
        return resolve(query, 800, 600);
    }

    /**
     * Resolves an image for a hotel specifically. Unlike resolveCard(), this
     * does NOT strip the word "hotel" from the query, since that keyword is
     * what steers Pexels toward actual hotel/lodging photos instead of random
     * generic landscape shots that happen to match the place name.
     */
    public String resolveHotelCard(String query) {
        String safeQuery = (query == null || query.isBlank())
                ? "hotel exterior"
                : query.trim() + " hotel exterior";

        System.out.println("Searching Pexels (hotel): " + safeQuery);

        String image = searchPexels(safeQuery);

        System.out.println("Returned Image: " + image);

        if (image != null && !image.isBlank()) {
            return image;
        }

        return fallback(safeQuery, 800, 600);
    }

    private String searchPexels(String query) {

        if (pexelsApiKey == null || pexelsApiKey.isBlank()) {
            log.warn("Pexels API Key is missing.");
            return null;
        }

        try {

            String url =
                    "https://api.pexels.com/v1/search?query=%s&per_page=5"
                            .formatted(
                                    URLEncoder.encode(query, StandardCharsets.UTF_8));

            String response = restClient.get()
                    .uri(url)
                    .header("Authorization", pexelsApiKey)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(response);

            JsonNode photos = root.path("photos");

            if (photos.isArray() && photos.size() > 0) {

                int index = Math.abs(query.hashCode()) % photos.size();
                JsonNode first = photos.get(index);

                if (first.has("src")) {

                    JsonNode src = first.get("src");

                    if (src.has("large2x"))
                        return src.get("large2x").asText();

                    if (src.has("large"))
                        return src.get("large").asText();

                    if (src.has("medium"))
                        return src.get("medium").asText();
                }
            }

        } catch (Exception e) {
            log.error("Pexels Error for '{}'", query, e);
        }

        return null;
    }

    private String cleanQuery(String query) {

        return query
                .replace("&", " ")
                .replace(",", " ")
                .replace("Breakfast", "")
                .replace("Lunch", "")
                .replace("Dinner", "")
                .replace("Walk", "")
                .replace("Sunset", "")
                .replace("Tour", "")
                .replace("Shopping", "")
                .replace("Picnic", "")
                .replace("Activity", "")
                .replace("Restaurant", "")
                .replace("Cafe", "")
                .replace("Hotel", "")
                .replace("Visit", "")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private String fallback(String query, int width, int height) {
        String seed = shortHash(query);
        return "https://picsum.photos/seed/%s/%d/%d".formatted(seed, width, height);
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