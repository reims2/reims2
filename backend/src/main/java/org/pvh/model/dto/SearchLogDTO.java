package org.pvh.model.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.pvh.model.entity.SearchResult;
import org.pvh.model.enums.BalLensEnum;
import org.pvh.model.enums.GlassesTypeEnum;
import org.pvh.model.validator.IEnumValidator;

import java.util.Date;
import java.util.List;

public class SearchLogDTO {
    @IEnumValidator(enumClass = GlassesTypeEnum.class)
    private String glassesType;
    private String balLens;
    private Boolean increaseSearchTolerance;
    private Date searchDate;
    @NotNull
    @Min(0)
    private Integer resultCount;
    // no validation, Workbox drops a replayed log that gets a 4xx
    private List<SearchResult> results;

    private EyeDTO os;
    private EyeDTO od;


    public SearchLogDTO(@IEnumValidator(enumClass = GlassesTypeEnum.class) String glassesType,
                        @IEnumValidator(enumClass = BalLensEnum.class) String balLens,
                        Boolean increaseSearchTolerance, Date searchDate, Integer resultCount, List<SearchResult> results,
                        EyeDTO os, EyeDTO od) {
        this.glassesType = glassesType;
        this.increaseSearchTolerance = increaseSearchTolerance;
        this.balLens = balLens;
        this.searchDate = searchDate;
        this.resultCount = resultCount;
        this.results = results;
        this.os = os;
        this.od = od;
    }

    public String getGlassesType() {
        return glassesType;
    }

    public void setGlassesType(String glassesType) {
        this.glassesType = glassesType;
    }

    public Date getSearchDate() {
        return searchDate;
    }

    public void setSearchDate(Date searchDate) {
        this.searchDate = searchDate;
    }

    public Integer getResultCount() {
        return resultCount;
    }

    public void setResultCount(Integer resultCount) {
        this.resultCount = resultCount;
    }

    public List<SearchResult> getResults() {
        return results;
    }

    public void setResults(List<SearchResult> results) {
        this.results = results;
    }

    public EyeDTO getOs() {
        return os;
    }

    public void setOs(EyeDTO os) {
        this.os = os;
    }

    public EyeDTO getOd() {
        return od;
    }

    public void setOd(EyeDTO od) {
        this.od = od;
    }

    public String getBalLens() {
        return balLens;
    }

    public void setBalLens(String balLens) {
        this.balLens = balLens;
    }

    public Boolean getIncreaseSearchTolerance() {
        return increaseSearchTolerance;
    }

    public void setIncreaseSearchTolerance(Boolean increaseSearchTolerance) {
        this.increaseSearchTolerance = increaseSearchTolerance;
    }


}
