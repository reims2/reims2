package org.PVH.service;

import java.util.Optional;

import org.PVH.model.Glasses;
import org.springframework.dao.DataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


public interface MainService {

    Optional<Glasses> findGlassesById(long glassesId);
    void saveGlasses(Glasses glasses) throws DataAccessException;
    void deleteGlasses(Glasses glasses) throws DataAccessException;

    Optional<Glasses> findAllByIdAndLocation(long id, String location);
    Page<Glasses> findAllGlasses(Pageable pageable) throws DataAccessException;
    Page<Glasses> findByGlassesContaining(String location,String glassesType, Pageable pageable) throws DataAccessException;
    Page<Glasses> findAllByLocation(String location, Pageable pageable) throws DataAccessException;
}
