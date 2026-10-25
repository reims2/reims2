package org.pvh.model.entity;

import io.swagger.v3.oas.annotations.media.Schema;

// one pair shown for a search, see frontend/src/lib/interleave.ts
public record SearchResult(Long id, @Schema(nullable = true) Integer sku, String algorithm) {
}
