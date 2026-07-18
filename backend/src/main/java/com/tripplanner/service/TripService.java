package com.tripplanner.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripplanner.dto.*;
import com.tripplanner.model.Trip;
import com.tripplanner.model.User;
import com.tripplanner.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TripService {

    private final GeminiService geminiService;
    private final ImageService imageService;
    private final TripRepository tripRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public TripDetailResponse generateAndSaveTrip(User user, TripRequest request) {
        GeneratedItinerary raw = geminiService.generateItinerary(request);

        List<HotelDto> hotels = raw.hotels().stream()
                .map(h -> h.withImageUrl(imageService.resolveCard(h.imageQuery() != null ? h.imageQuery() : h.name())))
                .collect(Collectors.toList());

        List<DayPlanDto> days = raw.days().stream()
                .map(d -> new DayPlanDto(
                        d.dayNumber(),
                        withImage(d.morning()),
                        withImage(d.afternoon()),
                        withImage(d.evening())
                ))
                .collect(Collectors.toList());

        String heroImageUrl = imageService.resolveHero(request.destination());

        GeneratedItinerary enriched = new GeneratedItinerary(hotels, days);
        String itineraryJson;
        try {
            itineraryJson = objectMapper.writeValueAsString(enriched);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to serialize itinerary", e);
        }

        Trip trip = Trip.builder()
                .user(user)
                .destination(request.destination())
                .days(request.days())
                .budget(request.budget())
                .travelWith(request.travelWith())
                .heroImageUrl(heroImageUrl)
                .itineraryJson(itineraryJson)
                .build();

        trip = tripRepository.save(trip);

        return toDetailResponse(trip, hotels, days);
    }

    public List<TripSummaryResponse> listTrips(User user) {
        return tripRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(TripSummaryResponse::from)
                .collect(Collectors.toList());
    }

    public TripDetailResponse getTrip(User user, Long tripId) {
        Trip trip = tripRepository.findByIdAndUser(tripId, user)
                .orElseThrow(() -> new NoSuchElementException("Trip not found"));

        try {
            GeneratedItinerary parsed = objectMapper.readValue(trip.getItineraryJson(), GeneratedItinerary.class);
            return toDetailResponse(trip, parsed.hotels(), parsed.days());
        } catch (Exception e) {
            throw new IllegalStateException("Stored itinerary is corrupted", e);
        }
    }

    public void deleteTrip(User user, Long tripId) {
        Trip trip = tripRepository.findByIdAndUser(tripId, user)
                .orElseThrow(() -> new NoSuchElementException("Trip not found"));
        tripRepository.delete(trip);
    }

    private ActivityDto withImage(ActivityDto activity) {
        if (activity == null) return null;
        return activity.withImageUrl(imageService.resolveCard(
                activity.imageQuery() != null ? activity.imageQuery() : activity.title()));
    }

    private TripDetailResponse toDetailResponse(Trip trip, List<HotelDto> hotels, List<DayPlanDto> days) {
        return new TripDetailResponse(
                trip.getId(),
                trip.getDestination(),
                trip.getDays(),
                trip.getBudget(),
                trip.getTravelWith(),
                trip.getHeroImageUrl(),
                hotels,
                days,
                trip.getCreatedAt()
        );
    }
}
