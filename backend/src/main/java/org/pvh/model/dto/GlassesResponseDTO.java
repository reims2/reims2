package org.pvh.model.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import org.pvh.model.entity.Dispense;
import org.pvh.model.entity.Glasses;
import org.pvh.model.enums.AppearanceEnum;
import org.pvh.model.enums.DispenseReasonEnum;
import org.pvh.model.enums.GlassesSizeEnum;
import org.pvh.model.enums.GlassesTypeEnum;
import org.pvh.model.enums.LocationEnum;


import java.time.Instant;

public record GlassesResponseDTO(Long id, @Schema(nullable = true) Integer sku, GlassesTypeEnum glassesType, GlassesSizeEnum glassesSize,
                                 AppearanceEnum appearance, LocationEnum location, boolean dispensed, Instant creationDate,
                                 DispenseResponseDTO dispense, EyeDTO os, EyeDTO od) {

    public static GlassesResponseDTO from(Glasses glasses) {
        return new GlassesResponseDTO(glasses.getId(), glasses.getSku(), glasses.getGlassesType(), glasses.getGlassesSize(),
            glasses.getAppearance(), glasses.getLocation(), glasses.isDispensed(), glasses.getCreationDate(),
            DispenseResponseDTO.from(glasses.getDispense()), EyeDTO.from(glasses.getOs()), EyeDTO.from(glasses.getOd()));
    }

    public record DispenseResponseDTO(@Schema(nullable = true) Instant modifyDate, @Schema(nullable = true) Integer previousSku,
                                      @Schema(nullable = true) DispenseReasonEnum dispenseReason) {
        static DispenseResponseDTO from(Dispense dispense) {
            return dispense == null ? null
                : new DispenseResponseDTO(dispense.getModifyDate(), dispense.getPreviousSku(), dispense.getDispenseReason());
        }
    }
}
