package org.PVH.model;

import org.springframework.lang.Nullable;

import javax.persistence.*;

@Entity
@Table(name = "glasses")
public class Glasses extends BaseEntity{

    @Column(name = "SKU")
    private long SKU;

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
    @Nullable
    private Dispense dispense;

    @ManyToOne(cascade=CascadeType.ALL)
    @JoinColumn(name = "OS_ID")
    private Eye OS;

    @ManyToOne(cascade=CascadeType.ALL)
    @JoinColumn(name = "OD_ID")
    private Eye OD;

    public boolean isDispensed() {
        return dispensed;
    }

    public void setDispensed(boolean dispensed) {
        this.dispensed = dispensed;
    }

    public long getSKU() {
        return SKU;
    }

    public void setSKU(long SKU) {
        this.SKU = SKU;
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

    public Eye getOS() {
        return OS;
    }

    public void setOS(Eye OS) {
        this.OS = OS;
    }

    public Eye getOD() {
        return OD;
    }

    public void setOD(Eye OD) {
        this.OD = OD;
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
