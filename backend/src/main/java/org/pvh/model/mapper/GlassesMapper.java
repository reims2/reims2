package org.pvh.model.mapper;

import org.mapstruct.*;
import org.pvh.model.dto.EyeDTO;
import org.pvh.model.dto.GlassesDTO;
import org.pvh.model.dto.GlassesResponseDTO;
import org.pvh.model.entity.Eye;
import org.pvh.model.entity.Glasses;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = "spring")
public interface GlassesMapper {
    Glasses glassesDTOToGlasses(GlassesDTO glassesDTO);

    GlassesDTO glassesToGlassesDTO(Glasses glasses);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    Glasses updateGlassesFromGlassesDTO(GlassesDTO glassesDTO, @MappingTarget Glasses glasses);

    Glasses glassesResponseDTOToGlasses(GlassesResponseDTO glassesResponseDTO);

    GlassesResponseDTO glassesToGlassesResponseDTO(Glasses glasses);

    EyeDTO eyeToEyeDTO(Eye eye);

    Eye eyeDTOToEye(EyeDTO eyeDTO);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    Glasses updateGlassesFromGlassesResponseDTO(GlassesResponseDTO glassesResponseDTO, @MappingTarget Glasses glasses);
}
