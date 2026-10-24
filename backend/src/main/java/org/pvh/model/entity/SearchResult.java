package org.pvh.model.entity;

// one pair shown for a search, see frontend/src/lib/interleave.ts
public record SearchResult(Long id, Integer sku, String algorithm) {
}
