/*
 * Copyright 2016-2018 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.friendsofasaprosa.rest;

import org.friendsofasaprosa.model.Glasses;
import org.friendsofasaprosa.service.MainService;
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
import java.util.ArrayList;
import java.util.Collection;



@RestController
@CrossOrigin(exposedHeaders = "errors, content-type")
@RequestMapping("api/glasses")
public class GlassesRestController {

	@Autowired
	private MainService mainService;

    @PreAuthorize( "hasRole(@roles.VET_ADMIN)" )
	@RequestMapping(value = "", method = RequestMethod.GET, produces = "application/json")
	public ResponseEntity<Collection<Glasses>> getAllGlasses(){
		Collection<Glasses> glasses = new ArrayList<Glasses>();
        glasses.addAll(this.mainService.findAllGlasses());
		if (glasses.isEmpty()){
			return new ResponseEntity<Collection<Glasses>>(HttpStatus.NOT_FOUND);
		}
		return new ResponseEntity<Collection<Glasses>>(glasses, HttpStatus.OK);
	}

    @PreAuthorize( "hasRole(@roles.VET_ADMIN)" )
	@RequestMapping(value = "/{glassesId}", method = RequestMethod.GET, produces = "application/json")
	public ResponseEntity<Glasses> getGlasses(@PathVariable("glassesId") int glassesId){
		Glasses glasses = this.mainService.findGlassesById(glassesId);
		if(glasses == null){
			return new ResponseEntity<Glasses>(HttpStatus.NOT_FOUND);
		}
		return new ResponseEntity<Glasses>(glasses, HttpStatus.OK);
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
		this.mainService.saveGlasses(glasses);
		headers.setLocation(ucBuilder.path("/api/glasses/{id}").buildAndExpand(glasses.getId()).toUri());
		return new ResponseEntity<Glasses>(glasses, headers, HttpStatus.CREATED);
	}

    @PreAuthorize( "hasRole(@roles.VET_ADMIN)" )
	@RequestMapping(value = "/{glassesId}", method = RequestMethod.PUT, produces = "application/json")
	public ResponseEntity<Glasses> updateGlasses(@PathVariable("glassesId") int glassedId, @RequestBody @Valid Glasses glasses, BindingResult bindingResult){
		BindingErrorsResponse errors = new BindingErrorsResponse();
		HttpHeaders headers = new HttpHeaders();
		if(bindingResult.hasErrors() || (glasses == null)){
			errors.addAllErrors(bindingResult);
			headers.add("errors", errors.toJSON());
			return new ResponseEntity<Glasses>(headers, HttpStatus.BAD_REQUEST);
		}
		Glasses currentGlasses = this.mainService.findGlassesById(glassedId);
		if(currentGlasses == null){
			return new ResponseEntity<Glasses>(HttpStatus.NOT_FOUND);
		}
		currentGlasses.setGlassesSize(glasses.getGlassesSize());
        currentGlasses.setGlassesType(glasses.getGlassesType());
        currentGlasses.setAppearance(glasses.getAppearance());
        currentGlasses.setMaterial(glasses.getMaterial());
        currentGlasses.setDispensed(glasses.isDispensed());
        currentGlasses.setGlassesSize(glasses.getGlassesSize());
        currentGlasses.setOD(glasses.getOD());
        currentGlasses.setOS(glasses.getOS());
        this.mainService.saveGlasses(currentGlasses);
		return new ResponseEntity<Glasses>(currentGlasses, HttpStatus.NO_CONTENT);
	}

    @PreAuthorize( "hasRole(@roles.VET_ADMIN)" )
	@RequestMapping(value = "/{glassesId}", method = RequestMethod.DELETE, produces = "application/json")
	@Transactional
	public ResponseEntity<Void> deleteVet(@PathVariable("glassesId") int glassesId){
		Glasses glasses = this.mainService.findGlassesById(glassesId);
		if(glasses == null){
			return new ResponseEntity<Void>(HttpStatus.NOT_FOUND);
		}
		this.mainService.deleteGlasses(glasses);
		return new ResponseEntity<Void>(HttpStatus.NO_CONTENT);
	}



}
