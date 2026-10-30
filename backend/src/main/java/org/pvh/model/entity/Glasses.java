package org.pvh.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Pattern;
import org.pvh.model.enums.AppearanceEnum;
import org.pvh.model.enums.GlassesSizeEnum;
import org.pvh.model.enums.GlassesTypeEnum;

import java.time.Instant;

@Entity
@Table(name = "glasses")
public class Glasses extends BaseEntity {

    @Column(name = "SKU")
    private Integer sku;

    @Enumerated(EnumType.STRING)
    @Column(name = "glasses_type")
    private GlassesTypeEnum glassesType;

    @Enumerated(EnumType.STRING)
    @Column(name = "glasses_size")
    private GlassesSizeEnum glassesSize;

    @Enumerated(EnumType.STRING)
    @Column(name = "appearance")
    private AppearanceEnum appearance;

    @Column(name = "location")
    @Pattern(regexp = "sm|sa")
    private String location;

    @Column(name = "dispensed")
    private boolean dispensed;

    @Column(name = "creation_date")
    private Instant creationDate;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinColumn(name = "dispense_id")
    private Dispense dispense;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinColumn(name = "OS_ID")
    private Eye os;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinColumn(name = "OD_ID")
    private Eye od;

    public Glasses() {
    }

    public Glasses(GlassesTypeEnum glassesType, GlassesSizeEnum glassesSize, AppearanceEnum appearance, String location, Eye os,
                   Eye od) {
        this.glassesType = glassesType;
        this.glassesSize = glassesSize;
        this.appearance = appearance;
        this.location = location;
        this.os = os;
        this.od = od;
    }

    public boolean isDispensed() {
        return dispensed;
    }

    public void setDispensed(boolean dispensed) {
        this.dispensed = dispensed;
    }

    public Integer getSku() {
        return sku;
    }

    public void setSku(Integer sku) {
        this.sku = sku;
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

    public Dispense getDispense() {
        return dispense;
    }

    public void setDispense(Dispense dispense) {
        this.dispense = dispense;
    }

    public Instant getCreationDate() {
        return creationDate;
    }

    public void setCreationDate(Instant creationDate) {
        this.creationDate = creationDate;
    }

    public GlassesSizeEnum getGlassesSize() {
        return glassesSize;
    }

    public void setGlassesSize(GlassesSizeEnum glassesSize) {
        this.glassesSize = glassesSize;
    }

    public AppearanceEnum getAppearance() {
        return appearance;
    }

    public void setAppearance(AppearanceEnum appearance) {
        this.appearance = appearance;
    }

    public GlassesTypeEnum getGlassesType() {
        return glassesType;
    }

    public void setGlassesType(GlassesTypeEnum glassesType) {
        this.glassesType = glassesType;
    }

    @Override
    public String toString() {
        return "Glasses [sku=" + sku + ", glassesType=" + glassesType + ", glassesSize=" + glassesSize + ", appearance="
            + appearance + ", location=" + location + ", dispensed=" + dispensed + ", creationDate=" + creationDate
            + ", dispense=" + dispense + ", os=" + os + ", od=" + od + "]";
    }

}
