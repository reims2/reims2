package org.pvh.service;

import org.pvh.model.dto.GlassesRequestDTO;
import org.pvh.model.entity.Glasses;
import org.pvh.model.entity.SearchLog;
import org.pvh.model.enums.DispenseReasonEnum;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface MainService {

    Optional<Glasses> findGlassesById(long glassesId);

    Optional<Glasses> findBySkuAndLocation(int sku, String location);

    Glasses saveGlasses(Glasses glasses);

    Glasses editGlasses(String location, int sku, GlassesRequestDTO edit);

    void dispense(String location, int sku, DispenseReasonEnum reason, Long expectedId);

    boolean undispense(long id);

    void deleteGlasses(Glasses glasses);

    List<Glasses> findByDispensedAndLocation(boolean dispensed, String location);

    List<Glasses> findDispensedBetween(Instant from, Instant to, String location);

    List<SearchLog> findUnsuccessfulSearchesByLocation(String location);

    SearchLog saveSearchLog(SearchLog search);
}
