package org.pvh.repository;

import jakarta.persistence.LockModeType;
import org.pvh.model.entity.Glasses;
import org.pvh.model.enums.LocationEnum;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.NativeQuery;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface GlassesRepository extends JpaRepository<Glasses, Long> {

    @EntityGraph(attributePaths = {"od", "os", "dispense"})
    List<Glasses> findByDispensedAndLocation(boolean dispensed, LocationEnum location);

    @Query("SELECT g FROM Glasses g JOIN FETCH g.dispense d JOIN FETCH g.od JOIN FETCH g.os "
        + "WHERE g.dispensed AND g.location = :location AND d.modifyDate >= :from AND d.modifyDate < :to")
    List<Glasses> findDispensedBetween(LocationEnum location, Instant from, Instant to);

    @EntityGraph(attributePaths = {"od", "os", "dispense"})
    Optional<Glasses> findBySkuAndLocation(int sku, LocationEnum location);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @EntityGraph(attributePaths = {"od", "os", "dispense"})
    Optional<Glasses> findLockedById(long id);

    boolean existsBySku(int sku);

    // only finds SKUs right after a used one, so a free minimum has to be checked separately
    @NativeQuery("SELECT g.sku + 1 FROM glasses g LEFT JOIN glasses g1 ON g1.sku = g.sku + 1 "
        + "WHERE g1.sku IS NULL AND g.sku >= :min AND g.sku < :max ORDER BY g.sku LIMIT 1")
    Optional<Integer> findFirstFreeSkuAfterUsed(int min, int max);
}
