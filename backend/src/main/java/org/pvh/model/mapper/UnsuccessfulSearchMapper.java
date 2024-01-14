package org.pvh.model.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;
import org.pvh.model.dto.UnsuccessfulSearchDTO;
import org.pvh.model.entity.UnsuccessfulSearch;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = "spring")
public interface UnsuccessfulSearchMapper {
    UnsuccessfulSearchDTO unsuccessfulSearchToUnsuccessfulSearchDTO(UnsuccessfulSearch unsuccessfulSearch);

    UnsuccessfulSearch unsuccessfulSearchDTOToUnsuccessfulSearch(UnsuccessfulSearchDTO unsuccessfulSearch, String location);

}
