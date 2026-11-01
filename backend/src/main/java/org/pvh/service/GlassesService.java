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

    public Optional<Glasses> findBySkuAndLocation(int sku, LocationEnum location) {
        return glassesRepository.findBySkuAndLocation(sku, location);
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
        Glasses glasses = glassesRepository.findById(id).orElseThrow(GlassesService::notFound);
        if (!glasses.isDispensed())
            return false;

        changeService.setNewHashValue(glasses.getLocation());
        Dispense dispense = glasses.getDispense();
        // the unique index on glasses.sku catches a pair added concurrently with this SKU
        if (glassesRepository.existsBySku(dispense.getPreviousSku()))
            throw new BadRequestException("Previous SKU is already used");

        glasses.setDispensed(false);
        glasses.setSku(dispense.getPreviousSku());
        dispense.setModifyDate(now());
        dispense.setPreviousSku(null);
        dispense.setDispenseReason(null);
        return true;
    }

    @Transactional
    public void deleteGlasses(LocationEnum location, int sku) {
        glassesRepository.delete(lockForChange(location, sku, null));
    }

    // bumps the hash before reading, like saveGlasses
    private Glasses lockForChange(LocationEnum location, int sku, Long expectedId) {
        changeService.setNewHashValue(location);
        Glasses glasses = glassesRepository.findBySkuAndLocation(sku, location).orElseThrow(GlassesService::notFound);
        // a change queued offline can arrive after its SKU went to newly added glasses
        if (expectedId != null && !expectedId.equals(glasses.getId()))
            throw new ConflictException("SKU " + sku + " now belongs to other glasses.");
        return glasses;
    }

    private int nextFreeSku(LocationEnum location) {
        if (!glassesRepository.existsBySku(location.getMinSku()))
            return location.getMinSku();
        return glassesRepository.findFirstFreeSkuAfterUsed(location.getMinSku(), location.getMaxSku())
            .orElseThrow(() -> new ConflictException("No free SKUs left in this location."));
    }

    private static NotFoundException notFound() {
        return new NotFoundException("Entity not found!");
    }

    private static Instant now() {
        return Instant.now().truncatedTo(ChronoUnit.MILLIS);
    }
}
