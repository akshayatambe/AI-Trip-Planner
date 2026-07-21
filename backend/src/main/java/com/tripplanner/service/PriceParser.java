package com.tripplanner.service;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class PriceParser {

    private static final Pattern NUMBER_PATTERN = Pattern.compile("[₹$]?\\s?(\\d+(?:[.,]\\d+)?)");
    private PriceParser() {
    }

    /**
     * Extracts a representative dollar amount from free-text pricing strings.
     * Handles single values ("$250/night"), ranges ("$10-$15 per person"),
     * and returns 0 for non-numeric text like "Free" or "Included".
     */
    public static double parse(String text) {
        if (text == null || text.isBlank()) {
            return 0.0;
        }

        Matcher matcher = NUMBER_PATTERN.matcher(text);
        double sum = 0.0;
        int count = 0;

        while (matcher.find()) {
            String raw = matcher.group(1).replace(",", "");
            try {
                sum += Double.parseDouble(raw);
                count++;
            } catch (NumberFormatException ignored) {
                // skip anything that doesn't parse cleanly
            }
        }

        return count == 0 ? 0.0 : sum / count;
    }
}