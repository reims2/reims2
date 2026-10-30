package org.pvh.repository;

import org.pvh.model.entity.Glasses;
import org.pvh.model.enums.LocationEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface GlassesRepository extends JpaRepository<Glasses, Long>, CustomGlassesRepository {

    @Query(value = "SELECT distinct g from Glasses g " +
        "join fetch g.od join fetch g.os join fetch g.dispense " +
        "where g.dispensed = :dispensed and g.location = :location ")
    List<Glasses> findByDispensedAndLocation(boolean dispensed, LocationEnum location);

    @Query("SELECT g FROM Glasses g WHERE g.dispensed AND g.location = :location "
        + "AND g.dispense.modifyDate >= :from AND g.dispense.modifyDate < :to")
    List<Glasses> findDispensedBetween(LocationEnum location, Instant from, Instant to);

    Optional<Glasses> findBySkuAndLocation(int sku, LocationEnum location);
}
