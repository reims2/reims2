package org.pvh.service;

import org.pvh.error.PVHException;
import org.pvh.model.dto.GlassesRequestDTO;
import org.pvh.model.entity.Dispense;
import org.pvh.model.entity.Glasses;
import org.pvh.model.enums.DispenseReasonEnum;
import org.pvh.model.enums.LocationEnum;
import org.pvh.repository.GlassesRepository;
import org.springframework.http.HttpStatus;
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

    @Transactional
    public Glasses saveGlasses(Glasses glasses) {
        // first statement of every write, so the changevalue row lock is held before InnoDB takes its snapshot
        changeService.setNewHashValue(glasses.getLocation());
        if (glasses.getDispense() == null)
            glasses.setDispense(new Dispense());
        LocationEnum location = glasses.getLocation();
        return glassesRepository.saveGlassesWithNextPossibleSKU(glasses, location.getMinSku(), location.getMaxSku());
    }

    @Transactional
    public Glasses editGlasses(LocationEnum location, int sku, GlassesRequestDTO edit) {
        changeService.setNewHashValue(location);
        return edit.applyTo(findForChange(location, sku, edit.id()));
    }

    @Transactional
    public void dispense(LocationEnum location, int sku, DispenseReasonEnum reason, Long expectedId) {
        changeService.setNewHashValue(location);
        Glasses glasses = findForChange(location, sku, expectedId);
        glasses.setDispensed(true);
        glasses.setSku(null);
        Dispense dispense = glasses.getDispense();
        dispense.setModifyDate(now());
        dispense.setPreviousSku(sku);
        dispense.setDispenseReason(reason);
    }

    @Transactional
    public boolean undispense(long id) {
        Glasses glasses = glassesRepository.findById(id)
            .orElseThrow(() -> new PVHException("Entity not found!", HttpStatus.NOT_FOUND));
        if (!glasses.isDispensed())
            return false;

        changeService.setNewHashValue(glasses.getLocation());
        Dispense dispense = glasses.getDispense();
        // the unique index on glasses.sku catches a pair added concurrently with this SKU
        if (glassesRepository.findBySkuAndLocation(dispense.getPreviousSku(), glasses.getLocation()).isPresent())
            throw new PVHException("Previous SKU is already used", HttpStatus.BAD_REQUEST);

        glasses.setDispensed(false);
        glasses.setSku(dispense.getPreviousSku());
        dispense.setModifyDate(now());
        dispense.setPreviousSku(null);
        dispense.setDispenseReason(null);
        return true;
    }

    @Transactional
    public void deleteGlasses(Glasses glasses) {
        changeService.setNewHashValue(glasses.getLocation());
        glassesRepository.delete(glasses);
    }

    private Glasses findForChange(LocationEnum location, int sku, Long expectedId) {
        Glasses glasses = glassesRepository.findBySkuAndLocation(sku, location)
            .orElseThrow(() -> new PVHException("Entity not found!", HttpStatus.NOT_FOUND));
        // a change queued offline can arrive after its SKU went to newly added glasses
        if (expectedId != null && !expectedId.equals(glasses.getId()))
            throw new PVHException("SKU " + sku + " now belongs to other glasses.", HttpStatus.CONFLICT);
        return glasses;
    }

    private static Instant now() {
        return Instant.now().truncatedTo(ChronoUnit.MILLIS);
    }

    public List<Glasses> findByDispensedAndLocation(boolean dispensed, LocationEnum location) {
        return glassesRepository.findByDispensedAndLocation(dispensed, location);
    }

    public List<Glasses> findDispensedBetween(Instant from, Instant to, LocationEnum location) {
        return glassesRepository.findDispensedBetween(location, from, to);
    }


}
