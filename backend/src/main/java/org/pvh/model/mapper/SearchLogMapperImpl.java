package org.pvh.model.mapper;

import org.pvh.model.dto.SearchLogDTO;
import org.pvh.model.entity.SearchLog;
import org.pvh.model.enums.BalLensEnum;
import org.pvh.model.enums.GlassesTypeEnum;
import org.springframework.stereotype.Component;

@Component
public class SearchLogMapperImpl implements SearchLogMapper {

    private static SearchLogMapperImpl mapper;

    private SearchLogMapperImpl() {
    }

    public static SearchLogMapperImpl getInstance() {
        if (mapper == null) {
            mapper = new SearchLogMapperImpl();
        }

        return mapper;
    }

    @Override
    public SearchLogDTO searchLogToSearchLogDTO(SearchLog searchLog) {
        if (searchLog == null) {
            return null;
        }

        SearchLogDTO searchLogDTO = new SearchLogDTO(
            searchLog.getGlassesType().name(),
            searchLog.getBalLens().name(),
            searchLog.getIncreaseSearchTolerance(),
            searchLog.getSearchDate(),
            searchLog.getResultCount(),
            GlassesMapperImpl.getInstance().eyeToEyeDTO(searchLog.getOs()),
            GlassesMapperImpl.getInstance().eyeToEyeDTO(searchLog.getOd()));

        return searchLogDTO;
    }

    @Override
    public SearchLog searchLogDTOToSearchLog(SearchLogDTO searchLogDTO, String location) {
        if (searchLogDTO == null) {
            return null;
        }

        SearchLog searchLog = new SearchLog();
        if (searchLogDTO.getOs() == null) {
            throw new IllegalArgumentException("Eye OS cannot be null");
        }
        if (searchLogDTO.getOd() == null) {
            throw new IllegalArgumentException("Eye OD cannot be null");
        }
        if (location == null) {
            throw new IllegalArgumentException("Location cannot be null");
        }
        if (searchLogDTO.getGlassesType() == null) {
            throw new IllegalArgumentException("GlassesType cannot be null");
        }
        if (searchLogDTO.getBalLens() == null) {
            throw new IllegalArgumentException("BalLens cannot be null");
        }
        if (searchLogDTO.getSearchDate() == null) {
            throw new IllegalArgumentException("SearchDate cannot be null");
        }
        if (searchLogDTO.getResultCount() == null) {
            throw new IllegalArgumentException("ResultCount cannot be null");
        }

        searchLog.setOs(GlassesMapperImpl.getInstance().eyeDTOToEye(searchLogDTO.getOs()));
        searchLog.setOd(GlassesMapperImpl.getInstance().eyeDTOToEye(searchLogDTO.getOd()));
        searchLog.setLocation(location);
        searchLog.setGlassesType(Enum.valueOf(GlassesTypeEnum.class, searchLogDTO.getGlassesType()));
        searchLog.setBalLens(Enum.valueOf(BalLensEnum.class, searchLogDTO.getBalLens()));
        searchLog.setIncreaseSearchTolerance(searchLogDTO.getIncreaseSearchTolerance());
        searchLog.setSearchDate(searchLogDTO.getSearchDate());
        searchLog.setResultCount(searchLogDTO.getResultCount());
        return searchLog;
    }
}
