package com.tripplanner.repository;

import com.tripplanner.model.Trip;
import com.tripplanner.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TripRepository extends JpaRepository<Trip, Long> {
    List<Trip> findByUserOrderByCreatedAtDesc(User user);
    Optional<Trip> findByIdAndUser(Long id, User user);
}
