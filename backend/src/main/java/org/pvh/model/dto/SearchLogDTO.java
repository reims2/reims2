package org.pvh.model.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.pvh.model.entity.SearchLog;
import org.pvh.model.entity.SearchResult;
import org.pvh.model.enums.BalLensEnum;
import org.pvh.model.enums.GlassesTypeEnum;
import org.pvh.model.enums.LocationEnum;

import java.time.Instant;
import java.util.List;

public record SearchLogDTO(
    @NotNull GlassesTypeEnum glassesType,
    @NotNull BalLensEnum balLens,
    Boolean increaseSearchTolerance,
    // clients send epoch millis, Jackson would read a plain number as seconds
    @NotNull @JsonFormat(without = JsonFormat.Feature.READ_DATE_TIMESTAMPS_AS_NANOSECONDS) @Schema(implementation = Long.class) Instant searchDate,
    @NotNull @Min(0) Integer resultCount,
    // no validation, Workbox drops a replayed log that gets a 4xx
    List<SearchResult> results,
    @NotNull @Valid EyeDTO os,
    @NotNull @Valid EyeDTO od) {

    public SearchLog toSearchLog(LocationEnum location) {
        SearchLog searchLog = new SearchLog();
        searchLog.setOs(os.toEye());
        searchLog.setOd(od.toEye());
        searchLog.setLocation(location);
        searchLog.setGlassesType(glassesType);
        searchLog.setBalLens(balLens);
        searchLog.setIncreaseSearchTolerance(increaseSearchTolerance);
        searchLog.setSearchDate(searchDate);
        searchLog.setResultCount(resultCount);
        searchLog.setResults(results);
        return searchLog;
    }
}
