package com.tripplanner.controller;

import com.tripplanner.service.ImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.concurrent.TimeUnit;

/**
 * Streams Google Places photos through our own backend so the frontend (and
 * anyone inspecting the page's HTML) never sees the Google API key. The
 * photo_reference itself is short-lived and safe to expose.
 */
@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
public class ImageProxyController {

    private final ImageService imageService;

    @GetMapping("/photo")
    public ResponseEntity<byte[]> photo(
            @RequestParam String ref,
            @RequestParam(defaultValue = "800") int w) {

        byte[] bytes = imageService.fetchPlacePhotoBytes(ref, w);

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .cacheControl(CacheControl.maxAge(7, TimeUnit.DAYS).cachePublic())
                .body(bytes);
    }
}
