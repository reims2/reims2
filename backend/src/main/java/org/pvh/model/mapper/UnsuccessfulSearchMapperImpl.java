package org.pvh.model.mapper;

import org.pvh.model.dto.UnsuccessfulSearchDTO;
import org.pvh.model.entity.UnsuccessfulSearch;
import org.pvh.model.enums.BalLensEnum;
import org.pvh.model.enums.GlassesTypeEnum;
import org.springframework.stereotype.Component;

@Component
public class UnsuccessfulSearchMapperImpl implements UnsuccessfulSearchMapper {

    private static UnsuccessfulSearchMapperImpl mapper;

    private UnsuccessfulSearchMapperImpl() {
    }

    public static UnsuccessfulSearchMapperImpl getInstance() {
        if (mapper == null) {
            mapper = new UnsuccessfulSearchMapperImpl();
        }

        return mapper;
    }

    @Override
    public UnsuccessfulSearchDTO unsuccessfulSearchToUnsuccessfulSearchDTO(UnsuccessfulSearch unsuccessfulSearch) {
        if (unsuccessfulSearch == null) {
            return null;
        }

        UnsuccessfulSearchDTO unsuccessfulSearchDTO = new UnsuccessfulSearchDTO(
                unsuccessfulSearch.getGlassesType().name(),
                unsuccessfulSearch.getBalLens().name(),
                unsuccessfulSearch.getIncreaseSearchTolerance(),
                unsuccessfulSearch.getSearchDate(),
                GlassesMapperImpl.getInstance().eyeToEyeDTO(unsuccessfulSearch.getOs()),
                GlassesMapperImpl.getInstance().eyeToEyeDTO(unsuccessfulSearch.getOd()));

        return unsuccessfulSearchDTO;
    }

    @Override
    public UnsuccessfulSearch unsuccessfulSearchDTOToUnsuccessfulSearch(UnsuccessfulSearchDTO unsuccessfulSearchDTO,
            String location) {
        if (unsuccessfulSearchDTO == null) {
            return null;
        }

        UnsuccessfulSearch unsuccessfulSearch = new UnsuccessfulSearch();
        if (unsuccessfulSearchDTO.getOs() == null) {
            throw new IllegalArgumentException("Eye OS cannot be null");
        }
        if (unsuccessfulSearchDTO.getOd() == null) {
            throw new IllegalArgumentException("Eye OD cannot be null");
        }
        if (location == null) {
            throw new IllegalArgumentException("Location cannot be null");
        }
        if (unsuccessfulSearchDTO.getGlassesType() == null) {
            throw new IllegalArgumentException("GlassesType cannot be null");
        }
        if (unsuccessfulSearchDTO.getBalLens() == null) {
            throw new IllegalArgumentException("BalLens cannot be null");
        }
        if (unsuccessfulSearchDTO.getSearchDate() == null) {
            throw new IllegalArgumentException("SearchDate cannot be null");
        }

        unsuccessfulSearch.setOs(GlassesMapperImpl.getInstance().eyeDTOToEye(unsuccessfulSearchDTO.getOs()));
        unsuccessfulSearch.setOd(GlassesMapperImpl.getInstance().eyeDTOToEye(unsuccessfulSearchDTO.getOd()));
        unsuccessfulSearch.setLocation(location);
        unsuccessfulSearch.setGlassesType(Enum.valueOf(GlassesTypeEnum.class, unsuccessfulSearchDTO.getGlassesType()));
        unsuccessfulSearch.setBalLens(Enum.valueOf(BalLensEnum.class, unsuccessfulSearchDTO.getBalLens()));
        unsuccessfulSearch.setIncreaseSearchTolerance(unsuccessfulSearchDTO.getIncreaseSearchTolerance());
        unsuccessfulSearch.setSearchDate(unsuccessfulSearchDTO.getSearchDate());
        return unsuccessfulSearch;
    }
}
