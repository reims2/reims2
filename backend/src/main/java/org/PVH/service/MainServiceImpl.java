package org.PVH.service;

import java.util.Optional;

import org.PVH.model.Dispense;
import org.PVH.model.Eye;
import org.PVH.model.Glasses;
import org.PVH.repository.DispenseRepository;
import org.PVH.repository.EyeRepository;
import org.PVH.repository.GlassesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.orm.ObjectRetrievalFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service

public class MainServiceImpl implements MainService {

    private GlassesRepository glassesRepository;
    private EyeRepository eyeRepository;
    private DispenseRepository dispenseRepository;

    @Autowired
     public MainServiceImpl(GlassesRepository glassesRepository, EyeRepository eyeRepository, DispenseRepository dispenseRepository) {
        this.glassesRepository = glassesRepository;
        this.eyeRepository = eyeRepository;
        this.dispenseRepository = dispenseRepository;
    }



    @Override
    @Transactional
    public Optional<Glasses> findGlassesById(long glassesId) {
        Optional<Glasses> glasses = null;
        try {
            glasses = glassesRepository.findById(glassesId);
        } catch (ObjectRetrievalFailureException|EmptyResultDataAccessException e) {
            // just ignore not found exceptions for Jdbc/Jpa realization
            return null;
        }
        return glasses;
    }


    @Override
    @Transactional
    public Glasses saveGlasses(Glasses glasses) throws DataAccessException {
        Eye osid = eyeRepository.save(glasses.getOs());
        Eye odid = eyeRepository.save(glasses.getOd());
        Dispense dispense = glasses.getDispense();
        if(glasses.getDispense()!=null) {
            dispenseRepository.save(dispense);
        }

        return glassesRepository.saveGlassesWithNextPossibleSKU(glasses, osid, odid,dispense);
    }

    @Override
    @Transactional
    public void deleteGlasses(Glasses glasses) throws DataAccessException {
        glassesRepository.delete(glasses);
    }
    @Override
    public Optional<Glasses> findAllByIdAndLocation(long id,String location) {
        return glassesRepository.findAllByIdAndLocation(id,location);
    }


    @Override
    @Transactional
    public Page<Glasses> findAllGlasses(Pageable pageable) throws DataAccessException {
        return glassesRepository.findAll(pageable);
    }

    @Override
    @Transactional
    public Page<Glasses> findByGlassesContaining(String location, String glassesType, Pageable pageable) throws DataAccessException {
        return glassesRepository.findByGlassesTypeAndLocation(location,glassesType,pageable);
    }

    @Override
    public Page<Glasses> findAllByLocation(String location, Pageable pageable) throws DataAccessException {
        return glassesRepository.findAllByLocation(location,pageable);
    }

}
