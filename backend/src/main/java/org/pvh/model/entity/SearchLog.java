package org.pvh.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Pattern;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.pvh.model.enums.BalLensEnum;
import org.pvh.model.enums.GlassesTypeEnum;

import java.util.Date;
import java.util.List;


@Entity
@Table(name = "search_log")
public class SearchLog extends BaseEntity {

    @Column(name = "glasses_type")
    private String glassesType;

    @Column(name = "location")
    @Pattern(regexp = "sm|sa")
    private String location;


    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "search_date")
    private Date searchDate;

    @Column(name = "balLens")
    private String balLens;

    @Column(name = "increase_search_tolerance")
    private Boolean increaseSearchTolerance;

    @Column(name = "result_count")
    private int resultCount;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "results")
    private List<SearchResult> results;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "OS_ID")
    private Eye os;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "OD_ID")
    private Eye od;


    public BalLensEnum getBalLens() {
        return balLens != null ? Enum.valueOf(BalLensEnum.class, balLens) : null;
    }

    public void setBalLens(BalLensEnum balLens) {
        this.balLens = balLens != null ? balLens.name() : null;
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

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public GlassesTypeEnum getGlassesType() {
        return Enum.valueOf(GlassesTypeEnum.class, glassesType);
    }

    public void setGlassesType(GlassesTypeEnum glassesType) {
        this.glassesType = glassesType.name();
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
