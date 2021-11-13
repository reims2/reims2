package org.PVH.service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.PVH.model.Glasses;
import org.springframework.dao.DataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

public interface MainService {

    Optional<Glasses> findGlassesById(long glassesId);

    Glasses saveGlasses(Glasses glasses) throws DataAccessException;

    void deleteGlasses(Glasses glasses) throws DataAccessException;

    Glasses saveGlassesAfterDispense(Glasses glasses) throws DataAccessException;

    Glasses saveGlassesAfterEdit(Glasses glasses) throws DataAccessException;

    Optional<Glasses> findAllByIdAndLocation(long id, String location);

    Optional<Glasses> findAllBySkuAndLocation(int sku, String location);

    Page<Glasses> findAllGlasses(Pageable pageable) throws DataAccessException;

    Page<Glasses> findByDispensedAndLocation(boolean dispensed, String location, Pageable pageable, Specification<Glasses> spec)
            throws DataAccessException;

    Page<Glasses> findByDispensedAndLocation(boolean dispensed, String location, Pageable pageable) throws DataAccessException;

    List<Glasses> findDispensedBetween(Date startDate, Date endDate, String location);

}
