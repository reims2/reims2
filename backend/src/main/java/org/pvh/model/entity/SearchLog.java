package org.pvh.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Pattern;
import org.pvh.model.enums.BalLensEnum;
import org.pvh.model.enums.GlassesTypeEnum;

import java.time.Instant;


@Entity
@Table(name = "search_log")
public class SearchLog extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "glasses_type")
    private GlassesTypeEnum glassesType;

    @Column(name = "location")
    @Pattern(regexp = "sm|sa")
    private String location;

    @Column(name = "search_date")
    private Instant searchDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "balLens")
    private BalLensEnum balLens;

    @Column(name = "increase_search_tolerance")
    private Boolean increaseSearchTolerance;

    @Column(name = "result_count")
    private int resultCount;

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

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
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

    @Override
    public String toString() {
        return "SearchLog [glassesType=" + glassesType + ", location=" + location + ", searchDate="
            + searchDate + ", balLens=" + balLens + ", increaseSearchTolerance=" + increaseSearchTolerance
            + ", resultCount=" + resultCount + ", os=" + os + ", od=" + od + "]";
    }


}
