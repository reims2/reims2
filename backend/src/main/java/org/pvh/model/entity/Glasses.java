package org.pvh.model.entity;

import jakarta.persistence.*;
import org.pvh.model.enums.AppearanceEnum;
import org.pvh.model.enums.DispenseReasonEnum;
import org.pvh.model.enums.GlassesSizeEnum;
import org.pvh.model.enums.GlassesTypeEnum;
import org.pvh.model.enums.LocationEnum;

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

    @Enumerated(EnumType.STRING)
    @Column(name = "location")
    private LocationEnum location;

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

    protected Glasses() {
    }

    public Glasses(GlassesTypeEnum glassesType, GlassesSizeEnum glassesSize, AppearanceEnum appearance, LocationEnum location, Eye os,
                   Eye od) {
        this.glassesType = glassesType;
        this.glassesSize = glassesSize;
        this.appearance = appearance;
        this.location = location;
        this.os = os;
        this.od = od;
        this.dispense = new Dispense();
    }

    public void dispense(DispenseReasonEnum reason, Instant at) {
        dispense.setPreviousSku(sku);
        dispense.setModifyDate(at);
        dispense.setDispenseReason(reason);
        dispensed = true;
        sku = null;
    }

    public void undispense(Instant at) {
        sku = dispense.getPreviousSku();
        dispensed = false;
        dispense.setModifyDate(at);
        dispense.setPreviousSku(null);
        dispense.setDispenseReason(null);
    }

    public boolean isDispensed() {
        return dispensed;
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

    public Eye getOd() {
        return od;
    }

    public LocationEnum getLocation() {
        return location;
    }

    public Dispense getDispense() {
        return dispense;
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

}
