package org.pvh.model.entity;

import java.util.Date;

import org.pvh.model.enums.AppearanceEnum;
import org.pvh.model.enums.BalLensEnum;
import org.pvh.model.enums.DispenseReasonEnum;
import org.pvh.model.enums.GlassesSizeEnum;
import org.pvh.model.enums.GlassesTypeEnum;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import jakarta.validation.constraints.Pattern;


@Entity
@Table(name = "unsuccessful_search")
public class UnsuccessfulSearch extends BaseEntity {

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

    @Override
    public String toString() {
        return "UnsuccessfulSearch [glassesType=" + glassesType + ", location=" + location + ", searchDate="
                + searchDate + ", balLens=" + balLens + ", increaseSearchTolerance=" + increaseSearchTolerance + ", os="
                + os + ", od=" + od + "]";
    }


}
