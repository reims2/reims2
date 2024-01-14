package org.pvh.model.mapper;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;
import org.pvh.model.dto.EyeDTO;
import org.pvh.model.dto.GlassesRequestDTO;
import org.pvh.model.dto.GlassesResponseDTO;
import org.pvh.model.entity.Eye;
import org.pvh.model.entity.Glasses;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = "spring")
public interface GlassesMapper {
    Glasses glassesRequestDTOToGlasses(GlassesRequestDTO glassesRequestDTO);

    GlassesRequestDTO glassesToGlassesRequestDTO(Glasses glasses);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    Glasses updateGlassesFromGlassesRequestDTO(GlassesRequestDTO glassesRequestDTO, @MappingTarget Glasses glasses);


    GlassesResponseDTO glassesToGlassesResponseDTO(Glasses glasses);

    EyeDTO eyeToEyeDTO(Eye eye);

    Eye eyeDTOToEye(EyeDTO eyeDTO);

}
