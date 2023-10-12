package org.pvh.model.dto;


import org.pvh.model.enums.AppearanceEnum;
import org.pvh.model.enums.GlassesSizeEnum;
import org.pvh.model.enums.GlassesTypeEnum;
// import org.pvh.model.validator.IEnumValidator;
import org.pvh.model.validator.IEnumValidator;

import jakarta.validation.constraints.Pattern;

import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the {@link org.pvh.model.entity.Glasses} entity
 */
public class GlassesRequestDTO implements Serializable {
    @IEnumValidator(enumClass = GlassesTypeEnum.class)
    private String glassesType;
    @IEnumValidator(enumClass = GlassesSizeEnum.class)
    private String glassesSize;
    @IEnumValidator(enumClass = AppearanceEnum.class)
    private String appearance;
    @Pattern(regexp = "sm|sa")
    private String location;
    private EyeDTO os;
    private EyeDTO od;

    public GlassesRequestDTO() {}

    public GlassesRequestDTO(String glassesType, String glassesSize, String appearance, String location, EyeDTO os, EyeDTO od) {
        this.glassesType = glassesType;
        this.glassesSize = glassesSize;
        this.appearance = appearance;
        this.location = location;
        this.os = os;
        this.od = od;
    }

    public String getGlassesType() {
        return glassesType;
    }

    public String getGlassesSize() {
        return glassesSize;
    }

    public String getAppearance() {
        return appearance;
    }

    public String getLocation() {
        return location;
    }


    public EyeDTO getOs() {
        return os;
    }

    public EyeDTO getOd() {
        return od;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        GlassesRequestDTO entity = (GlassesRequestDTO) o;
        return Objects.equals(this.glassesType, entity.glassesType) &&
                Objects.equals(this.glassesSize, entity.glassesSize) &&
                Objects.equals(this.appearance, entity.appearance) &&
                Objects.equals(this.location, entity.location) &&
                Objects.equals(this.os, entity.os) &&
                Objects.equals(this.od, entity.od);
    }

    @Override
    public int hashCode() {
        return Objects.hash(glassesType, glassesSize, appearance, location, os, od);
    }


    @Override
    public String toString() {
        return getClass().getSimpleName() + "(" +
                "glassesType = " + glassesType + ", " +
                "glassesSize = " + glassesSize + ", " +
                "appearance = " + appearance + ", " +
                "location = " + location + ", " +
                "os = " + os + ", " +
                "od = " + od + ")";
    }
}
