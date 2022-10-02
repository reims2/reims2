package org.pvh.model.dto;

import javax.validation.constraints.Pattern;
import java.io.Serializable;
import java.util.Date;
import java.util.Objects;

/**
 * A DTO for the {@link org.pvh.model.entity.Glasses} entity
 */
public class GlassesResponseDTO implements Serializable {
    private Integer sku;
    private String glassesType;
    private String glassesSize;
    private String appearance;
    @Pattern(regexp = "sm|sa")
    private String location;
    private boolean dispensed;
    private Date creationDate;
    private DispenseResponseDto dispense;
    private EyeDTO os;
    private EyeDTO od;

    public GlassesResponseDTO() {
    }

    public GlassesResponseDTO(Integer sku, String glassesType, String glassesSize, String appearance, String location, boolean dispensed, Date creationDate, DispenseResponseDto dispense, EyeDTO os, EyeDTO od) {
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

    public Integer getSku() {
        return sku;
    }

    public void setSku(Integer sku) {
        this.sku = sku;
    }

    public String getGlassesType() {
        return glassesType;
    }

    public void setGlassesType(String glassesType) {
        this.glassesType = glassesType;
    }

    public String getGlassesSize() {
        return glassesSize;
    }

    public void setGlassesSize(String glassesSize) {
        this.glassesSize = glassesSize;
    }

    public String getAppearance() {
        return appearance;
    }

    public void setAppearance(String appearance) {
        this.appearance = appearance;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public boolean getDispensed() {
        return dispensed;
    }

    public void setDispensed(boolean dispensed) {
        this.dispensed = dispensed;
    }

    public Date getCreationDate() {
        return creationDate;
    }

    public void setCreationDate(Date creationDate) {
        this.creationDate = creationDate;
    }

    public DispenseResponseDto getDispense() {
        return dispense;
    }

    public void setDispense(DispenseResponseDto dispense) {
        this.dispense = dispense;
    }

    public EyeDTO getOs() {
        return os;
    }

    public void setOs(EyeDTO os) {
        this.os = os;
    }

    public EyeDTO getOd() {
        return od;
    }

    public void setOd(EyeDTO od) {
        this.od = od;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        GlassesResponseDTO entity = (GlassesResponseDTO) o;
        return Objects.equals(this.sku, entity.sku) &&
            Objects.equals(this.glassesType, entity.glassesType) &&
            Objects.equals(this.glassesSize, entity.glassesSize) &&
            Objects.equals(this.appearance, entity.appearance) &&
            Objects.equals(this.location, entity.location) &&
            Objects.equals(this.dispensed, entity.dispensed) &&
            Objects.equals(this.creationDate, entity.creationDate) &&
            Objects.equals(this.dispense, entity.dispense) &&
            Objects.equals(this.os, entity.os) &&
            Objects.equals(this.od, entity.od);
    }

    @Override
    public int hashCode() {
        return Objects.hash(sku, glassesType, glassesSize, appearance, location, dispensed, creationDate, dispense, os, od);
    }

    @Override
    public String toString() {
        return getClass().getSimpleName() + "(" +
            "sku = " + sku + ", " +
            "glassesType = " + glassesType + ", " +
            "glassesSize = " + glassesSize + ", " +
            "appearance = " + appearance + ", " +
            "location = " + location + ", " +
            "dispensed = " + dispensed + ", " +
            "creationDate = " + creationDate + ", " +
            "dispense = " + dispense + ", " +
            "os = " + os + ", " +
            "od = " + od + ")";
    }

    /**
     * A DTO for the {@link org.pvh.model.entity.Dispense} entity
     */
    public static class DispenseResponseDto implements Serializable {
        private Date modifyDate;
        private Integer previousSku;

        public DispenseResponseDto() {
        }

        public DispenseResponseDto(Date modifyDate, Integer previousSku) {
            this.modifyDate = modifyDate;
            this.previousSku = previousSku;
        }

        public Date getModifyDate() {
            return modifyDate;
        }

        public void setModifyDate(Date modifyDate) {
            this.modifyDate = modifyDate;
        }

        public Integer getPreviousSku() {
            return previousSku;
        }

        public void setPreviousSku(Integer previousSku) {
            this.previousSku = previousSku;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            DispenseResponseDto entity = (DispenseResponseDto) o;
            return Objects.equals(this.modifyDate, entity.modifyDate) &&
                Objects.equals(this.previousSku, entity.previousSku);
        }

        @Override
        public int hashCode() {
            return Objects.hash(modifyDate, previousSku);
        }

        @Override
        public String toString() {
            return getClass().getSimpleName() + "(" +
                "modifyDate = " + modifyDate + ", " +
                "previousSku = " + previousSku + ")";
        }
    }
}
