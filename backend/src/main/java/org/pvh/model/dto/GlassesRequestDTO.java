package org.pvh.model.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.pvh.model.entity.Glasses;
import org.pvh.model.enums.AppearanceEnum;
import org.pvh.model.enums.GlassesSizeEnum;
import org.pvh.model.enums.GlassesTypeEnum;
import org.pvh.model.enums.LocationEnum;

public record GlassesRequestDTO(
    // optional on edits, rejects the edit if the SKU now belongs to other glasses
    Long id,
    @NotNull GlassesTypeEnum glassesType,
    @NotNull GlassesSizeEnum glassesSize,
    @NotNull AppearanceEnum appearance,
    @NotNull LocationEnum location,
    @NotNull @Valid EyeDTO os,
    @NotNull @Valid EyeDTO od) {

    public Glasses toGlasses() {
        return new Glasses(glassesType, glassesSize, appearance, location, os.toEye(), od.toEye());
    }

    // updates the eyes in place and keeps the location, glasses don't move between sites
    public Glasses applyTo(Glasses glasses) {
        glasses.setGlassesType(glassesType);
        glasses.setGlassesSize(glassesSize);
        glasses.setAppearance(appearance);
        os.applyTo(glasses.getOs());
        od.applyTo(glasses.getOd());
        return glasses;
    }
}
