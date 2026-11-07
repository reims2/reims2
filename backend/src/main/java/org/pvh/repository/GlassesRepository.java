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

    // SKUs in use or freed after heldSince count as taken, min - 1 lets the gap search find a free min
    @NativeQuery("WITH taken AS (SELECT sku FROM glasses WHERE sku BETWEEN :min AND :max "
        + "UNION SELECT previous_sku FROM dispense WHERE modify_date > :heldSince AND previous_sku BETWEEN :min AND :max "
        + "UNION SELECT :min - 1) "
        + "SELECT t.sku + 1 FROM taken t LEFT JOIN taken t1 ON t1.sku = t.sku + 1 "
        + "WHERE t1.sku IS NULL AND t.sku < :max ORDER BY t.sku LIMIT 1")
    Optional<Integer> findFirstFreeSku(int min, int max, Instant heldSince);
}
