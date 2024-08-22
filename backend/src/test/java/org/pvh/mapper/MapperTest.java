package org.pvh.mapper;

import org.junit.Test;
import org.junit.jupiter.api.Assertions;
import org.junit.runner.RunWith;
import org.pvh.model.dto.EyeDTO;
import org.pvh.model.dto.GlassesRequestDTO;
import org.pvh.model.dto.GlassesResponseDTO;
import org.pvh.model.entity.Dispense;
import org.pvh.model.entity.Eye;
import org.pvh.model.entity.Glasses;
import org.pvh.model.mapper.GlassesMapper;
import org.pvh.model.mapper.GlassesMapperImpl;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import java.math.BigDecimal;
import java.util.Date;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = {GlassesMapper.class, GlassesMapperImpl.class})
public class MapperTest {


    @Test
    public void testGlassesRequestDTOtoGlassesAndEyeDTOtoEye() {
        GlassesRequestDTO glassesRequestDTO = new GlassesRequestDTO(
            "multifocal",
            "medium",
            "feminine",
            "sa",
            new EyeDTO(BigDecimal.valueOf(2), BigDecimal.valueOf(-5), 3, BigDecimal.valueOf(2)),
            new EyeDTO(BigDecimal.valueOf(3), BigDecimal.valueOf(-4), 4, BigDecimal.valueOf(3)));

        Glasses target = GlassesMapperImpl.getInstance().glassesRequestDTOToGlasses(glassesRequestDTO);

        // GlassesRequestDTO Attributes
        Assertions.assertEquals(glassesRequestDTO.getGlassesSize(), target.getGlassesSize().name());
        Assertions.assertEquals(glassesRequestDTO.getGlassesType(), target.getGlassesType().name());
        Assertions.assertEquals(glassesRequestDTO.getAppearance(), target.getAppearance().name());
        Assertions.assertEquals(glassesRequestDTO.getLocation(), target.getLocation());


        // EyeDTO Attributes
        Eye targetEyeOd = GlassesMapperImpl.getInstance().eyeDTOToEye(glassesRequestDTO.getOd());
        Eye targetEyeOs = GlassesMapperImpl.getInstance().eyeDTOToEye(glassesRequestDTO.getOs());

        Assertions.assertEquals(glassesRequestDTO.getOd().getAxis(), targetEyeOd.getAxis());
        Assertions.assertEquals(glassesRequestDTO.getOd().getCylinder(), targetEyeOd.getCylinder());
        Assertions.assertEquals(glassesRequestDTO.getOd().getSphere(), targetEyeOd.getSphere());
        Assertions.assertEquals(glassesRequestDTO.getOd().getAdd(), targetEyeOd.getAdd());

        Assertions.assertEquals(glassesRequestDTO.getOs().getAdd(), targetEyeOs.getAdd());
        Assertions.assertEquals(glassesRequestDTO.getOs().getAxis(), targetEyeOs.getAxis());
        Assertions.assertEquals(glassesRequestDTO.getOs().getCylinder(), targetEyeOs.getCylinder());
        Assertions.assertEquals(glassesRequestDTO.getOs().getSphere(), targetEyeOs.getSphere());

        Assertions.assertFalse(target.isDispensed());

        Assertions.assertNull(target.getSku());
        Assertions.assertNull(target.getDispense());
        Assertions.assertNull(target.getCreationDate());
        Assertions.assertNull(target.getId());
    }


    @Test
    public void testGlassestoGlassesResponseDTOAndEyetoEyeDTO() {
        Dispense dispense = new Dispense();
        dispense.setPreviousSku(22);
        dispense.setModifyDate(new Date());

        Glasses glasses = new Glasses(
            "multifocal",
            "medium",
            "feminine",
            "sa",
            dispense,
            new Eye(BigDecimal.valueOf(2), BigDecimal.valueOf(-5), 3, BigDecimal.valueOf(2)),
            new Eye(BigDecimal.valueOf(2), BigDecimal.valueOf(-5), 3, BigDecimal.valueOf(2)));

        // Glasses Attributes
        GlassesResponseDTO target = GlassesMapperImpl.getInstance().glassesToGlassesResponseDTO(glasses);

        Assertions.assertEquals(glasses.getGlassesSize().name(), target.getGlassesSize());
        Assertions.assertEquals(glasses.getGlassesType().name(), target.getGlassesType());
        Assertions.assertEquals(glasses.getAppearance().name(), target.getAppearance());
        Assertions.assertEquals(glasses.getLocation(), target.getLocation());
        Assertions.assertEquals(glasses.getId(), target.getId());
        Assertions.assertEquals(glasses.getSku(), target.getSku());
        Assertions.assertEquals(glasses.getCreationDate(), target.getCreationDate());
        Assertions.assertEquals(glasses.isDispensed(), target.getDispensed());

        // Dispense Attributes
        Assertions.assertEquals(glasses.getDispense().getPreviousSku(), target.getDispense().getPreviousSku());
        Assertions.assertEquals(glasses.getDispense().getModifyDate(), target.getDispense().getModifyDate());

        // EyeDTO Attributes
        EyeDTO targetEyeDTOOd = GlassesMapperImpl.getInstance().eyeToEyeDTO(glasses.getOs());
        EyeDTO targetEyeDTOOs = GlassesMapperImpl.getInstance().eyeToEyeDTO(glasses.getOd());

        Assertions.assertEquals(glasses.getOd().getAxis(), targetEyeDTOOd.getAxis());
        Assertions.assertEquals(glasses.getOd().getCylinder(), targetEyeDTOOd.getCylinder());
        Assertions.assertEquals(glasses.getOd().getSphere(), targetEyeDTOOd.getSphere());
        Assertions.assertEquals(glasses.getOd().getAdd(), targetEyeDTOOd.getAdd());

        Assertions.assertEquals(glasses.getOs().getAdd(), targetEyeDTOOs.getAdd());
        Assertions.assertEquals(glasses.getOs().getAxis(), targetEyeDTOOs.getAxis());
        Assertions.assertEquals(glasses.getOs().getCylinder(), targetEyeDTOOs.getCylinder());
        Assertions.assertEquals(glasses.getOs().getSphere(), targetEyeDTOOs.getSphere());
    }

    @Test
    public void testUpdateGlassesFromGlassesDTO() {

        GlassesRequestDTO glassesRequestDTO = new GlassesRequestDTO(
            "single",
            "small",
            "neutral",
            "sa",
            new EyeDTO(BigDecimal.valueOf(2), BigDecimal.valueOf(-4), 2, BigDecimal.valueOf(3)),
            new EyeDTO(BigDecimal.valueOf(3), BigDecimal.valueOf(-6), 3, BigDecimal.valueOf(2)));

        Dispense dispense = new Dispense();
        dispense.setPreviousSku(22);
        dispense.setModifyDate(new Date());

        Glasses glasses = new Glasses(
            "multifocal",
            "medium",
            "feminine",
            "sa",
            dispense,
            new Eye(BigDecimal.valueOf(2), BigDecimal.valueOf(-5), 3, BigDecimal.valueOf(2)),
            new Eye(BigDecimal.valueOf(2), BigDecimal.valueOf(-5), 3, BigDecimal.valueOf(2)));

        // Glasses Attributes
        Glasses target = GlassesMapperImpl.getInstance().updateGlassesFromGlassesRequestDTO(glassesRequestDTO, glasses);

        Assertions.assertEquals(glassesRequestDTO.getGlassesSize(), target.getGlassesSize().name());
        Assertions.assertEquals(glassesRequestDTO.getGlassesType(), target.getGlassesType().name());
        Assertions.assertEquals(glassesRequestDTO.getAppearance(), target.getAppearance().name());
        Assertions.assertEquals(glassesRequestDTO.getLocation(), target.getLocation());


        // EyeDTO Attributes
        EyeDTO targetEyeDTOOd = GlassesMapperImpl.getInstance().eyeToEyeDTO(target.getOd());
        EyeDTO targetEyeDTOOs = GlassesMapperImpl.getInstance().eyeToEyeDTO(target.getOs());

        Assertions.assertEquals(glassesRequestDTO.getOd().getAxis(), targetEyeDTOOd.getAxis());
        Assertions.assertEquals(glassesRequestDTO.getOd().getCylinder(), targetEyeDTOOd.getCylinder());
        Assertions.assertEquals(glassesRequestDTO.getOd().getSphere(), targetEyeDTOOd.getSphere());
        Assertions.assertEquals(glassesRequestDTO.getOd().getAdd(), targetEyeDTOOd.getAdd());

        Assertions.assertEquals(glassesRequestDTO.getOs().getAdd(), targetEyeDTOOs.getAdd());
        Assertions.assertEquals(glassesRequestDTO.getOs().getAxis(), targetEyeDTOOs.getAxis());
        Assertions.assertEquals(glassesRequestDTO.getOs().getCylinder(), targetEyeDTOOs.getCylinder());
        Assertions.assertEquals(glassesRequestDTO.getOs().getSphere(), targetEyeDTOOs.getSphere());


        Assertions.assertEquals(glasses.getId(), target.getId());
        Assertions.assertEquals(glasses.getSku(), target.getSku());
        Assertions.assertEquals(glasses.getCreationDate(), target.getCreationDate());
        Assertions.assertEquals(glasses.isDispensed(), target.isDispensed());

    }

}
