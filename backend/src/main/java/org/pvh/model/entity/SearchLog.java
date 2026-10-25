package org.pvh.model.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.pvh.model.enums.BalLensEnum;
import org.pvh.model.enums.GlassesTypeEnum;
import org.pvh.model.enums.LocationEnum;

import java.time.Instant;
import java.util.List;


@Entity
@Table(name = "search_log")
public class SearchLog extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "glasses_type")
    private GlassesTypeEnum glassesType;

    @Enumerated(EnumType.STRING)
    @Column(name = "location")
    private LocationEnum location;

    @Column(name = "search_date")
    private Instant searchDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "balLens")
    private BalLensEnum balLens;

    @Column(name = "increase_search_tolerance")
    private Boolean increaseSearchTolerance;

    @Column(name = "result_count")
    private int resultCount;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "results")
    private List<SearchResult> results;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "OS_ID")
    private Eye os;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "OD_ID")
    private Eye od;


    public BalLensEnum getBalLens() {
        return balLens;
    }

    public void setBalLens(BalLensEnum balLens) {
        this.balLens = balLens;
    }

    public Eye getOs() {
        return os;
    }

    public void setOs(Eye os) {
        this.os = os;
    }

    public Eye getOd() {
        return od;
    }

    public void setOd(Eye od) {
        this.od = od;
    }

    public LocationEnum getLocation() {
        return location;
    }

    public void setLocation(LocationEnum location) {
        this.location = location;
    }

    public GlassesTypeEnum getGlassesType() {
        return glassesType;
    }

    public void setGlassesType(GlassesTypeEnum glassesType) {
        this.glassesType = glassesType;
    }

    public Instant getSearchDate() {
        return searchDate;
    }

    public void setSearchDate(Instant searchDate) {
        this.searchDate = searchDate;
    }

    public Boolean getIncreaseSearchTolerance() {
        return increaseSearchTolerance;
    }

    public void setIncreaseSearchTolerance(Boolean increaseSearchTolerance) {
        this.increaseSearchTolerance = increaseSearchTolerance;
    }

    public int getResultCount() {
        return resultCount;
    }

    public void setResultCount(int resultCount) {
        this.resultCount = resultCount;
    }

    public List<SearchResult> getResults() {
        return results;
    }

    public void setResults(List<SearchResult> results) {
        this.results = results;
    }

    @Override
    public String toString() {
        return "SearchLog [glassesType=" + glassesType + ", location=" + location + ", searchDate="
            + searchDate + ", balLens=" + balLens + ", increaseSearchTolerance=" + increaseSearchTolerance
            + ", resultCount=" + resultCount + ", results=" + results + ", os=" + os + ", od=" + od + "]";
    }


}
