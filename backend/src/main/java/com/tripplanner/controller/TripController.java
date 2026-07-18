package com.tripplanner.controller;

import com.tripplanner.dto.TripDetailResponse;
import com.tripplanner.dto.TripRequest;
import com.tripplanner.dto.TripSummaryResponse;
import com.tripplanner.model.User;
import com.tripplanner.service.TripService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;

    @PostMapping("/generate")
    public ResponseEntity<TripDetailResponse> generate(@AuthenticationPrincipal User user,
                                                         @Valid @RequestBody TripRequest request) {
        return ResponseEntity.ok(tripService.generateAndSaveTrip(user, request));
    }

    @GetMapping
    public List<TripSummaryResponse> list(@AuthenticationPrincipal User user) {
        return tripService.listTrips(user);
    }

    @GetMapping("/{id}")
    public TripDetailResponse get(@AuthenticationPrincipal User user, @PathVariable Long id) {
        return tripService.getTrip(user, id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal User user, @PathVariable Long id) {
        tripService.deleteTrip(user, id);
        return ResponseEntity.noContent().build();
    }
}
