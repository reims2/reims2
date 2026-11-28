package org.pvh.model.dto;

import org.pvh.model.entity.SearchLog;
import org.pvh.model.enums.BalLensEnum;
import org.pvh.model.enums.GlassesTypeEnum;

import java.time.Instant;

public record SearchLogResponseDTO(GlassesTypeEnum glassesType, BalLensEnum balLens, boolean increaseSearchTolerance,
                                   Instant searchDate, int resultCount, EyeDTO os, EyeDTO od) {

    public static SearchLogResponseDTO from(SearchLog search) {
        return new SearchLogResponseDTO(search.getGlassesType(), search.getBalLens(),
            Boolean.TRUE.equals(search.getIncreaseSearchTolerance()), search.getSearchDate(), search.getResultCount(),
            EyeDTO.from(search.getOs()), EyeDTO.from(search.getOd()));
    }
}
