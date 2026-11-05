package org.pvh.service;

import org.pvh.error.BadRequestException;
import org.pvh.error.ConflictException;
import org.pvh.error.NotFoundException;
import org.pvh.model.dto.GlassesRequestDTO;
import org.pvh.model.entity.Glasses;
import org.pvh.model.enums.DispenseReasonEnum;
import org.pvh.model.enums.LocationEnum;
import org.pvh.repository.GlassesRepository;
import org.pvh.util.CampaignZone;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
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

    public Glasses getBySkuAndLocation(int sku, LocationEnum location) {
        return glassesRepository.findBySkuAndLocation(sku, location)
            .orElseThrow(() -> new NotFoundException("No glasses with SKU " + formatSku(sku) + " at this location."));
    }

    public List<Glasses> findByDispensedAndLocation(boolean dispensed, LocationEnum location) {
        return glassesRepository.findByDispensedAndLocation(dispensed, location);
    }

    // campaign days, both inclusive, an open start means since ever and an open end means until today
    public List<Glasses> findDispensedBetween(LocalDate firstDay, LocalDate lastDay, LocationEnum location) {
        Instant from = firstDay == null ? Instant.EPOCH : firstDay.atStartOfDay(CampaignZone.ZONE).toInstant();
        LocalDate end = lastDay == null ? LocalDate.now(CampaignZone.ZONE) : lastDay;
        return glassesRepository.findDispensedBetween(location, from, end.plusDays(1).atStartOfDay(CampaignZone.ZONE).toInstant());
    }

    @Transactional
    public Glasses saveGlasses(Glasses glasses) {
        LocationEnum location = glasses.getLocation();
        // first statement, so the changevalue row lock is held before InnoDB takes its snapshot
        changeService.setNewHashValue(location);
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

    // empty if already dispensed, so a replayed or doubled dispense changes nothing
    @Transactional
    public Optional<Glasses> dispense(long id, DispenseReasonEnum reason) {
        Glasses glasses = lock(id);
        if (glasses.isDispensed())
            return Optional.empty();

        changeService.setNewHashValue(glasses.getLocation());
        glasses.dispense(reason, now());
        return Optional.of(glasses);
    }

    // empty if already in stock
    @Transactional
    public Optional<Glasses> undispense(long id) {
        Glasses glasses = lock(id);
        if (!glasses.isDispensed())
            return Optional.empty();
        Integer previousSku = glasses.getDispense().getPreviousSku();
        if (previousSku == null)
            throw new BadRequestException("These glasses have no previous SKU to restore.");

        changeService.setNewHashValue(glasses.getLocation());
        // the unique index on glasses.sku catches a pair added concurrently with this SKU
        if (glassesRepository.existsBySku(previousSku))
            throw new BadRequestException("SKU " + formatSku(previousSku) + " is already used by other glasses.");

        glasses.undispense(now());
        return Optional.of(glasses);
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
