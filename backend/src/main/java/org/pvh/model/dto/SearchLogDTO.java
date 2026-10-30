package org.pvh.model.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.pvh.model.entity.SearchLog;
import org.pvh.model.enums.BalLensEnum;
import org.pvh.model.enums.GlassesTypeEnum;

import java.time.Instant;

public record SearchLogDTO(
    @NotNull GlassesTypeEnum glassesType,
    @NotNull BalLensEnum balLens,
    Boolean increaseSearchTolerance,
    // clients send epoch millis, Jackson would read a plain number as seconds
    @NotNull @JsonFormat(without = JsonFormat.Feature.READ_DATE_TIMESTAMPS_AS_NANOSECONDS) Instant searchDate,
    @NotNull @Min(0) Integer resultCount,
    @NotNull @Valid EyeDTO os,
    @NotNull @Valid EyeDTO od) {

    public SearchLog toSearchLog(String location) {
        SearchLog searchLog = new SearchLog();
        searchLog.setOs(os.toEye());
        searchLog.setOd(od.toEye());
        searchLog.setLocation(location);
        searchLog.setGlassesType(glassesType);
        searchLog.setBalLens(balLens);
        searchLog.setIncreaseSearchTolerance(increaseSearchTolerance);
        searchLog.setSearchDate(searchDate);
        searchLog.setResultCount(resultCount);
        return searchLog;
    }
}
