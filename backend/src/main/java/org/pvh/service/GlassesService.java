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
import java.util.Optional;

@Service
public class GlassesService {

    private final GlassesRepository glassesRepository;
    private final ChangeService changeService;

    public GlassesService(GlassesRepository glassesRepository, ChangeService changeService) {
        this.glassesRepository = glassesRepository;
        this.changeService = changeService;
    }

    public Optional<Glasses> findGlassesById(long glassesId) {
        return glassesRepository.findById(glassesId);
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
    public Glasses editGlasses(LocationEnum location, int sku, GlassesRequestDTO edit) {
        return edit.applyTo(lockForChange(location, sku, edit.id()));
    }

    @Transactional
    public void dispense(LocationEnum location, int sku, DispenseReasonEnum reason, Long expectedId) {
        Glasses glasses = lockForChange(location, sku, expectedId);
        glasses.setDispensed(true);
        glasses.setSku(null);
        Dispense dispense = glasses.getDispense();
        dispense.setModifyDate(now());
        dispense.setPreviousSku(sku);
        dispense.setDispenseReason(reason);
    }

    @Transactional
    public boolean undispense(long id) {
        Glasses glasses = glassesRepository.findById(id).orElseThrow(() -> new NotFoundException("Glasses not found."));
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

    // bumps the hash before reading, like saveGlasses
    private Glasses lockForChange(LocationEnum location, int sku, Long expectedId) {
        changeService.setNewHashValue(location);
        Glasses glasses = getBySkuAndLocation(sku, location);
        // a change queued offline can arrive after its SKU went to newly added glasses
        if (expectedId != null && !expectedId.equals(glasses.getId()))
            throw new ConflictException("SKU " + formatSku(sku) + " now belongs to other glasses.");
        return glasses;
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
