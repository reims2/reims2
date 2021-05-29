package org.PVH.model;

import javax.persistence.*;

@Entity
@Table(name = "glasses")
public class Glasses extends BaseEntity{

    @Column(name = "SKU")
    private Long sku;

    @Column(name = "glasses_type")
    private String glassesType;

    @Column(name = "glasses_size")
    private String glassesSize;

    @Column(name = "appearance")
    private String appearance;

    @Column(name = "location")
    private String location;

    @Column(name = "dispensed")
    private boolean dispensed;

    @OneToOne
    @JoinColumn(name = "dispense_id")
    private Dispense dispense;

    @ManyToOne(cascade=CascadeType.ALL)
    @JoinColumn(name = "OS_ID")
    private Eye os;

    @ManyToOne(cascade=CascadeType.ALL)
    @JoinColumn(name = "OD_ID")
    private Eye od;

    public boolean isDispensed() {
        return dispensed;
    }

    public void setDispensed(boolean dispensed) {
        this.dispensed = dispensed;
    }

    public Long getSku() {
        return sku;
    }

    public void setSku(Long SKU) {
        this.sku = SKU;
    }

    public String getGlassesType() {
        return glassesType;
    }

    public void setGlassesType(String type) {
        this.glassesType = type;
    }

    public String getGlassesSize() {
        return glassesSize;
    }

    public void setGlassesSize(String size) {
        this.glassesSize = size;
    }

    public String getAppearance() {
        return appearance;
    }

    public void setAppearance(String appearance) {
        this.appearance = appearance;
    }

    public Eye getOs() {
        return os;
    }

    public void setOs(Eye OS) {
        this.os = OS;
    }

    public Eye getOd() {
        return od;
    }

    public void setOd(Eye OD) {
        this.od = OD;
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
}
