package org.friendsofasaprosa.model;

import javax.persistence.*;
import java.util.*;

@Entity
@Table(name = "glasses")
public class Glasses extends BaseEntity{

    @Column(name = "SKU")
    private String SKU;

    @Column(name = "glasses_type")
    private String glassesType;

    @Column(name = "glasses_size")
    private String glassesSize;

    @Column(name = "appearance")
    private String appearance;

    @Column(name = "material")
    private String material;

    @Column(name = "dispensed")
    private boolean dispensed;

    @ManyToOne(cascade=CascadeType.ALL)
    @JoinColumn(name = "OS_ID")
    private Eye OS;

    @ManyToOne(cascade=CascadeType.ALL)
    @JoinColumn(name = "OD_ID")
    private Eye OD;



    public String getSKU() {
        return SKU;
    }

    public void setSKU(String SKU) {
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

    public String getMaterial() {
        return material;
    }

    public void setMaterial(String material) {
        this.material = material;
    }

    public boolean isDispensed() {
        return dispensed;
    }

    public void setDispensed(boolean dispensed) {
        this.dispensed = dispensed;
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

}
