package org.pvh.service;

import org.pvh.error.PVHException;
import org.pvh.model.dto.GlassesRequestDTO;
import org.pvh.model.entity.Dispense;
import org.pvh.model.entity.Glasses;
import org.pvh.model.entity.SearchLog;
import org.pvh.model.enums.DispenseReasonEnum;
import org.pvh.repository.GlassesRepository;
import org.pvh.repository.SearchLogRepository;
import org.pvh.util.GlassesSpecs;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
public class MainServiceImpl implements MainService {

    private final GlassesRepository glassesRepository;
    private final SearchLogRepository searchLogRepository;
    private final ChangeService changeService;

    public MainServiceImpl(GlassesRepository glassesRepository, SearchLogRepository searchLogRepository, ChangeService changeService) {
        this.glassesRepository = glassesRepository;
        this.searchLogRepository = searchLogRepository;
        this.changeService = changeService;
    }

    @Override
    public Optional<Glasses> findGlassesById(long glassesId) {
        return glassesRepository.findById(glassesId);
    }

    @Override
    public Optional<Glasses> findBySkuAndLocation(int sku, String location) {
        return glassesRepository.findBySkuAndLocation(sku, location);
    }

    @Override
    @Transactional
    public Glasses saveGlasses(Glasses glasses) {
        // first statement of every write, so the changevalue row lock is held before InnoDB takes its snapshot
        changeService.setNewHashValue(glasses.getLocation());
        if (glasses.getDispense() == null)
            glasses.setDispense(new Dispense());

        // TODO someday make this configurable per location
        int min = 0;
        int max = 0;
        if (glasses.getLocation().equals("sa")) {
            min = 1;
            max = 5000;
        }
        if (glasses.getLocation().equals("sm")) {
            min = 5001;
            max = 10000;
        }

        return glassesRepository.saveGlassesWithNextPossibleSKU(glasses, min, max);
    }

    @Override
    @Transactional
    public Glasses editGlasses(String location, int sku, GlassesRequestDTO edit) {
        changeService.setNewHashValue(location);
        return edit.applyTo(findForChange(location, sku, edit.id()));
    }

    @Override
    @Transactional
    public void dispense(String location, int sku, DispenseReasonEnum reason, Long expectedId) {
        changeService.setNewHashValue(location);
        Glasses glasses = findForChange(location, sku, expectedId);
        glasses.setDispensed(true);
        glasses.setSku(null);
        Dispense dispense = glasses.getDispense();
        dispense.setModifyDate(now());
        dispense.setPreviousSku(sku);
        dispense.setDispenseReason(reason);
    }

    @Override
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

    @Override
    @Transactional
    public void deleteGlasses(Glasses glasses) {
        changeService.setNewHashValue(glasses.getLocation());
        glassesRepository.delete(glasses);
    }

    private Glasses findForChange(String location, int sku, Long expectedId) {
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

    @Override
    public List<Glasses> findByDispensedAndLocation(boolean dispensed, String location) {
        return glassesRepository.findByDispensedAndLocation(dispensed, location);
    }

    @Override
    public List<Glasses> findDispensedBetween(Instant from, Instant to, String location) {
        return glassesRepository.findAll(Specification.allOf(GlassesSpecs.hasLocation(location), GlassesSpecs.isDispensed(true),
            GlassesSpecs.dispensedInRange(from, to)));
    }

    @Override
    public List<SearchLog> findUnsuccessfulSearchesByLocation(String location) {
        return searchLogRepository.findAllByLocationAndResultCount(location, 0);
    }

    @Override
    public SearchLog saveSearchLog(SearchLog search) {
        return searchLogRepository.save(search);
    }

}
