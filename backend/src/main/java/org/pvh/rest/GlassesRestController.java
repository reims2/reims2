package org.pvh.rest;

import jakarta.validation.Valid;
import org.pvh.error.PVHException;
import org.pvh.model.dto.ChangeValueDTO;
import org.pvh.model.dto.GlassesRequestDTO;
import org.pvh.model.dto.GlassesResponseDTO;
import org.pvh.model.dto.SearchLogDTO;
import org.pvh.model.entity.Glasses;
import org.pvh.model.entity.SearchLog;
import org.pvh.model.enums.DispenseReasonEnum;
import org.pvh.model.enums.LocationEnum;
import org.pvh.service.ChangeService;
import org.pvh.service.GlassesService;
import org.pvh.service.SearchLogService;
import org.pvh.util.CampaignZone;
import org.pvh.util.CsvExport;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("api/glasses")
@PreAuthorize("hasRole('USER')")
public class GlassesRestController {
    private static final Logger logger = LoggerFactory.getLogger(GlassesRestController.class);

    private static final String ENTITY_NOT_FOUND = "Entity not found!";
    private final GlassesService glassesService;
    private final SearchLogService searchLogService;
    private final ChangeService changeService;

    public GlassesRestController(GlassesService glassesService, SearchLogService searchLogService, ChangeService changeService) {
        this.glassesService = glassesService;
        this.searchLogService = searchLogService;
        this.changeService = changeService;
    }

    private static ResponseEntity<String> csv(String filename, String body) {
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
            .header(HttpHeaders.CONTENT_TYPE, "text/csv")
            .body(body);
    }

    @GetMapping(path = "/{location}/all")
    public List<GlassesResponseDTO> getAllGlasses(@PathVariable("location") LocationEnum location) {
        return glassesService.findByDispensedAndLocation(false, location).stream().map(GlassesResponseDTO::from).toList();
    }

    @GetMapping(path = "/{location}.csv")
    public ResponseEntity<String> getAllGlassesCsv(@PathVariable("location") LocationEnum location) {
        List<Glasses> glasses = glassesService.findByDispensedAndLocation(false, location);
        if (glasses.isEmpty())
            return ResponseEntity.noContent().build();
        glasses.sort(Comparator.comparing(Glasses::getSku));
        return csv("glasses.csv", CsvExport.glasses(glasses));
    }

    @GetMapping(path = "/dispensed/{location}")
    public List<GlassesResponseDTO> getAllDispensedGlasses(
        @RequestParam @DateTimeFormat(pattern = "MM/dd/yyyy") Optional<LocalDate> startDate,
        @RequestParam @DateTimeFormat(pattern = "MM/dd/yyyy") Optional<LocalDate> endDate,
        @PathVariable("location") LocationEnum location) {
        Instant from = startDate.map(date -> date.atStartOfDay(CampaignZone.ZONE).toInstant()).orElse(Instant.EPOCH);
        Instant to = endDate.orElse(LocalDate.now(CampaignZone.ZONE)).plusDays(1).atStartOfDay(CampaignZone.ZONE).toInstant();

        return glassesService.findDispensedBetween(from, to, location).stream().map(GlassesResponseDTO::from).toList();
    }

    @GetMapping(path = "/dispensed/{location}.csv")
    public ResponseEntity<String> getAllDispensedGlassesCsv(@PathVariable("location") LocationEnum location) {
        List<Glasses> glasses = glassesService.findByDispensedAndLocation(true, location);
        if (glasses.isEmpty())
            return ResponseEntity.noContent().build();
        glasses.sort(Comparator.comparing(g -> g.getDispense().getModifyDate()));
        return csv("glasses.csv", CsvExport.glasses(glasses));
    }

    @GetMapping(path = "/unsuccessful/{location}.csv")
    public ResponseEntity<String> getAllUnsuccessfulSearchesCsv(@PathVariable("location") LocationEnum location) {
        List<SearchLog> searches = searchLogService.findUnsuccessful(location);
        if (searches.isEmpty())
            return ResponseEntity.noContent().build();
        searches.sort(Comparator.comparing(SearchLog::getSearchDate));
        return csv("unsuccessful_searches.csv", CsvExport.searches(searches));
    }

    @GetMapping(path = "/{location}/{sku}", produces = "application/json")
    public GlassesResponseDTO getGlasses(@PathVariable("sku") int sku, @PathVariable("location") LocationEnum location) {
        return glassesService.findBySkuAndLocation(sku, location).map(GlassesResponseDTO::from)
            .orElseThrow(() -> new PVHException("Glasses not found!", HttpStatus.NOT_FOUND));
    }

    @GetMapping(path = "/{location}/changes", produces = "application/json")
    public ChangeValueDTO getGlassesChange(@PathVariable("location") LocationEnum location) {
        return new ChangeValueDTO(changeService.getHashValue(location));
    }

    @PostMapping(path = "", produces = "application/json")
    public ResponseEntity<GlassesResponseDTO> addGlasses(@RequestBody @Valid GlassesRequestDTO glasses) {
        Glasses added = glassesService.saveGlasses(glasses.toGlasses());
        logger.info("Added new glasses in {}. SKU is {}.", added.getLocation(), added.getSku());
        return ResponseEntity.status(HttpStatus.CREATED).body(GlassesResponseDTO.from(added));
    }

    @PutMapping(path = "/{location}/{sku}", produces = "application/json")
    public GlassesResponseDTO updateGlasses(@PathVariable("sku") int sku, @PathVariable("location") LocationEnum location,
                                            @RequestBody @Valid GlassesRequestDTO glasses) {
        Glasses edited = glassesService.editGlasses(location, sku, glasses);
        logger.info("Edited glasses with SKU {} (in {})", sku, location);
        return GlassesResponseDTO.from(edited);
    }

    @PutMapping(path = "/dispense/{location}/{sku}", produces = "application/json")
    public ResponseEntity<Void> updateDispensed(@PathVariable("sku") int sku, @PathVariable("location") LocationEnum location,
                                                @RequestParam Optional<DispenseReasonEnum> reason, @RequestParam Optional<Long> id) {
        DispenseReasonEnum dispenseReason = reason.orElse(DispenseReasonEnum.DISPENSED);
        glassesService.dispense(location, sku, dispenseReason, id.orElse(null));
        logger.info("Dispensed glasses with SKU {} (in {}) with reason {}", sku, location, dispenseReason);
        return ResponseEntity.ok().build();
    }

    @PutMapping(path = "/undispense/{id}", produces = "application/json")
    public ResponseEntity<Void> undispense(@PathVariable("id") long id) {
        if (!glassesService.undispense(id)) {
            // nothing to change, see https://datatracker.ietf.org/doc/html/rfc7231#section-4.3.4
            return ResponseEntity.noContent().build();
        }
        logger.info("Undispensed glasses with id {}", id);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping(value = "/{location}/{sku}", produces = "application/json")
    public ResponseEntity<Void> deleteGlasses(@PathVariable("sku") int sku, @PathVariable("location") LocationEnum location) {
        Glasses glasses = glassesService.findBySkuAndLocation(sku, location)
            .orElseThrow(() -> new PVHException(ENTITY_NOT_FOUND, HttpStatus.NOT_FOUND));
        glassesService.deleteGlasses(glasses);
        logger.info("Completely deleted glasses with SKU {} (in {})", sku, location);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(path = "/{location}/searchLog", produces = "application/json")
    public ResponseEntity<Void> addSearchLog(@PathVariable("location") LocationEnum location,
                                             @RequestBody @Valid SearchLogDTO searchLogDTO) {
        SearchLog search = searchLogService.save(searchLogDTO.toSearchLog(location));
        logger.info("Added new search log with following Attributes: {}", search);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
