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
        You are an expert travel planner.

        Create a realistic %d-day itinerary for %s.

        DESTINATION RULE:
        If the destination given is a country, region, or otherwise too broad
        for a single trip (e.g. "USA", "Europe", "India"), choose ONE well-known,
        real city within it that best fits a typical tourist visit, and use
        that specific city for the entire itinerary. Set "resolvedDestination"
        to that specific city and country (e.g. "New York, USA"). If the
        destination given is already a specific city, set "resolvedDestination"
        to that same city (formatted as "City, Country").

        Trip Details:
        - Budget: %s
        - Traveling with: %s

        Return ONLY valid JSON.
        Do NOT use markdown.
        Do NOT include explanations.

        JSON Schema:

        {
          "resolvedDestination": "string",
          "hotels": [
            {
              "name": "string",
              "address": "string",
              "pricePerNight": "₹xxxx/night",
              "rating": 4.5,
              "imageQuery": "Hotel Name Destination"
            }
          ],
          "days": [
            {
              "dayNumber": 1,
              "morning": {
                "startTime": "09:00 AM",
                "endTime": "12:00 PM",
                "title": "string",
                "description": "string",
                "ticketInfo": "₹200",
                "imageQuery": "Landmark Destination"
              },
              "afternoon": {
                "startTime": "12:30 PM",
                "endTime": "03:30 PM",
                "title": "string",
                "description": "string",
                "ticketInfo": "₹500",
                "imageQuery": "Landmark Destination"
              },
              "evening": {
                "startTime": "05:00 PM",
                "endTime": "09:00 PM",
                "title": "string",
                "description": "string",
                "ticketInfo": "₹700",
                "imageQuery": "Landmark Destination"
              }
            }
          ]
        }

        RULES

        1. Recommend EXACTLY 4 hotels.

        2. Generate EXACTLY %d days.

        3. Use only REAL hotels, restaurants and tourist attractions.

        4. Prices must be realistic in Indian Rupees.

        5. Do not repeat attractions.

        6. Keep descriptions short.

        ==========================
        IMAGE QUERY RULES
        ==========================

        imageQuery is ONLY used for searching photos.

        The destination is: %s

        For EVERY attraction:

        imageQuery = Main Attraction Name + Destination

        Examples:

        Eiffel Tower Paris

        Statue of Liberty New York

        Hawa Mahal Jaipur

        Gateway of India Mumbai

        Marina Beach Chennai

        Charminar Hyderabad

        Baga Beach Goa

        Mysore Palace Mysore

        Do NOT include words like:

        Breakfast
        Lunch
        Dinner
        Walk
        Sunset
        Tour
        Shopping
        Picnic
        Cafe
        Restaurant
        Hotel
        Museum Visit
        View Point
        Activity
        Entry Ticket

        For hotels:

        imageQuery = Hotel Name + Destination

        IMPORTANT:

        imageQuery should contain ONLY the place name and destination.

        Do NOT include '&'.

        Do NOT include commas.

        Do NOT include itinerary text.

        Do NOT include activity names.

        Output ONLY valid JSON.
        """.formatted(
                request.days(),
                request.destination(),
                request.budget(),
                request.travelWith(),
                request.days(),
                request.destination()
        );
    }
}