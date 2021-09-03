package org.PVH.service;

import org.PVH.model.Glasses;
import org.springframework.dao.DataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;


public interface MainService {

    Optional<Glasses> findGlassesById(long glassesId);

    Glasses saveGlasses(Glasses glasses) throws DataAccessException;
    void deleteGlasses(Glasses glasses) throws DataAccessException;

    Glasses saveGlassesAfterDispense(Glasses glasses) throws DataAccessException;

    Optional<Glasses> findAllByIdAndLocation(long id, String location);
    Optional<Glasses> findAllBySkuAndLocation(int sku, String location);
    Optional<Glasses>  findAllByPreviousSkuAndLocation(int previousSku, String location);


    Page<Glasses> findAllGlasses(Pageable pageable) throws DataAccessException;
    Page<Glasses> findByGlassesContaining(String location,String glassesType, Pageable pageable) throws DataAccessException;
    Page<Glasses> findAllByLocation(String location, Pageable pageable) throws DataAccessException;


}
