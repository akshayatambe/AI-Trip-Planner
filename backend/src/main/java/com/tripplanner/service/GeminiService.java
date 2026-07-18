package com.tripplanner.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripplanner.dto.GeneratedItinerary;
import com.tripplanner.dto.TripRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Slf4j
@Service
public class GeminiService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api-key}")
    private String apiKey;

    @Value("${gemini.model}")
    private String model;

    @Value("${gemini.base-url}")
    private String baseUrl;

    public GeminiService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder().build();
    }

    public GeneratedItinerary generateItinerary(TripRequest request) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException(
                    "GEMINI_API_KEY is not configured on the server. Set it as an environment variable and restart the backend.");
        }

        String prompt = buildPrompt(request);

        Map<String, Object> body = Map.of(
                "contents", new Object[]{
                        Map.of("parts", new Object[]{Map.of("text", prompt)})
                },
                "generationConfig", Map.of(
                        "temperature", 0.9,
                        "responseMimeType", "application/json"
                )
        );

        String url = "%s/%s:generateContent?key=%s".formatted(baseUrl, model, apiKey);

        String rawResponse;
        try {
            rawResponse = restClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(String.class);
        } catch (Exception e) {
            log.error("Gemini API call failed", e);
            throw new IllegalStateException("Failed to reach the Gemini API: " + e.getMessage(), e);
        }

        String jsonText = extractText(rawResponse);

        try {
            return objectMapper.readValue(jsonText, GeneratedItinerary.class);
        } catch (Exception e) {
            log.error("Failed to parse Gemini response as GeneratedItinerary. Raw text: {}", jsonText, e);
            throw new IllegalStateException("Gemini returned a response that couldn't be parsed. Please try again.", e);
        }
    }

    private String extractText(String rawResponse) {
        try {
            JsonNode root = objectMapper.readTree(rawResponse);
            JsonNode textNode = root.path("candidates").path(0)
                    .path("content").path("parts").path(0).path("text");
            if (textNode.isMissingNode() || textNode.isNull()) {
                throw new IllegalStateException("Gemini response did not contain any text. Raw: " + rawResponse);
            }
            return textNode.asText();
        } catch (IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalStateException("Unexpected Gemini response shape: " + rawResponse, e);
        }
    }

    private String buildPrompt(TripRequest request) {
        return """
                You are an expert travel agent. Build a %d-day trip itinerary for %s.

                Trip details:
                - Budget level: %s (CHEAP = hostels/street food, MODERATE = 3-4 star and mid-range restaurants, LUXURY = 5 star hotels and fine dining)
                - Traveling as: %s

                Respond with ONLY raw JSON (no markdown fences, no commentary) matching EXACTLY this schema:

                {
                  "hotels": [
                    {
                      "name": "string",
                      "address": "string, full street address",
                      "pricePerNight": "string like '$250/night'",
                      "rating": 4.5,
                      "imageQuery": "short string describing the hotel for an image search, e.g. 'The Ritz-Carlton exterior Chicago'"
                    }
                  ],
                  "days": [
                    {
                      "dayNumber": 1,
                      "morning": {
                        "startTime": "10:00 AM",
                        "endTime": "12:00 PM",
                        "title": "string, name of place or activity",
                        "description": "1-2 sentence description",
                        "ticketInfo": "string like 'Free' or '$25 per person'",
                        "imageQuery": "short string for an image search"
                      },
                      "afternoon": { same shape as morning },
                      "evening": { same shape as morning, usually dinner }
                    }
                  ]
                }

                Rules:
                - Provide exactly 4 hotel recommendations appropriate to the budget level.
                - Provide exactly %d day objects, dayNumber 1 through %d, with real, well-known, geographically accurate places/restaurants for %s.
                - Vary the activities across days, don't repeat the same place twice.
                - Keep descriptions concise and concrete.
                - Output must be valid JSON and nothing else.
                """.formatted(
                request.days(), request.destination(),
                request.budget(), request.travelWith(),
                request.days(), request.days(), request.destination()
        );
    }
}
