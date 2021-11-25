
package org.PVH.rest;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import javax.transaction.Transactional;
import javax.validation.Valid;

import org.PVH.model.Glasses;
import org.PVH.repository.RSQL.CustomRsqlVisitor;
import org.PVH.service.MainService;
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
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;

import cz.jirutka.rsql.parser.RSQLParser;
import cz.jirutka.rsql.parser.ast.Node;

@RestController
@CrossOrigin(exposedHeaders = "errors, content-type")
@RequestMapping("api/glasses")
public class GlassesRestController {

    @Autowired
    private MainService mainService;

    private Sort.Direction getSortDirection(String direction) {
        if (direction.equals("asc")) {
            return Sort.Direction.ASC;
        } else if (direction.equals("desc")) {
            return Sort.Direction.DESC;
        }

        return Sort.Direction.ASC;
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @RequestMapping(method = RequestMethod.GET, value = "/{location}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getAllGlassesPage(@RequestParam(value = "search", required = false) String search,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "sku,desc") String[] sort, @PathVariable("location") String location) {

        List<Order> orders = new ArrayList<Order>();

        if (sort[0].contains(",")) {
            // will sort more than 2 fields
            // sortOrder="field, direction"
            for (String sortOrder : sort) {
                String[] _sort = sortOrder.split(",");
                orders.add(new Order(getSortDirection(_sort[1]), _sort[0]));
            }
        } else {
            // sort=[SKU, desc]
            orders.add(new Order(getSortDirection(sort[1]), sort[0]));
        }
        Collection<Glasses> glasses = new ArrayList<Glasses>();
        Pageable pagingSort = PageRequest.of(page, size, Sort.by(orders));
        Page<Glasses> pageGlasses;
        if (search == null) {
            pageGlasses = mainService.findByDispensedAndLocation(false, location, pagingSort);
        } else {
            Node rootNode = new RSQLParser().parse(search);
            Specification<Glasses> spec = rootNode.accept(new CustomRsqlVisitor<Glasses>());
            pageGlasses = mainService.findByDispensedAndLocation(false, location, pagingSort, spec);
        }

        glasses = pageGlasses.getContent();

        Map<String, Object> response = new HashMap<>();
        response.put("glasses", glasses);
        response.put("currentPage", pageGlasses.getNumber());
        response.put("totalItems", pageGlasses.getTotalElements());
        response.put("totalPages", pageGlasses.getTotalPages());

        if (glasses.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @RequestMapping(method = RequestMethod.GET, value = "/dispensed/{location}")
    @ResponseBody
    public Collection<Glasses> getAllGlassesPage(@RequestParam Optional<Date> startDate, @RequestParam Optional<Date> endDate,
            @PathVariable("location") String location) {
        Collection<Glasses> glasses = mainService.findDispensedBetween(startDate.orElse(new Date(0)), endDate.orElse(new Date()), location);

        if (glasses.isEmpty())
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);

        return glasses;
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @RequestMapping(value = "/{location}/{sku}", method = RequestMethod.GET, produces = "application/json")
    public Glasses getGlasses(@PathVariable("sku") int sku, @PathVariable("location") String location) {
        Optional<Glasses> glasses = this.mainService.findAllBySkuAndLocation(sku, location);

        if (glasses.isEmpty())
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);

        return glasses.get();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @RequestMapping(value = "", method = RequestMethod.POST, produces = "application/json")
    public ResponseEntity<Glasses> addGlasses(@RequestBody @Valid Glasses glasses, BindingResult bindingResult,
            UriComponentsBuilder ucBuilder) {
        BindingErrorsResponse errors = new BindingErrorsResponse();
        HttpHeaders headers = new HttpHeaders();
        if (bindingResult.hasErrors() || (glasses == null)) {
            errors.addAllErrors(bindingResult);
            headers.add("errors", errors.toJSON());
            return new ResponseEntity<Glasses>(headers, HttpStatus.BAD_REQUEST);
        }

        headers.setLocation(ucBuilder.path("/api/glasses/{id}").buildAndExpand(glasses.getId()).toUri());

        return new ResponseEntity<Glasses>(this.mainService.saveGlasses(glasses), HttpStatus.CREATED);
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @RequestMapping(value = "/{location}/{sku}", method = RequestMethod.PUT, produces = "application/json")
    public ResponseEntity<Glasses> updateGlasses(@PathVariable("sku") int sku, @PathVariable("location") String location,
            @RequestBody @Valid Glasses glasses, BindingResult bindingResult) {
        BindingErrorsResponse errors = new BindingErrorsResponse();
        HttpHeaders headers = new HttpHeaders();
        if (bindingResult.hasErrors() || (glasses == null)) {
            errors.addAllErrors(bindingResult);
            headers.add("errors", errors.toJSON());
            return new ResponseEntity<>(headers, HttpStatus.BAD_REQUEST);
        }

        Optional<Glasses> currentGlasses = this.mainService.findAllBySkuAndLocation(sku, location);
        if (currentGlasses.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        currentGlasses.get().setGlassesSize(glasses.getGlassesSize());
        currentGlasses.get().setGlassesType(glasses.getGlassesType());
        currentGlasses.get().setAppearance(glasses.getAppearance());
        currentGlasses.get().setOd(glasses.getOd());
        currentGlasses.get().setOs(glasses.getOs());

        this.mainService.saveGlassesAfterEdit(currentGlasses.get());
        return new ResponseEntity<Glasses>(currentGlasses.get(), HttpStatus.OK);
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @RequestMapping(value = "/dispense/{location}/{sku}", method = RequestMethod.PUT, produces = "application/json")
    public ResponseEntity updateDispensed(@PathVariable("sku") int sku, @PathVariable("location") String location,
            @RequestBody Object glasses, BindingResult bindingResult) {
        BindingErrorsResponse errors = new BindingErrorsResponse();
        HttpHeaders headers = new HttpHeaders();
        if (bindingResult.hasErrors()) {
            errors.addAllErrors(bindingResult);
            headers.add("errors", errors.toJSON());
            return new ResponseEntity<>(headers, HttpStatus.BAD_REQUEST);
        }

        Optional<Glasses> currentGlasses;
        currentGlasses = this.mainService.findAllBySkuAndLocation(sku, location);

        if (currentGlasses.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "entity not found");
        }
        if (currentGlasses.get().isDispensed()) {
            // send 204 because content is not modified https://datatracker.ietf.org/doc/html/rfc7231#section-4.3.4
            throw new ResponseStatusException(HttpStatus.NO_CONTENT, "entity already dispensed");
        }

        currentGlasses.get().setDispensed(true);
        currentGlasses.get().getDispense().setModifyDate(new Date());
        currentGlasses.get().getDispense().setPreviousSku(currentGlasses.get().getSku());
        currentGlasses.get().setSku(null);

        this.mainService.saveGlassesAfterDispense(currentGlasses.get());
        return new ResponseEntity(HttpStatus.OK);
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @RequestMapping(value = "/undispense", method = RequestMethod.POST, produces = "application/json")
    public ResponseEntity undispense(@RequestBody @Valid Glasses glasses, BindingResult bindingResult) {
        BindingErrorsResponse errors = new BindingErrorsResponse();
        HttpHeaders headers = new HttpHeaders();
        if (bindingResult.hasErrors()) {
            errors.addAllErrors(bindingResult);
            headers.add("errors", errors.toJSON());
            return new ResponseEntity<>(headers, HttpStatus.BAD_REQUEST);
        }

        Optional<Glasses> currentGlasses = this.mainService.findGlassesById(glasses.getId());

        if (currentGlasses.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "entity not found");
        }
        if (!currentGlasses.get().isDispensed()) {
            // send 204 because content is not modified https://datatracker.ietf.org/doc/html/rfc7231#section-4.3.4
            throw new ResponseStatusException(HttpStatus.NO_CONTENT, "entity already undispensed");
        }
        Optional<Glasses> testGlasses = this.mainService.findAllBySkuAndLocation(currentGlasses.get().getDispense().getPreviousSku(),
                currentGlasses.get().getLocation());
        if (!testGlasses.isEmpty())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Previous SKU is already used");

        currentGlasses.get().setDispensed(false);
        currentGlasses.get().getDispense().setModifyDate(new Date());
        currentGlasses.get().setSku(currentGlasses.get().getDispense().getPreviousSku());
        currentGlasses.get().getDispense().setPreviousSku(null);

        this.mainService.saveGlassesAfterDispense(currentGlasses.get());
        return new ResponseEntity(HttpStatus.OK);
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @RequestMapping(value = "/{location}/{sku}", method = RequestMethod.DELETE, produces = "application/json")
    @Transactional
    public ResponseEntity<Void> deleteGlasses(@PathVariable("sku") int sku, @PathVariable("location") String location) {
        Optional<Glasses> glasses = this.mainService.findAllBySkuAndLocation(sku, location);
        if (glasses.isEmpty()) {
            return new ResponseEntity<Void>(HttpStatus.NOT_FOUND);
        }
        this.mainService.deleteGlasses(glasses.get());
        return new ResponseEntity<Void>(HttpStatus.NO_CONTENT);
    }

}
