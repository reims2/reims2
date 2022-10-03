package org.pvh.model.mapper;

import org.pvh.model.dto.EyeDTO;
import org.pvh.model.dto.GlassesDTO;
import org.pvh.model.dto.GlassesDispenseDTO;
import org.pvh.model.dto.GlassesResponseDTO;
import org.pvh.model.dto.GlassesResponseDTO.DispenseResponseDto;
import org.pvh.model.entity.Dispense;
import org.pvh.model.entity.Eye;
import org.pvh.model.entity.Glasses;
import org.pvh.model.enums.AppearanceEnum;
import org.pvh.model.enums.GlassesSizeEnum;
import org.pvh.model.enums.GlassesTypeEnum;
import org.springframework.stereotype.Component;

import javax.annotation.processing.Generated;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2022-10-02T12:00:59+0200",
    comments = "version: 1.4.2.Final, compiler: javac, environment: Java 11.0.16 (Ubuntu)"
)
@Component
public class GlassesMapperImpl implements GlassesMapper {

    private static GlassesMapperImpl mapper;

    private GlassesMapperImpl() {
    }

    public static GlassesMapperImpl getInstance() {
        if(mapper == null) {
            mapper = new GlassesMapperImpl();
        }

        return mapper;
    }


    @Override
    public Glasses glassesDTOToGlasses(GlassesDTO glassesDTO) {
        if ( glassesDTO == null ) {
            return null;
        }
        Glasses glasses = new Glasses();

        glasses.setOs( eyeDTOToEye( glassesDTO.getOs() ) );
        glasses.setOd( eyeDTOToEye( glassesDTO.getOd() ) );
        glasses.setLocation( glassesDTO.getLocation() );
        if ( glassesDTO.getGlassesSize() != null ) {
            glasses.setGlassesSize( Enum.valueOf( GlassesSizeEnum.class, glassesDTO.getGlassesSize() ) );
        }
        if ( glassesDTO.getAppearance() != null ) {
            glasses.setAppearance( Enum.valueOf( AppearanceEnum.class, glassesDTO.getAppearance() ) );
        }
        if ( glassesDTO.getGlassesType() != null ) {
            glasses.setGlassesType( Enum.valueOf( GlassesTypeEnum.class, glassesDTO.getGlassesType() ) );
        }

        return glasses;
    }

    @Override
    public GlassesDTO glassesToGlassesDTO(Glasses glasses) {
        if ( glasses == null ) {
            return null;
        }

        GlassesDTO glassesDTO = new GlassesDTO(
            glasses.getGlassesType().name(),
            glasses.getGlassesSize().name(),
            glasses.getAppearance().name(),
            glasses.getLocation(),
            eyeToEyeDTO(glasses.getOs()),
            eyeToEyeDTO(glasses.getOd()));

        return glassesDTO;
    }

    @Override
    public Glasses updateGlassesFromGlassesDTO(GlassesDTO glassesDTO, Glasses glasses) {
        if ( glassesDTO == null ) {
            return null;
        }

        if ( glassesDTO.getOs() != null ) {
            glasses.setOs( eyeDTOToEye( glassesDTO.getOs() ) );
        }
        if ( glassesDTO.getOd() != null ) {
            glasses.setOd( eyeDTOToEye( glassesDTO.getOd() ) );
        }
        if ( glassesDTO.getLocation() != null ) {
            glasses.setLocation( glassesDTO.getLocation() );
        }
        if ( glassesDTO.getGlassesSize() != null ) {
            glasses.setGlassesSize( Enum.valueOf( GlassesSizeEnum.class, glassesDTO.getGlassesSize() ) );
        }
        if ( glassesDTO.getAppearance() != null ) {
            glasses.setAppearance( Enum.valueOf( AppearanceEnum.class, glassesDTO.getAppearance() ) );
        }
        if ( glassesDTO.getGlassesType() != null ) {
            glasses.setGlassesType( Enum.valueOf( GlassesTypeEnum.class, glassesDTO.getGlassesType() ) );
        }

        return glasses;
    }

    @Override
    public Glasses glassesResponseDTOToGlasses(GlassesResponseDTO glassesResponseDTO) {
        if ( glassesResponseDTO == null ) {
            return null;
        }

        Glasses glasses = new Glasses();

        glasses.setDispensed( glassesResponseDTO.getDispensed() );
        glasses.setSku( glassesResponseDTO.getSku() );
        glasses.setOs( eyeDTOToEye( glassesResponseDTO.getOs() ) );
        glasses.setOd( eyeDTOToEye( glassesResponseDTO.getOd() ) );
        glasses.setLocation( glassesResponseDTO.getLocation() );
        glasses.setDispense( dispenseResponseDtoToDispense( glassesResponseDTO.getDispense() ) );
        glasses.setCreationDate( glassesResponseDTO.getCreationDate() );
        if ( glassesResponseDTO.getGlassesSize() != null ) {
            glasses.setGlassesSize( Enum.valueOf( GlassesSizeEnum.class, glassesResponseDTO.getGlassesSize() ) );
        }
        if ( glassesResponseDTO.getAppearance() != null ) {
            glasses.setAppearance( Enum.valueOf( AppearanceEnum.class, glassesResponseDTO.getAppearance() ) );
        }
        if ( glassesResponseDTO.getGlassesType() != null ) {
            glasses.setGlassesType( Enum.valueOf( GlassesTypeEnum.class, glassesResponseDTO.getGlassesType() ) );
        }

        return glasses;
    }

    @Override
    public GlassesResponseDTO glassesToGlassesResponseDTO(Glasses glasses) {
        if ( glasses == null ) {
            return null;
        }

        GlassesResponseDTO glassesResponseDTO = new GlassesResponseDTO();

        glassesResponseDTO.setSku( glasses.getSku() );
        if ( glasses.getGlassesType() != null ) {
            glassesResponseDTO.setGlassesType( glasses.getGlassesType().name() );
        }
        if ( glasses.getGlassesSize() != null ) {
            glassesResponseDTO.setGlassesSize( glasses.getGlassesSize().name() );
        }
        if ( glasses.getAppearance() != null ) {
            glassesResponseDTO.setAppearance( glasses.getAppearance().name() );
        }
        glassesResponseDTO.setSku(glasses.getSku());
        glassesResponseDTO.setLocation( glasses.getLocation() );
        glassesResponseDTO.setDispensed( glasses.isDispensed() );
        glassesResponseDTO.setCreationDate( glasses.getCreationDate() );
        glassesResponseDTO.setDispense( dispenseToDispenseResponseDto( glasses.getDispense() ) );
        glassesResponseDTO.setOs( eyeToEyeDTO( glasses.getOs() ) );
        glassesResponseDTO.setOd( eyeToEyeDTO( glasses.getOd() ) );

        return glassesResponseDTO;
    }

    @Override
    public Glasses glassesDispenseDTOToGlasses(GlassesDispenseDTO glassesDispenseDTO) {
        if ( glassesDispenseDTO == null ) {
            return null;
        }

        Glasses glasses = new Glasses();
        glasses.setId(glassesDispenseDTO.getId());

        return glasses;
    }

    @Override
    public GlassesDispenseDTO glassesToGlassesDispenseDTO(Glasses glasses) {
        GlassesDispenseDTO glassesResponseDTO = new GlassesDispenseDTO();
        glassesResponseDTO.setId(glasses.getId());
        return glassesResponseDTO;
    }

    @Override
    public EyeDTO eyeToEyeDTO(Eye eye) {
        if ( eye == null ) {
            return null;
        }

        EyeDTO eyeDTO = new EyeDTO(eye.getSphere(),eye.getCylinder(),eye.getAxis(),eye.getAdd());

        return eyeDTO;
    }

    @Override
    public Eye eyeDTOToEye(EyeDTO eyeDTO) {
        if ( eyeDTO == null ) {
            return null;
        }

        Eye eye = new Eye();

        eye.setSphere( eyeDTO.getSphere() );
        eye.setCylinder( eyeDTO.getCylinder() );
        eye.setAxis( eyeDTO.getAxis() );
        eye.setAdd( eyeDTO.getAdd() );

        return eye;
    }

    @Override
    public Glasses updateGlassesFromGlassesResponseDTO(GlassesResponseDTO glassesResponseDTO, Glasses glasses) {
        if ( glassesResponseDTO == null ) {
            return null;
        }

        glasses.setDispensed( glassesResponseDTO.getDispensed() );
        if ( glassesResponseDTO.getSku() != null ) {
            glasses.setSku( glassesResponseDTO.getSku() );
        }
        if ( glassesResponseDTO.getOs() != null ) {
            glasses.setOs( eyeDTOToEye( glassesResponseDTO.getOs() ) );
        }
        if ( glassesResponseDTO.getOd() != null ) {
            glasses.setOd( eyeDTOToEye( glassesResponseDTO.getOd() ) );
        }
        if ( glassesResponseDTO.getLocation() != null ) {
            glasses.setLocation( glassesResponseDTO.getLocation() );
        }
        if ( glassesResponseDTO.getDispense() != null ) {
            if ( glasses.getDispense() == null ) {
                glasses.setDispense( new Dispense() );
            }
            dispenseResponseDtoToDispense1( glassesResponseDTO.getDispense(), glasses.getDispense() );
        }
        if ( glassesResponseDTO.getCreationDate() != null ) {
            glasses.setCreationDate( glassesResponseDTO.getCreationDate() );
        }
        if ( glassesResponseDTO.getGlassesSize() != null ) {
            glasses.setGlassesSize( Enum.valueOf( GlassesSizeEnum.class, glassesResponseDTO.getGlassesSize() ) );
        }
        if ( glassesResponseDTO.getAppearance() != null ) {
            glasses.setAppearance( Enum.valueOf( AppearanceEnum.class, glassesResponseDTO.getAppearance() ) );
        }
        if ( glassesResponseDTO.getGlassesType() != null ) {
            glasses.setGlassesType( Enum.valueOf( GlassesTypeEnum.class, glassesResponseDTO.getGlassesType() ) );
        }

        return glasses;
    }

    protected Dispense dispenseResponseDtoToDispense(DispenseResponseDto dispenseResponseDto) {
        if ( dispenseResponseDto == null ) {
            return null;
        }

        Dispense dispense = new Dispense();

        dispense.setModifyDate( dispenseResponseDto.getModifyDate() );
        dispense.setPreviousSku( dispenseResponseDto.getPreviousSku() );

        return dispense;
    }

    protected DispenseResponseDto dispenseToDispenseResponseDto(Dispense dispense) {
        if ( dispense == null ) {
            return null;
        }

        DispenseResponseDto dispenseResponseDto = new DispenseResponseDto();

        dispenseResponseDto.setModifyDate( dispense.getModifyDate() );
        dispenseResponseDto.setPreviousSku( dispense.getPreviousSku() );

        return dispenseResponseDto;
    }

    protected void dispenseResponseDtoToDispense1(DispenseResponseDto dispenseResponseDto, Dispense mappingTarget) {
        if ( dispenseResponseDto == null ) {
            return;
        }

        if ( dispenseResponseDto.getModifyDate() != null ) {
            mappingTarget.setModifyDate( dispenseResponseDto.getModifyDate() );
        }
        if ( dispenseResponseDto.getPreviousSku() != null ) {
            mappingTarget.setPreviousSku( dispenseResponseDto.getPreviousSku() );
        }
    }
}
