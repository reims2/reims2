package org.pvh.rest;

import cz.jirutka.rsql.parser.RSQLParser;
import cz.jirutka.rsql.parser.ast.Node;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.pvh.error.NoSkusLeftException;
import org.pvh.error.PVHException;
import org.pvh.model.dto.ChangeValueDTO;
import org.pvh.model.dto.GlassesRequestDTO;
import org.pvh.model.dto.GlassesResponseDTO;
import org.pvh.model.dto.UnsuccessfulSearchDTO;
import org.pvh.model.entity.Glasses;
import org.pvh.model.entity.UnsuccessfulSearch;
import org.pvh.model.enums.DispenseReasonEnum;
import org.pvh.model.mapper.GlassesMapperImpl;
import org.pvh.model.mapper.UnsuccessfulSearchMapperImpl;
import org.pvh.repository.RSQL.CustomRsqlVisitor;
import org.pvh.service.ChangeService;
import org.pvh.service.MainService;
import org.pvh.util.WriteCsvToResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Order;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.*;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(exposedHeaders = "errors, content-type")
@RequestMapping("api/glasses")
public class GlassesRestController {
    private static final Logger logger = LoggerFactory.getLogger(GlassesRestController.class);


    private static final String ENTITY_NOT_FOUND = "Entity not found!";
    private static final Lock lock = new ReentrantLock();
    @Autowired
    private MainService mainService;
    @Autowired
    private ChangeService changeService;

    private Sort.Direction getSortDirection(String direction) {
        if (direction.equals("asc")) {
            return Sort.Direction.ASC;
        } else if (direction.equals("desc")) {
            return Sort.Direction.DESC;
        }

        return Sort.Direction.ASC;
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping(path = "/{location}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getAllGlassesPaginated(
        @RequestParam(value = "search", required = false) String search,
        @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size,
        @RequestParam(defaultValue = "sku,desc") String[] sort, @PathVariable("location") String location) {

        List<Order> orders = new ArrayList<>();

        if (sort[0].contains(",")) {
            // will sort more than 2 fields
            // sortOrder="field, direction"
            for (String sortOrder : sort) {
                String[] tempSort = sortOrder.split(",");
                orders.add(new Order(getSortDirection(tempSort[1]), tempSort[0]));
            }
        } else {
            // sort=[SKU, desc]
            orders.add(new Order(getSortDirection(sort[1]), sort[0]));
        }
        Collection<GlassesResponseDTO> glasses;
        Pageable pagingSort = PageRequest.of(page, size, Sort.by(orders));
        Page<Glasses> pageGlasses;
        if (search == null) {
            pageGlasses = mainService.findByDispensedAndLocation(false, location, pagingSort);
        } else {
            Node rootNode = new RSQLParser().parse(search);
            Specification<Glasses> spec = rootNode.accept(new CustomRsqlVisitor<>());
            pageGlasses = mainService.findByDispensedAndLocation(false, location, pagingSort, spec);
        }

        glasses = pageGlasses.getContent().stream().map(a -> GlassesMapperImpl.getInstance().glassesToGlassesResponseDTO(a))
            .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("glasses", glasses);
        response.put("currentPage", pageGlasses.getNumber());
        response.put("totalItems", pageGlasses.getTotalElements());
        response.put("totalPages", pageGlasses.getTotalPages());

        if (glasses.isEmpty()) {
            throw new PVHException("Glasses not found!", HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping(path = "/{location}/all")
    public Collection<GlassesResponseDTO> getAllGlasses(@PathVariable("location") String location) {
        List<Glasses> pageGlasses = mainService.findByDispensedAndLocation(false, location);

        return pageGlasses.stream().map(a -> GlassesMapperImpl.getInstance().glassesToGlassesResponseDTO(a)).toList();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping(path = "/{location}.csv")
    @ResponseBody
    public void getAllGlassesCsv(HttpServletResponse servletResponse, @PathVariable("location") String location) {
        List<Glasses> glasses = mainService.findByDispensedAndLocation(false, location);
        if (glasses.isEmpty()) {
            servletResponse.setStatus(HttpServletResponse.SC_NO_CONTENT);
            return;
        }
        Collections.sort(glasses, (o1, o2) -> o1.getSku() - o2.getSku());
        WriteCsvToResponse.writeGlassesToCsvHttpResponse(servletResponse, glasses);
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping(path = "/dispensed/{location}")
    @ResponseBody
    public Collection<GlassesResponseDTO> getAllDispensedGlasses(@RequestParam Optional<Date> startDate,
                                                                 @RequestParam Optional<Date> endDate,
                                                                 @PathVariable("location") String location) {
        Collection<Glasses> glasses = mainService.findDispensedBetween(startDate.orElse(new Date(0)),
            endDate.orElse(new Date()), location);

        return glasses.stream().map(a -> GlassesMapperImpl.getInstance().glassesToGlassesResponseDTO(a))
            .collect(Collectors.toList());
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping(path = "/dispensed/{location}.csv")
    public void getAllDispensedGlassesCsv(HttpServletResponse servletResponse, @PathVariable("location") String location) {
        List<Glasses> glasses = mainService.findByDispensedAndLocation(true, location);
        if (glasses.isEmpty()) {
            servletResponse.setStatus(HttpServletResponse.SC_NO_CONTENT);
            return;
        }

        Collections.sort(glasses, (o1, o2) -> o1.getDispense().getModifyDate().compareTo(o2.getDispense().getModifyDate()));
        WriteCsvToResponse.writeGlassesToCsvHttpResponse(servletResponse, glasses);
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping(path = "/unsuccessful/{location}.csv")
    public void getAllUnsuccessfulSearchesCsv(HttpServletResponse servletResponse, @PathVariable("location") String location) {
        List<UnsuccessfulSearch> searches = mainService.findUnsuccessfulSearchByLocation(location);
        if (searches.isEmpty()) {
            servletResponse.setStatus(HttpServletResponse.SC_NO_CONTENT);
            return;
        }

        Collections.sort(searches, (o1, o2) -> o1.getSearchDate().compareTo(o2.getSearchDate()));
        WriteCsvToResponse.writeSearchesToCsvHttpResponse(servletResponse, searches);
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping(path = "/{location}/{sku}", produces = "application/json")
    public GlassesResponseDTO getGlasses(@PathVariable("sku") int sku, @PathVariable("location") String location) {
        Optional<Glasses> glasses = this.mainService.findAllBySkuAndLocation(sku, location);

        if (glasses.isEmpty())
            throw new PVHException("Glasses not found!", HttpStatus.NOT_FOUND);

        return GlassesMapperImpl.getInstance().glassesToGlassesResponseDTO(glasses.get());
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping(path = "/{location}/changes", produces = "application/json")
    public ChangeValueDTO getGlassesChange(@PathVariable("location") String location) {

        String currentHashValue = changeService.getHashValue(location);
        ChangeValueDTO currentHashValueDTO = new ChangeValueDTO(currentHashValue);
        return currentHashValueDTO;

    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @PostMapping(path = "", produces = "application/json")
    public ResponseEntity<GlassesResponseDTO> addGlasses(@RequestBody @Valid GlassesRequestDTO glasses, UriComponentsBuilder ucBuilder) {
        lock.lock();
        Glasses glassesResponse;
        try {
            HttpHeaders headers = new HttpHeaders();
            if (glasses == null) {
                return new ResponseEntity<>(headers, HttpStatus.BAD_REQUEST);
            }

            Glasses g = GlassesMapperImpl.getInstance().glassesRequestDTOToGlasses(glasses);
            glassesResponse = this.mainService.saveGlasses(g);
            headers.setLocation(ucBuilder.path("/api/glasses/{id}").buildAndExpand(glassesResponse.getId()).toUri());

        } catch (RuntimeException e) {
            throw new PVHException("Something bad happened while adding new glasses.", HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (NoSkusLeftException e) {
            throw new PVHException("No free SKUs left in this location.", HttpStatus.CONFLICT); // Fixme
        } finally {
            lock.unlock();
        }
        changeService.setNewHashValue(glassesResponse.getLocation());
        logger.info("Added new glasses in {}. SKU is {}.", glassesResponse.getLocation(), glassesResponse.getSku());
        return new ResponseEntity<>(GlassesMapperImpl.getInstance().glassesToGlassesResponseDTO(glassesResponse), HttpStatus.CREATED);
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @PutMapping(path = "/{location}/{sku}", produces = "application/json")
    public ResponseEntity<GlassesResponseDTO> updateGlasses(@PathVariable("sku") int sku, @PathVariable("location") String location,
                                                            @RequestBody @Valid GlassesRequestDTO glasses) {
        if (glasses == null) {
            throw new PVHException("Please provide a valid glasses DTO.", HttpStatus.BAD_REQUEST);
        }

        Optional<Glasses> currentGlasses = this.mainService.findAllBySkuAndLocation(sku, location);
        if (currentGlasses.isEmpty()) {
            throw new PVHException(ENTITY_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
        Glasses glasses1 = GlassesMapperImpl.getInstance().updateGlassesFromGlassesRequestDTO(glasses, currentGlasses.get());
        logger.info("Edited glasses with SKU {} (in {})", sku, location);
        changeService.setNewHashValue(location);
        return new ResponseEntity<>(
            GlassesMapperImpl.getInstance().glassesToGlassesResponseDTO(this.mainService.saveGlassesAfterEdit(glasses1)),
            HttpStatus.OK);
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @PutMapping(path = "/dispense/{location}/{sku}", produces = "application/json")
    public ResponseEntity<GlassesResponseDTO> updateDispensed(@PathVariable("sku") int sku, @PathVariable("location") String location,
                                                              @RequestParam Optional<DispenseReasonEnum> reason) {
        Optional<Glasses> currentGlasses;
        currentGlasses = this.mainService.findAllBySkuAndLocation(sku, location);

        if (currentGlasses.isEmpty()) {
            throw new PVHException(ENTITY_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
        if (currentGlasses.get().isDispensed()) {
            // send 204 because content is not modified https://datatracker.ietf.org/doc/html/rfc7231#section-4.3.4
            throw new PVHException("entity already dispensed", HttpStatus.NO_CONTENT);
        }

        currentGlasses.get().setDispensed(true);
        currentGlasses.get().getDispense().setModifyDate(new Date());
        currentGlasses.get().getDispense().setPreviousSku(currentGlasses.get().getSku());
        if (reason.isPresent())
            currentGlasses.get().getDispense().setDispenseReason(reason.get());
        else
            currentGlasses.get().getDispense().setDispenseReason(DispenseReasonEnum.DISPENSED);

        currentGlasses.get().setSku(null);
        try {
            this.mainService.saveGlassesAfterDispense(currentGlasses.get());
        } catch (Exception e) {
            logger.error(e.getMessage());
        }
        changeService.setNewHashValue(location);
        logger.info("Dispensed glasses with SKU {} (in {}) with reason {}", sku, location,
            currentGlasses.get().getDispense().getDispenseReason());
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @PutMapping(path = "/undispense/{id}", produces = "application/json")
    public ResponseEntity<GlassesResponseDTO> undispense(@PathVariable("id") long id) {

        if (id < 0) {
            throw new PVHException("Please provide a valid glasses id.", HttpStatus.BAD_REQUEST);
        }
        Optional<Glasses> currentGlasses = this.mainService.findGlassesById(id);

        if (currentGlasses.isEmpty()) {
            throw new PVHException(ENTITY_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
        if (!currentGlasses.get().isDispensed()) {
            // send 204 because content is not modified https://datatracker.ietf.org/doc/html/rfc7231#section-4.3.4
            throw new PVHException("entity already undispensed", HttpStatus.NO_CONTENT);
        }
        Optional<Glasses> testGlasses = this.mainService.findAllBySkuAndLocation(currentGlasses.get().getDispense().getPreviousSku(),
            currentGlasses.get().getLocation());
        if (testGlasses.isPresent())
            throw new PVHException("Previous SKU is already used", HttpStatus.BAD_REQUEST);

        currentGlasses.get().setDispensed(false);
        currentGlasses.get().getDispense().setModifyDate(new Date());
        currentGlasses.get().setSku(currentGlasses.get().getDispense().getPreviousSku());
        currentGlasses.get().getDispense().setPreviousSku(null);

        this.mainService.saveGlassesAfterDispense(currentGlasses.get());
        changeService.setNewHashValue(currentGlasses.get().getLocation());
        logger.info("Undispensed glasses with SKU {}", currentGlasses.get().getSku());
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping(value = "/{location}/{sku}", produces = "application/json")
    public ResponseEntity<Void> deleteGlasses(@PathVariable("sku") int sku, @PathVariable("location") String location) {
        Optional<Glasses> glasses = this.mainService.findAllBySkuAndLocation(sku, location);
        if (glasses.isEmpty()) {
            throw new PVHException(ENTITY_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
        this.mainService.deleteGlasses(glasses.get());
        logger.info("Completely deleted glasses with SKU {} (in {})", sku, location);
        changeService.setNewHashValue(location);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }


    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @PostMapping(path = "/{location}/unsuccessfulSearch", produces = "application/json")
    public ResponseEntity<Void> addUnsuccessfulSearch(@PathVariable("location") String location,
                                                      @RequestBody @Valid UnsuccessfulSearchDTO unsuccessfulSearchDTO, UriComponentsBuilder ucBuilder) {
        UnsuccessfulSearch searchResponse;
        try {
            HttpHeaders headers = new HttpHeaders();
            if (unsuccessfulSearchDTO == null) {
                return new ResponseEntity<>(headers, HttpStatus.BAD_REQUEST);
            }
            UnsuccessfulSearch search =
                UnsuccessfulSearchMapperImpl.getInstance().unsuccessfulSearchDTOToUnsuccessfulSearch(unsuccessfulSearchDTO, location);
            searchResponse = this.mainService.saveUnsuccessfulSearch(search);
        } catch (RuntimeException e) {
            throw new PVHException("Something bad happened while adding unsuccessful search.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
        logger.info("Added new unsuccessful search with following Attributes: {}", searchResponse.toString());
        return new ResponseEntity<>(HttpStatus.CREATED);
    }


}
