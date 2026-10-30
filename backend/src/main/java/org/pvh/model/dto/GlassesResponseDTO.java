package org.pvh.model.dto;

import org.pvh.model.entity.Dispense;
import org.pvh.model.entity.Glasses;
import org.pvh.model.enums.AppearanceEnum;
import org.pvh.model.enums.DispenseReasonEnum;
import org.pvh.model.enums.GlassesSizeEnum;
import org.pvh.model.enums.GlassesTypeEnum;

import java.time.Instant;

public record GlassesResponseDTO(Long id, Integer sku, GlassesTypeEnum glassesType, GlassesSizeEnum glassesSize,
                                 AppearanceEnum appearance, String location, boolean dispensed, Instant creationDate,
                                 DispenseResponseDTO dispense, EyeDTO os, EyeDTO od) {

    public static GlassesResponseDTO from(Glasses glasses) {
        return new GlassesResponseDTO(glasses.getId(), glasses.getSku(), glasses.getGlassesType(), glasses.getGlassesSize(),
            glasses.getAppearance(), glasses.getLocation(), glasses.isDispensed(), glasses.getCreationDate(),
            DispenseResponseDTO.from(glasses.getDispense()), EyeDTO.from(glasses.getOs()), EyeDTO.from(glasses.getOd()));
    }

    public record DispenseResponseDTO(Instant modifyDate, Integer previousSku, DispenseReasonEnum dispenseReason) {
        static DispenseResponseDTO from(Dispense dispense) {
            return dispense == null ? null
                : new DispenseResponseDTO(dispense.getModifyDate(), dispense.getPreviousSku(), dispense.getDispenseReason());
        }
    }
}
