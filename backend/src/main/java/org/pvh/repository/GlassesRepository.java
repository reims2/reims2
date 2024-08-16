package org.pvh.repository;

import org.pvh.model.entity.Glasses;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface GlassesRepository extends JpaRepository<Glasses, Long>, CustomGlassesRepository, JpaSpecificationExecutor<Glasses> {

    @Query(value = "SELECT distinct g from Glasses g " +
        "join fetch g.od join fetch g.os join fetch g.dispense " +
        "where g.dispensed = :dispensed and g.location = :location ")
    List<Glasses> findByDispensedAndLocation(boolean dispensed, String location);

    Optional<Glasses> findAllByIdAndLocation(long id, String location);

    Optional<Glasses> findAllBySkuAndLocation(int sku, String location);
}
