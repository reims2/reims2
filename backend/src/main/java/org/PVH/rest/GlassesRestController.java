
package org.PVH.rest;

import org.PVH.model.DispenseBoolean;
import org.PVH.model.Glasses;
import org.PVH.service.MainService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import javax.transaction.Transactional;
import javax.validation.Valid;
import java.util.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Order;


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



    @PreAuthorize( "hasRole(@roles.VET_ADMIN)" )
	@RequestMapping(value = "/{location}", method = RequestMethod.GET, produces = "application/json")
	public ResponseEntity<Map<String, Object>> getAllGlassesPage(@RequestParam(required = false) String glassesType,
                                                             @RequestParam(defaultValue = "0") int page,
                                                             @RequestParam(defaultValue = "3") int size,
                                                             @RequestParam(defaultValue = "sku,desc") String[] sort,
                                                                 @PathVariable("location") String location){

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

        if (glassesType == null)
            pageGlasses = mainService.findAllByLocation(location,pagingSort);
        else
            pageGlasses = mainService.findByGlassesContaining(location,glassesType, pagingSort);

        glasses = pageGlasses.getContent();

        Map<String, Object> response = new HashMap<>();
        response.put("glasses", glasses);
        response.put("currentPage", pageGlasses.getNumber());
        response.put("totalItems", pageGlasses.getTotalElements());
        response.put("totalPages", pageGlasses.getTotalPages());

		if (glasses.isEmpty()){
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}
		return new ResponseEntity<>(response, HttpStatus.OK);
	}


    @PreAuthorize( "hasRole(@roles.VET_ADMIN)" )
	@RequestMapping(value = "/{location}/{glassesId}", method = RequestMethod.GET, produces = "application/json")
	public ResponseEntity<Glasses> getGlasses(@PathVariable("glassesId") long glassesId, @PathVariable("location") String location){
		Optional<Glasses> glasses = this.mainService.findAllByIdAndLocation(glassesId,location);
		if(glasses.isEmpty()){
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}
		return new ResponseEntity<Glasses>(glasses.get(), HttpStatus.OK);
	}

    @PreAuthorize( "hasRole(@roles.VET_ADMIN)" )
	@RequestMapping(value = "", method = RequestMethod.POST, produces = "application/json")
	public ResponseEntity<Glasses> addGlasses(@RequestBody @Valid Glasses glasses, BindingResult bindingResult, UriComponentsBuilder ucBuilder){
		BindingErrorsResponse errors = new BindingErrorsResponse();
		HttpHeaders headers = new HttpHeaders();
		if(bindingResult.hasErrors() || (glasses == null)){
			errors.addAllErrors(bindingResult);
			headers.add("errors", errors.toJSON());
			return new ResponseEntity<Glasses>(headers, HttpStatus.BAD_REQUEST);
		}

        headers.setLocation(ucBuilder.path("/api/glasses/{id}").buildAndExpand(glasses.getId()).toUri());


        return new ResponseEntity<Glasses>(this.mainService.saveGlasses(glasses),HttpStatus.CREATED);
	}

    @PreAuthorize( "hasRole(@roles.VET_ADMIN)" )
	@RequestMapping(value = "/{glassesId}", method = RequestMethod.PUT, produces = "application/json")
	public ResponseEntity<Glasses> updateGlasses(@PathVariable("glassesId") long glassedId, @RequestBody @Valid Glasses glasses, BindingResult bindingResult){
		BindingErrorsResponse errors = new BindingErrorsResponse();
		HttpHeaders headers = new HttpHeaders();
		if(bindingResult.hasErrors() || (glasses == null)){
			errors.addAllErrors(bindingResult);
			headers.add("errors", errors.toJSON());
			return new ResponseEntity<>(headers, HttpStatus.BAD_REQUEST);
		}

        Optional<Glasses>  currentGlasses = this.mainService.findGlassesById(glassedId);
		if(currentGlasses.isEmpty()){
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}
        currentGlasses.get().setId(glassedId);
		currentGlasses.get().setGlassesSize(glasses.getGlassesSize());
        currentGlasses.get().setGlassesType(glasses.getGlassesType());
        currentGlasses.get().setAppearance(glasses.getAppearance());
        currentGlasses.get().setLocation(glasses.getLocation());
        currentGlasses.get().setOd(glasses.getOd());
        currentGlasses.get().setOs(glasses.getOs());
        currentGlasses.get().setDispense(glasses.getDispense());
        currentGlasses.get().setDispensed(glasses.isDispensed());
        this.mainService.saveGlasses(currentGlasses.get());
		return new ResponseEntity<Glasses>(currentGlasses.get(), HttpStatus.OK);
	}

    @PreAuthorize( "hasRole(@roles.VET_ADMIN)" )
    @RequestMapping(value = "/dispense/{glassesId}", method = RequestMethod.PUT, produces = "application/json")
    public ResponseEntity<DispenseBoolean> updateDispensed(@PathVariable("glassesId") long glassesId, @RequestBody @Valid DispenseBoolean dispensed, BindingResult bindingResult){
        BindingErrorsResponse errors = new BindingErrorsResponse();
        HttpHeaders headers = new HttpHeaders();
        if(bindingResult.hasErrors()){
            errors.addAllErrors(bindingResult);
            headers.add("errors", errors.toJSON());
            return new ResponseEntity<>(headers, HttpStatus.BAD_REQUEST);
        }

        Optional<Glasses>  currentGlasses = this.mainService.findGlassesById(glassesId);
        if(currentGlasses.isEmpty()){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        currentGlasses.get().setDispensed(dispensed.isDispensed());
        currentGlasses.get().getDispense().setModifyDate(new Date());
        this.mainService.saveGlasses(currentGlasses.get());
        return new ResponseEntity<DispenseBoolean>(dispensed,HttpStatus.OK);
    }


    @PreAuthorize( "hasRole(@roles.VET_ADMIN)" )
	@RequestMapping(value = "/{glassesId}", method = RequestMethod.DELETE, produces = "application/json")
	@Transactional
	public ResponseEntity<Void> deleteGlasses(@PathVariable("glassesId") int glassesId){
		Optional<Glasses> glasses = this.mainService.findGlassesById(glassesId);
		if(glasses.isEmpty()){
			return new ResponseEntity<Void>(HttpStatus.NOT_FOUND);
		}
		this.mainService.deleteGlasses(glasses.get());
		return new ResponseEntity<Void>(HttpStatus.NO_CONTENT);
	}



}
