package org.pvh.model.dto;

import org.junit.jupiter.api.Test;
import org.pvh.model.entity.Dispense;
import org.pvh.model.entity.Eye;
import org.pvh.model.entity.Glasses;
import org.pvh.model.enums.AppearanceEnum;
import org.pvh.model.enums.DispenseReasonEnum;
import org.pvh.model.enums.GlassesSizeEnum;
import org.pvh.model.enums.GlassesTypeEnum;
import org.pvh.model.enums.LocationEnum;

import java.math.BigDecimal;
import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

public class DtoMappingTest {

    private static final EyeDTO OS = new EyeDTO(BigDecimal.valueOf(2), BigDecimal.valueOf(-5), 3, BigDecimal.valueOf(2));
    private static final EyeDTO OD = new EyeDTO(BigDecimal.valueOf(3), BigDecimal.valueOf(-4), 4, BigDecimal.valueOf(3));

    @Test
    public void requestToGlasses() {
        GlassesRequestDTO request = new GlassesRequestDTO(null, GlassesTypeEnum.multifocal, GlassesSizeEnum.medium,
            AppearanceEnum.feminine, LocationEnum.sa, OS, OD);

        Glasses glasses = request.toGlasses();

        assertEquals(GlassesTypeEnum.multifocal, glasses.getGlassesType());
        assertEquals(GlassesSizeEnum.medium, glasses.getGlassesSize());
        assertEquals(AppearanceEnum.feminine, glasses.getAppearance());
        assertEquals(LocationEnum.sa, glasses.getLocation());
        assertEquals(OS, EyeDTO.from(glasses.getOs()));
        assertEquals(OD, EyeDTO.from(glasses.getOd()));
        assertFalse(glasses.isDispensed());
        assertNull(glasses.getSku());
        assertNull(glasses.getDispense());
        assertNull(glasses.getCreationDate());
        assertNull(glasses.getId());
    }

    @Test
    public void glassesToResponse() {
        Dispense dispense = new Dispense();
        dispense.setPreviousSku(22);
        dispense.setModifyDate(Instant.now());
        dispense.setDispenseReason(DispenseReasonEnum.BROKEN);
        Glasses glasses = new GlassesRequestDTO(null, GlassesTypeEnum.single, GlassesSizeEnum.small, AppearanceEnum.neutral, LocationEnum.sm,
            OS, OD).toGlasses();
        glasses.setId(7L);
        glasses.setSku(5005);
        glasses.setCreationDate(Instant.now());
        glasses.setDispense(dispense);

        GlassesResponseDTO response = GlassesResponseDTO.from(glasses);

        assertEquals(7L, response.id());
        assertEquals(5005, response.sku());
        assertEquals(GlassesTypeEnum.single, response.glassesType());
        assertEquals(GlassesSizeEnum.small, response.glassesSize());
        assertEquals(AppearanceEnum.neutral, response.appearance());
        assertEquals(LocationEnum.sm, response.location());
        assertEquals(glasses.getCreationDate(), response.creationDate());
        assertFalse(response.dispensed());
        assertEquals(new GlassesResponseDTO.DispenseResponseDTO(dispense.getModifyDate(), 22, DispenseReasonEnum.BROKEN),
            response.dispense());
        assertEquals(OS, response.os());
        assertEquals(OD, response.od());
    }

    @Test
    public void applyToUpdatesEyesInPlaceAndKeepsLocation() {
        Glasses glasses = new GlassesRequestDTO(null, GlassesTypeEnum.multifocal, GlassesSizeEnum.medium, AppearanceEnum.feminine,
            LocationEnum.sa, OS, OD).toGlasses();
        Eye os = glasses.getOs();
        EyeDTO newOs = new EyeDTO(BigDecimal.ONE, null, 90, null);

        new GlassesRequestDTO(null, GlassesTypeEnum.single, GlassesSizeEnum.small, AppearanceEnum.neutral, LocationEnum.sm, newOs, OD)
            .applyTo(glasses);

        assertSame(os, glasses.getOs());
        assertEquals(new EyeDTO(BigDecimal.ONE, BigDecimal.ZERO, 90, BigDecimal.ZERO), EyeDTO.from(glasses.getOs()));
        assertEquals(GlassesTypeEnum.single, glasses.getGlassesType());
        assertEquals(GlassesSizeEnum.small, glasses.getGlassesSize());
        assertEquals(AppearanceEnum.neutral, glasses.getAppearance());
        assertEquals(LocationEnum.sa, glasses.getLocation());
    }
}
