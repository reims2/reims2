package org.pvh.model.dto;

import java.util.Date;

import org.pvh.model.enums.BalLensEnum;
import org.pvh.model.enums.GlassesTypeEnum;
import org.pvh.model.validator.IEnumValidator;

public class UnsuccessfulSearchDTO {
    @IEnumValidator(enumClass = GlassesTypeEnum.class)
    private String glassesType;
    private String balLens;
    private Boolean increaseSearchTolerance;
    private Date searchDate;

    private EyeDTO os;
    private EyeDTO od;

    


    public UnsuccessfulSearchDTO(@IEnumValidator(enumClass = GlassesTypeEnum.class) String glassesType,
            @IEnumValidator(enumClass = BalLensEnum.class) String balLens,
            Boolean increaseSearchTolerance, Date searchDate, EyeDTO os, EyeDTO od) {
        this.glassesType = glassesType;
        this.increaseSearchTolerance = increaseSearchTolerance;
        this.balLens = balLens;
        this.searchDate = searchDate;
        this.os = os;
        this.od = od;
    }
    
    public String getGlassesType() {
        return glassesType;
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

    public String getBalLens() {
        return balLens;
    }

    public void setBalLens(String balLens) {
        this.balLens = balLens;
    }

    public Boolean getIncreaseSearchTolerance() {
        return increaseSearchTolerance;
    }

    public void setIncreaseSearchTolerance(Boolean increaseSearchTolerance) {
        this.increaseSearchTolerance = increaseSearchTolerance;
    }

    
}
