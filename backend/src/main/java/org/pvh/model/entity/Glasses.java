package org.pvh.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Pattern;
import org.pvh.model.enums.AppearanceEnum;
import org.pvh.model.enums.GlassesSizeEnum;
import org.pvh.model.enums.GlassesTypeEnum;

import java.util.Date;

@Entity
@Table(name = "glasses")
public class Glasses extends BaseEntity {

    @Column(name = "SKU")
    private Integer sku;

    @Column(name = "glasses_type")
    private String glassesType;

    @Column(name = "glasses_size")
    private String glassesSize;

    @Column(name = "appearance")
    private String appearance;

    @Column(name = "location")
    @Pattern(regexp = "sm|sa")
    private String location;

    @Column(name = "dispensed")
    private boolean dispensed;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "creation_date")
    private Date creationDate;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinColumn(name = "dispense_id")
    private Dispense dispense;

    @ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinColumn(name = "OS_ID")
    private Eye os;

    @ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinColumn(name = "OD_ID")
    private Eye od;

    public Glasses() {
    }

    public Glasses(String glassesType, String glassesSize, String appearance, String location, Dispense dispense, Eye os, Eye od) {
        this.glassesType = glassesType;
        this.glassesSize = glassesSize;
        this.appearance = appearance;
        this.location = location;
        this.creationDate = new Date();
        this.dispense = dispense;
        this.os = os;
        this.od = od;
    }

    public Glasses(Integer sku, String glassesType, String glassesSize, String appearance, String location, boolean dispensed,
                   Date creationDate, Dispense dispense, Eye os, Eye od) {
        this.sku = sku;
        this.glassesType = glassesType;
        this.glassesSize = glassesSize;
        this.appearance = appearance;
        this.location = location;
        this.dispensed = dispensed;
        this.creationDate = creationDate;
        this.dispense = dispense;
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

    public Date getCreationDate() {
        return creationDate;
    }

    public void setCreationDate(Date creationDate) {
        this.creationDate = creationDate;
    }

    public GlassesSizeEnum getGlassesSize() {
        return Enum.valueOf(GlassesSizeEnum.class, glassesSize);
    }

    public void setGlassesSize(GlassesSizeEnum glassesSize) {
        this.glassesSize = glassesSize.name();
    }

    public AppearanceEnum getAppearance() {
        return Enum.valueOf(AppearanceEnum.class, appearance);
    }

    public void setAppearance(AppearanceEnum appearance) {
        this.appearance = appearance.name();
    }

    public GlassesTypeEnum getGlassesType() {
        return Enum.valueOf(GlassesTypeEnum.class, glassesType);
    }

    public void setGlassesType(GlassesTypeEnum glassesType) {
        this.glassesType = glassesType.name();
    }

    @Override
    public String toString() {
        return "Glasses [sku=" + sku + ", glassesType=" + glassesType + ", glassesSize=" + glassesSize + ", appearance="
            + appearance + ", location=" + location + ", dispensed=" + dispensed + ", creationDate=" + creationDate.toString()
            + ", dispense=" + dispense.toString() + ", os=" + os.toString() + ", od=" + od.toString() + "]";
    }

}
