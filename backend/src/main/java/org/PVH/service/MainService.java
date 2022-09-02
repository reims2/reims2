package org.PVH.service;

import org.PVH.model.Glasses;
import org.springframework.dao.DataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.Lock;

import javax.persistence.LockModeType;
import java.util.Date;
import java.util.List;
import java.util.Optional;

public interface MainService {

    Optional<Glasses> findGlassesById(long glassesId);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Glasses saveGlasses(Glasses glasses) throws DataAccessException;

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    void deleteGlasses(Glasses glasses) throws DataAccessException;

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Glasses saveGlassesAfterDispense(Glasses glasses) throws DataAccessException;
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Glasses saveGlassesAfterEdit(Glasses glasses) throws DataAccessException;

    Optional<Glasses> findAllByIdAndLocation(long id, String location);

    Optional<Glasses> findAllBySkuAndLocation(int sku, String location);

    Page<Glasses> findAllGlasses(Pageable pageable) throws DataAccessException;

    Page<Glasses> findByDispensedAndLocation(boolean dispensed, String location, Pageable pageable, Specification<Glasses> spec)
            throws DataAccessException;

    Page<Glasses> findByDispensedAndLocation(boolean dispensed, String location, Pageable pageable) throws DataAccessException;

    List<Glasses> findByDispensedAndLocation(boolean dispensed, String location) throws DataAccessException;

    List<Glasses> findDispensedBetween(Date startDate, Date endDate, String location);

}
