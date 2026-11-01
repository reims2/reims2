package org.pvh.service;

import org.pvh.error.BadRequestException;
import org.pvh.error.ConflictException;
import org.pvh.error.NotFoundException;
import org.pvh.model.dto.GlassesRequestDTO;
import org.pvh.model.entity.Dispense;
import org.pvh.model.entity.Glasses;
import org.pvh.model.enums.DispenseReasonEnum;
import org.pvh.model.enums.LocationEnum;
import org.pvh.repository.GlassesRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class GlassesService {

    private final GlassesRepository glassesRepository;
    private final ChangeService changeService;

    public GlassesService(GlassesRepository glassesRepository, ChangeService changeService) {
        this.glassesRepository = glassesRepository;
        this.changeService = changeService;
    }

    public Glasses getBySkuAndLocation(int sku, LocationEnum location) {
        return glassesRepository.findBySkuAndLocation(sku, location)
            .orElseThrow(() -> new NotFoundException("No glasses with SKU " + formatSku(sku) + " at this location."));
    }

    public List<Glasses> findByDispensedAndLocation(boolean dispensed, LocationEnum location) {
        return glassesRepository.findByDispensedAndLocation(dispensed, location);
    }

    public List<Glasses> findDispensedBetween(Instant from, Instant to, LocationEnum location) {
        return glassesRepository.findDispensedBetween(location, from, to);
    }

    @Transactional
    public Glasses saveGlasses(Glasses glasses) {
        LocationEnum location = glasses.getLocation();
        // first statement of every write, so the changevalue row lock is held before InnoDB takes its snapshot
        changeService.setNewHashValue(location);
        if (glasses.getDispense() == null)
            glasses.setDispense(new Dispense());
        glasses.setSku(nextFreeSku(location));
        glasses.setCreationDate(now());
        return glassesRepository.saveAndFlush(glasses);
    }

    @Transactional
    public Glasses editGlasses(long id, GlassesRequestDTO edit) {
        Glasses glasses = lock(id);
        if (glasses.isDispensed())
            throw new ConflictException("These glasses were dispensed in the meantime.");
        changeService.setNewHashValue(glasses.getLocation());
        return edit.applyTo(glasses);
    }

    // false if already dispensed, so a replayed or doubled dispense changes nothing
    @Transactional
    public boolean dispense(long id, DispenseReasonEnum reason) {
        Glasses glasses = lock(id);
        if (glasses.isDispensed())
            return false;

        changeService.setNewHashValue(glasses.getLocation());
        Dispense dispense = glasses.getDispense();
        dispense.setPreviousSku(glasses.getSku());
        dispense.setModifyDate(now());
        dispense.setDispenseReason(reason);
        glasses.setDispensed(true);
        glasses.setSku(null);
        return true;
    }

    @Transactional
    public boolean undispense(long id) {
        Glasses glasses = lock(id);
        if (!glasses.isDispensed())
            return false;

        changeService.setNewHashValue(glasses.getLocation());
        Dispense dispense = glasses.getDispense();
        // the unique index on glasses.sku catches a pair added concurrently with this SKU
        if (glassesRepository.existsBySku(dispense.getPreviousSku()))
            throw new BadRequestException("SKU " + formatSku(dispense.getPreviousSku()) + " is already used by other glasses.");

        glasses.setDispensed(false);
        glasses.setSku(dispense.getPreviousSku());
        dispense.setModifyDate(now());
        dispense.setPreviousSku(null);
        dispense.setDispenseReason(null);
        return true;
    }

    // a locking read takes no InnoDB snapshot, so a hash bump right after it still comes first, as in saveGlasses
    private Glasses lock(long id) {
        return glassesRepository.findLockedById(id).orElseThrow(() -> new NotFoundException("Glasses not found."));
    }

    private int nextFreeSku(LocationEnum location) {
        if (!glassesRepository.existsBySku(location.getMinSku()))
            return location.getMinSku();
        return glassesRepository.findFirstFreeSkuAfterUsed(location.getMinSku(), location.getMaxSku())
            .orElseThrow(() -> new ConflictException("No free SKUs left in this location."));
    }

    // as the frontend shows SKUs
    private static String formatSku(int sku) {
        return "%04d".formatted(sku);
    }

    private static Instant now() {
        return Instant.now().truncatedTo(ChronoUnit.MILLIS);
    }
}
