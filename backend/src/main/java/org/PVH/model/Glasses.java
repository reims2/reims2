package org.PVH.model;

import javax.persistence.*;
import javax.validation.constraints.Pattern;
import java.util.Date;

@Entity
@Table(name = "glasses")
public class Glasses extends BaseEntity {

    @Column(name = "SKU", unique = true)
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

    @OneToOne
    @JoinColumn(name = "dispense_id")
    private Dispense dispense;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "OS_ID")
    private Eye os;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "OD_ID")
    private Eye od;

    public boolean isDispensed() {
        return dispensed;
    }

    public void setDispensed(boolean dispensed) {
        this.dispensed = dispensed;
    }

    public Integer getSku() {
        return sku;
    }

    public void setSku(Integer SKU) {
        this.sku = SKU;
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
}
