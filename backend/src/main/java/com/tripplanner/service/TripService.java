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

        String resolvedDestination = raw.resolvedDestination() != null && !raw.resolvedDestination().isBlank()
                ? raw.resolvedDestination()
                : request.destination();

        List<HotelDto> hotels = raw.hotels().stream()
                .map(h -> h.withImageUrl(resolveHotelImage(h, resolvedDestination)))
                .collect(Collectors.toList());

        List<DayPlanDto> days = raw.days().stream()
                .map(d -> new DayPlanDto(
                        d.dayNumber(),
                        withImage(d.morning()),
                        withImage(d.afternoon()),
                        withImage(d.evening())
                ))
                .collect(Collectors.toList());

        String heroImageUrl = imageService.resolveHero(resolvedDestination);

        GeneratedItinerary enriched = new GeneratedItinerary(resolvedDestination, hotels, days);
        String itineraryJson;
        try {
            itineraryJson = objectMapper.writeValueAsString(enriched);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to serialize itinerary", e);
        }

        Trip trip = Trip.builder()
                .user(user)
                .destination(resolvedDestination)
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

    private String resolveHotelImage(HotelDto hotel, String destination) {
        // Google Places lookup disabled for now (requires billing setup) —
        // go straight to Pexels/stock imagery, biased toward actual hotel photos.
        return imageService.resolveHotelCard(hotel.imageQuery() != null ? hotel.imageQuery() : hotel.name());
    }

    private ActivityDto withImage(ActivityDto activity) {
        if (activity == null) return null;
        return activity.withImageUrl(imageService.resolveCard(
                activity.imageQuery() != null ? activity.imageQuery() : activity.title()));
    }

    private BudgetSummary calculateBudgetSummary(Trip trip, List<HotelDto> hotels, List<DayPlanDto> days) {
        double activitiesCost = days.stream()
                .flatMap(d -> java.util.stream.Stream.of(d.morning(), d.afternoon(), d.evening()))
                .filter(a -> a != null)
                .mapToDouble(a -> PriceParser.parse(a.ticketInfo()))
                .sum();

        double cheapestHotelPerNight = hotels.stream()
                .mapToDouble(h -> PriceParser.parse(h.pricePerNight()))
                .filter(p -> p > 0)
                .min()
                .orElse(0.0);

        int nights = Math.max(trip.getDays() - 1, 1);
        double hotelTotal = cheapestHotelPerNight * nights;
        double grandTotal = activitiesCost + hotelTotal;

        String note = "Estimate only, based on the cheapest listed hotel for " + nights
                + " night(s) plus all listed activity costs. Actual prices vary.";

        return new BudgetSummary(activitiesCost, cheapestHotelPerNight, hotelTotal, grandTotal, note);
    }

    private TripDetailResponse toDetailResponse(Trip trip, List<HotelDto> hotels, List<DayPlanDto> days) {
        BudgetSummary summary = calculateBudgetSummary(trip, hotels, days);

        return new TripDetailResponse(
                trip.getId(),
                trip.getDestination(),
                trip.getDays(),
                trip.getBudget(),
                trip.getTravelWith(),
                trip.getHeroImageUrl(),
                hotels,
                days,
                summary,
                trip.getCreatedAt()
        );
    }
}