package org.pvh.rest;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.pvh.error.PVHException;
import org.pvh.model.dto.ChangeValueDTO;
import org.pvh.model.dto.GlassesRequestDTO;
import org.pvh.model.dto.GlassesResponseDTO;
import org.pvh.model.dto.SearchLogDTO;
import org.pvh.model.entity.Glasses;
import org.pvh.model.entity.SearchLog;
import org.pvh.model.enums.DispenseReasonEnum;
import org.pvh.service.ChangeService;
import org.pvh.service.MainService;
import org.pvh.util.CampaignZone;
import org.pvh.util.WriteCsvToResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
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
@CrossOrigin(exposedHeaders = "errors, content-type")
@RequestMapping("api/glasses")
public class GlassesRestController {
    private static final Logger logger = LoggerFactory.getLogger(GlassesRestController.class);


    private static final String ENTITY_NOT_FOUND = "Entity not found!";
    private final MainService mainService;
    private final ChangeService changeService;

    public GlassesRestController(MainService mainService, ChangeService changeService) {
        this.mainService = mainService;
        this.changeService = changeService;
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping(path = "/{location}/all")
    public List<GlassesResponseDTO> getAllGlasses(@PathVariable("location") String location) {
        return mainService.findByDispensedAndLocation(false, location).stream().map(GlassesResponseDTO::from).toList();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping(path = "/{location}.csv")
    public void getAllGlassesCsv(HttpServletResponse servletResponse, @PathVariable("location") String location) {
        List<Glasses> glasses = mainService.findByDispensedAndLocation(false, location);
        if (glasses.isEmpty()) {
            servletResponse.setStatus(HttpServletResponse.SC_NO_CONTENT);
            return;
        }
        glasses.sort(Comparator.comparing(Glasses::getSku));
        WriteCsvToResponse.writeGlassesToCsvHttpResponse(servletResponse, glasses);
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping(path = "/dispensed/{location}")
    public List<GlassesResponseDTO> getAllDispensedGlasses(
        @RequestParam @DateTimeFormat(pattern = "MM/dd/yyyy") Optional<LocalDate> startDate,
        @RequestParam @DateTimeFormat(pattern = "MM/dd/yyyy") Optional<LocalDate> endDate,
        @PathVariable("location") String location) {
        Instant from = startDate.map(date -> date.atStartOfDay(CampaignZone.ZONE).toInstant()).orElse(Instant.EPOCH);
        Instant to = endDate.orElse(LocalDate.now(CampaignZone.ZONE)).plusDays(1).atStartOfDay(CampaignZone.ZONE).toInstant();

        return mainService.findDispensedBetween(from, to, location).stream().map(GlassesResponseDTO::from).toList();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping(path = "/dispensed/{location}.csv")
    public void getAllDispensedGlassesCsv(HttpServletResponse servletResponse, @PathVariable("location") String location) {
        List<Glasses> glasses = mainService.findByDispensedAndLocation(true, location);
        if (glasses.isEmpty()) {
            servletResponse.setStatus(HttpServletResponse.SC_NO_CONTENT);
            return;
        }

        glasses.sort(Comparator.comparing(g -> g.getDispense().getModifyDate()));
        WriteCsvToResponse.writeGlassesToCsvHttpResponse(servletResponse, glasses);
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping(path = "/unsuccessful/{location}.csv")
    public void getAllUnsuccessfulSearchesCsv(HttpServletResponse servletResponse, @PathVariable("location") String location) {
        List<SearchLog> searches = mainService.findUnsuccessfulSearchesByLocation(location);
        if (searches.isEmpty()) {
            servletResponse.setStatus(HttpServletResponse.SC_NO_CONTENT);
            return;
        }

        searches.sort(Comparator.comparing(SearchLog::getSearchDate));
        WriteCsvToResponse.writeSearchesToCsvHttpResponse(servletResponse, searches);
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping(path = "/{location}/{sku}", produces = "application/json")
    public GlassesResponseDTO getGlasses(@PathVariable("sku") int sku, @PathVariable("location") String location) {
        return mainService.findBySkuAndLocation(sku, location).map(GlassesResponseDTO::from)
            .orElseThrow(() -> new PVHException("Glasses not found!", HttpStatus.NOT_FOUND));
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping(path = "/{location}/changes", produces = "application/json")
    public ChangeValueDTO getGlassesChange(@PathVariable("location") String location) {
        return new ChangeValueDTO(changeService.getHashValue(location));
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @PostMapping(path = "", produces = "application/json")
    public ResponseEntity<GlassesResponseDTO> addGlasses(@RequestBody @Valid GlassesRequestDTO glasses) {
        Glasses added = mainService.saveGlasses(glasses.toGlasses());
        logger.info("Added new glasses in {}. SKU is {}.", added.getLocation(), added.getSku());
        return ResponseEntity.status(HttpStatus.CREATED).body(GlassesResponseDTO.from(added));
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @PutMapping(path = "/{location}/{sku}", produces = "application/json")
    public GlassesResponseDTO updateGlasses(@PathVariable("sku") int sku, @PathVariable("location") String location,
                                            @RequestBody @Valid GlassesRequestDTO glasses) {
        Glasses edited = mainService.editGlasses(location, sku, glasses);
        logger.info("Edited glasses with SKU {} (in {})", sku, location);
        return GlassesResponseDTO.from(edited);
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @PutMapping(path = "/dispense/{location}/{sku}", produces = "application/json")
    public ResponseEntity<Void> updateDispensed(@PathVariable("sku") int sku, @PathVariable("location") String location,
                                                @RequestParam Optional<DispenseReasonEnum> reason, @RequestParam Optional<Long> id) {
        DispenseReasonEnum dispenseReason = reason.orElse(DispenseReasonEnum.DISPENSED);
        mainService.dispense(location, sku, dispenseReason, id.orElse(null));
        logger.info("Dispensed glasses with SKU {} (in {}) with reason {}", sku, location, dispenseReason);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @PutMapping(path = "/undispense/{id}", produces = "application/json")
    public ResponseEntity<Void> undispense(@PathVariable("id") long id) {
        if (!mainService.undispense(id)) {
            // nothing to change, see https://datatracker.ietf.org/doc/html/rfc7231#section-4.3.4
            return ResponseEntity.noContent().build();
        }
        logger.info("Undispensed glasses with id {}", id);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping(value = "/{location}/{sku}", produces = "application/json")
    public ResponseEntity<Void> deleteGlasses(@PathVariable("sku") int sku, @PathVariable("location") String location) {
        Glasses glasses = mainService.findBySkuAndLocation(sku, location)
            .orElseThrow(() -> new PVHException(ENTITY_NOT_FOUND, HttpStatus.NOT_FOUND));
        mainService.deleteGlasses(glasses);
        logger.info("Completely deleted glasses with SKU {} (in {})", sku, location);
        return ResponseEntity.noContent().build();
    }


    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @PostMapping(path = "/{location}/searchLog", produces = "application/json")
    public ResponseEntity<Void> addSearchLog(@PathVariable("location") String location,
                                             @RequestBody @Valid SearchLogDTO searchLogDTO) {
        SearchLog search = mainService.saveSearchLog(searchLogDTO.toSearchLog(location));
        logger.info("Added new search log with following Attributes: {}", search);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }


}
