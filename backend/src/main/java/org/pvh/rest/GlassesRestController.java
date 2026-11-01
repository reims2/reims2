package org.pvh.rest;

import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
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
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("api/glasses")
@PreAuthorize("hasRole('USER')")
public class GlassesRestController {
    private static final Logger logger = LoggerFactory.getLogger(GlassesRestController.class);

    private final GlassesService glassesService;
    private final SearchLogService searchLogService;
    private final ChangeService changeService;

    public GlassesRestController(GlassesService glassesService, SearchLogService searchLogService, ChangeService changeService) {
        this.glassesService = glassesService;
        this.searchLogService = searchLogService;
        this.changeService = changeService;
    }

    @Target(ElementType.METHOD)
    @Retention(RetentionPolicy.RUNTIME)
    @ApiResponse(responseCode = "200", content = @Content(mediaType = "text/csv", schema = @Schema(type = "string")))
    @ApiResponse(responseCode = "204", description = "Nothing to export", content = @Content)
    private @interface CsvResponses {
    }

    private static ResponseEntity<String> csv(String filename, String body) {
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(filename).build().toString())
            .header(HttpHeaders.CONTENT_TYPE, "text/csv")
            .body(body);
    }

    @GetMapping(path = "/{location}/all")
    public List<GlassesResponseDTO> getAllGlasses(@PathVariable("location") LocationEnum location) {
        return glassesService.findByDispensedAndLocation(false, location).stream().map(GlassesResponseDTO::from).toList();
    }

    @CsvResponses
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
        @RequestParam(required = false) @DateTimeFormat(pattern = "MM/dd/yyyy") LocalDate startDate,
        @RequestParam(required = false) @DateTimeFormat(pattern = "MM/dd/yyyy") LocalDate endDate,
        @PathVariable("location") LocationEnum location) {
        Instant from = startDate == null ? Instant.EPOCH : startDate.atStartOfDay(CampaignZone.ZONE).toInstant();
        LocalDate lastDay = endDate == null ? LocalDate.now(CampaignZone.ZONE) : endDate;
        Instant to = lastDay.plusDays(1).atStartOfDay(CampaignZone.ZONE).toInstant();

        return glassesService.findDispensedBetween(from, to, location).stream().map(GlassesResponseDTO::from).toList();
    }

    @CsvResponses
    @GetMapping(path = "/dispensed/{location}.csv")
    public ResponseEntity<String> getAllDispensedGlassesCsv(@PathVariable("location") LocationEnum location) {
        List<Glasses> glasses = glassesService.findByDispensedAndLocation(true, location);
        if (glasses.isEmpty())
            return ResponseEntity.noContent().build();
        glasses.sort(Comparator.comparing(g -> g.getDispense().getModifyDate()));
        return csv("glasses.csv", CsvExport.glasses(glasses));
    }

    @CsvResponses
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
        return GlassesResponseDTO.from(glassesService.getBySkuAndLocation(sku, location));
    }

    @GetMapping(path = "/{location}/changes", produces = "application/json")
    public ChangeValueDTO getGlassesChange(@PathVariable("location") LocationEnum location) {
        return new ChangeValueDTO(changeService.getHashValue(location));
    }

    @PostMapping(path = "", produces = "application/json")
    @ResponseStatus(HttpStatus.CREATED)
    public GlassesResponseDTO addGlasses(@RequestBody @Valid GlassesRequestDTO glasses) {
        Glasses added = glassesService.saveGlasses(glasses.toGlasses());
        logger.info("Added new glasses in {}. SKU is {}.", added.getLocation(), added.getSku());
        return GlassesResponseDTO.from(added);
    }

    // by id, so a change queued offline can't hit a pair that got the SKU later
    @PutMapping(path = "/{id}", produces = "application/json")
    public GlassesResponseDTO updateGlasses(@PathVariable("id") long id, @RequestBody @Valid GlassesRequestDTO glasses) {
        Glasses edited = glassesService.editGlasses(id, glasses);
        logger.info("Edited glasses {} (SKU {} in {})", id, edited.getSku(), edited.getLocation());
        return GlassesResponseDTO.from(edited);
    }

    // nothing to change gives 204, see https://datatracker.ietf.org/doc/html/rfc9110#section-9.3.4
    @ApiResponse(responseCode = "200", description = "Dispensed")
    @ApiResponse(responseCode = "204", description = "Was already dispensed")
    @PutMapping(path = "/{id}/dispense")
    public ResponseEntity<Void> dispense(@PathVariable("id") long id,
                                         @RequestParam(defaultValue = "DISPENSED") DispenseReasonEnum reason) {
        if (!glassesService.dispense(id, reason))
            return ResponseEntity.noContent().build();
        logger.info("Dispensed glasses {} with reason {}", id, reason);
        return ResponseEntity.ok().build();
    }

    @ApiResponse(responseCode = "200", description = "Back in stock")
    @ApiResponse(responseCode = "204", description = "Was already in stock")
    @PutMapping(path = "/{id}/undispense")
    public ResponseEntity<Void> undispense(@PathVariable("id") long id) {
        if (!glassesService.undispense(id))
            return ResponseEntity.noContent().build();
        logger.info("Undispensed glasses with id {}", id);
        return ResponseEntity.ok().build();
    }

    @PostMapping(path = "/{location}/searchLog")
    @ResponseStatus(HttpStatus.CREATED)
    public void addSearchLog(@PathVariable("location") LocationEnum location, @RequestBody @Valid SearchLogDTO searchLogDTO) {
        SearchLog search = searchLogService.save(searchLogDTO.toSearchLog(location));
        // no prescription values, the search log table is the only place they belong
        logger.info("Added search log {} in {} with {} results", search.getId(), location, search.getResultCount());
    }
}
