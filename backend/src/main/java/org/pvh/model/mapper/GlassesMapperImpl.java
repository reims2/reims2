package org.pvh.model.mapper;

import org.pvh.model.dto.EyeDTO;
import org.pvh.model.dto.GlassesRequestDTO;
import org.pvh.model.dto.GlassesResponseDTO;
import org.pvh.model.dto.GlassesResponseDTO.DispenseResponseDto;
import org.pvh.model.entity.Dispense;
import org.pvh.model.entity.Eye;
import org.pvh.model.entity.Glasses;
import org.pvh.model.enums.AppearanceEnum;
import org.pvh.model.enums.DispenseReasonEnum;
import org.pvh.model.enums.GlassesSizeEnum;
import org.pvh.model.enums.GlassesTypeEnum;
import org.springframework.stereotype.Component;

import javax.annotation.processing.Generated;
import java.math.BigDecimal;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2022-10-02T12:00:59+0200",
    comments = "version: 1.4.2.Final, compiler: javac, environment: Java 11.0.16 (Ubuntu)")
@Component
public class GlassesMapperImpl implements GlassesMapper {

    private static GlassesMapperImpl mapper;

    private GlassesMapperImpl() {
    }

    public static GlassesMapperImpl getInstance() {
        if (mapper == null) {
            mapper = new GlassesMapperImpl();
        }

        return mapper;
    }


    @Override
    public Glasses glassesRequestDTOToGlasses(GlassesRequestDTO glassesRequestDTO) {
        if (glassesRequestDTO == null) {
            return null;
        }
        Glasses glasses = new Glasses();

        glasses.setOs(eyeDTOToEye(glassesRequestDTO.getOs()));
        glasses.setOd(eyeDTOToEye(glassesRequestDTO.getOd()));
        glasses.setLocation(glassesRequestDTO.getLocation());
        if (glassesRequestDTO.getGlassesSize() == null)
            return null;
        if (glassesRequestDTO.getAppearance() == null)
            return null;
        if (glassesRequestDTO.getGlassesType() == null)
            return null;
        glasses.setGlassesSize(Enum.valueOf(GlassesSizeEnum.class, glassesRequestDTO.getGlassesSize()));
        glasses.setAppearance(Enum.valueOf(AppearanceEnum.class, glassesRequestDTO.getAppearance()));
        glasses.setGlassesType(Enum.valueOf(GlassesTypeEnum.class, glassesRequestDTO.getGlassesType()));


        return glasses;
    }

    @Override
    public GlassesRequestDTO glassesToGlassesRequestDTO(Glasses glasses) {
        if (glasses == null) {
            return null;
        }

        GlassesRequestDTO glassesRequestDTO = new GlassesRequestDTO(
            glasses.getGlassesType().name(),
            glasses.getGlassesSize().name(),
            glasses.getAppearance().name(),
            glasses.getLocation(),
            eyeToEyeDTO(glasses.getOs()),
            eyeToEyeDTO(glasses.getOd()));

        return glassesRequestDTO;
    }

    @Override
    public Glasses updateGlassesFromGlassesRequestDTO(GlassesRequestDTO glassesRequestDTO, Glasses glasses) {
        if (glassesRequestDTO == null) {
            return null;
        }

        if (glassesRequestDTO.getOs() != null) {
            glasses.setOs(eyeDTOToEye(glassesRequestDTO.getOs()));
        }
        if (glassesRequestDTO.getOd() != null) {
            glasses.setOd(eyeDTOToEye(glassesRequestDTO.getOd()));
        }
        if (glassesRequestDTO.getLocation() != null) {
            glasses.setLocation(glassesRequestDTO.getLocation());
        }
        if (glassesRequestDTO.getGlassesSize() != null) {
            glasses.setGlassesSize(Enum.valueOf(GlassesSizeEnum.class, glassesRequestDTO.getGlassesSize()));
        }
        if (glassesRequestDTO.getAppearance() != null) {
            glasses.setAppearance(Enum.valueOf(AppearanceEnum.class, glassesRequestDTO.getAppearance()));
        }
        if (glassesRequestDTO.getGlassesType() != null) {
            glasses.setGlassesType(Enum.valueOf(GlassesTypeEnum.class, glassesRequestDTO.getGlassesType()));
        }

        return glasses;
    }


    @Override
    public GlassesResponseDTO glassesToGlassesResponseDTO(Glasses glasses) {
        if (glasses == null) {
            return null;
        }

        GlassesResponseDTO glassesResponseDTO = new GlassesResponseDTO();

        glassesResponseDTO.setId(glasses.getId());
        glassesResponseDTO.setSku(glasses.getSku());
        if (glasses.getGlassesType() != null) {
            glassesResponseDTO.setGlassesType(glasses.getGlassesType().name());
        }
        if (glasses.getGlassesSize() != null) {
            glassesResponseDTO.setGlassesSize(glasses.getGlassesSize().name());
        }
        if (glasses.getAppearance() != null) {
            glassesResponseDTO.setAppearance(glasses.getAppearance().name());
        }
        glassesResponseDTO.setSku(glasses.getSku());
        glassesResponseDTO.setLocation(glasses.getLocation());
        glassesResponseDTO.setDispensed(glasses.isDispensed());
        glassesResponseDTO.setCreationDate(glasses.getCreationDate());
        glassesResponseDTO.setDispense(dispenseToDispenseResponseDto(glasses.getDispense()));
        glassesResponseDTO.setOs(eyeToEyeDTO(glasses.getOs()));
        glassesResponseDTO.setOd(eyeToEyeDTO(glasses.getOd()));

        return glassesResponseDTO;
    }


    @Override
    public EyeDTO eyeToEyeDTO(Eye eye) {
        if (eye == null) {
            return null;
        }

        EyeDTO eyeDTO = new EyeDTO(eye.getSphere(), eye.getCylinder(), eye.getAxis(), eye.getAdd());

        return eyeDTO;
    }

    @Override
    public Eye eyeDTOToEye(EyeDTO eyeDTO) {
        if (eyeDTO == null) {
            return null;
        }

        Eye eye = new Eye();

        eye.setSphere(eyeDTO.getSphere() != null ? eyeDTO.getSphere() : new BigDecimal(0));
        eye.setCylinder(eyeDTO.getCylinder() != null ? eyeDTO.getCylinder() : new BigDecimal(0));
        eye.setAxis(eyeDTO.getAxis());
        eye.setAdd(eyeDTO.getAdd() != null ? eyeDTO.getAdd() : new BigDecimal(0));

        return eye;
    }


    protected Dispense dispenseResponseDtoToDispense(DispenseResponseDto dispenseResponseDto) {
        if (dispenseResponseDto == null) {
            return null;
        }

        Dispense dispense = new Dispense();
        dispense.setModifyDate(dispenseResponseDto.getModifyDate());
        dispense.setPreviousSku(dispenseResponseDto.getPreviousSku());
        DispenseReasonEnum enumValue = dispenseResponseDto.getDispenseReason() != null
            ? Enum.valueOf(DispenseReasonEnum.class, dispenseResponseDto.getDispenseReason())
            : null;
        dispense.setDispenseReason(enumValue);

        return dispense;
    }

    protected DispenseResponseDto dispenseToDispenseResponseDto(Dispense dispense) {
        if (dispense == null) {
            return null;
        }

        DispenseResponseDto dispenseResponseDto = new DispenseResponseDto();
        dispenseResponseDto.setModifyDate(dispense.getModifyDate());
        dispenseResponseDto.setPreviousSku(dispense.getPreviousSku());
        dispenseResponseDto.setDispenseReason(dispense.getDispenseReason() != null ? dispense.getDispenseReason().name() : null);

        return dispenseResponseDto;
    }

    protected void dispenseResponseDtoToDispense1(DispenseResponseDto dispenseResponseDto, Dispense mappingTarget) {
        if (dispenseResponseDto == null) {
            return;
        }

        if (dispenseResponseDto.getModifyDate() != null) {
            mappingTarget.setModifyDate(dispenseResponseDto.getModifyDate());
        }
        if (dispenseResponseDto.getPreviousSku() != null) {
            mappingTarget.setPreviousSku(dispenseResponseDto.getPreviousSku());
        }
        if (dispenseResponseDto.getDispenseReason() != null) {
            DispenseReasonEnum enumValue = dispenseResponseDto.getDispenseReason() != null
                ? Enum.valueOf(DispenseReasonEnum.class, dispenseResponseDto.getDispenseReason())
                : null;
            mappingTarget.setDispenseReason(enumValue);
        }
    }
}
