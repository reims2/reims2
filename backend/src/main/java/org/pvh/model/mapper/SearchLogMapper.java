package org.pvh.model.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;
import org.pvh.model.dto.SearchLogDTO;
import org.pvh.model.entity.SearchLog;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = "spring")
public interface SearchLogMapper {
    SearchLogDTO searchLogToSearchLogDTO(SearchLog searchLog);

    SearchLog searchLogDTOToSearchLog(SearchLogDTO searchLog, String location);

}
