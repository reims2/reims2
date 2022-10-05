package org.pvh.model.mapper;

import org.mapstruct.*;
import org.pvh.model.dto.EyeDTO;
import org.pvh.model.dto.GlassesRequestDTO;
import org.pvh.model.dto.GlassesDispenseDTO;
import org.pvh.model.dto.GlassesResponseDTO;
import org.pvh.model.entity.Eye;
import org.pvh.model.entity.Glasses;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = "spring")
public interface GlassesMapper {
    Glasses glassesRequestDTOToGlasses(GlassesRequestDTO glassesRequestDTO);

    GlassesRequestDTO glassesToGlassesRequestDTO(Glasses glasses);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    Glasses updateGlassesFromGlassesRequestDTO(GlassesRequestDTO glassesRequestDTO, @MappingTarget Glasses glasses);

    Glasses glassesResponseDTOToGlasses(GlassesResponseDTO glassesResponseDTO);

    GlassesResponseDTO glassesToGlassesResponseDTO(Glasses glasses);

    Glasses glassesDispenseDTOToGlasses(GlassesDispenseDTO glassesDispenseDTO);

    GlassesDispenseDTO glassesToGlassesDispenseDTO(Glasses glasses);

    EyeDTO eyeToEyeDTO(Eye eye);

    Eye eyeDTOToEye(EyeDTO eyeDTO);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    Glasses updateGlassesFromGlassesResponseDTO(GlassesResponseDTO glassesResponseDTO, @MappingTarget Glasses glasses);

}
