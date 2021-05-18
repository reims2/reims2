/*
 * Copyright 2002-2017 the original author or authors.
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
package org.friendsofasaprosa.service;

import java.util.Collection;

import org.friendsofasaprosa.model.Eye;
import org.friendsofasaprosa.model.Glasses;
import org.friendsofasaprosa.repository.EyeRepository;
import org.friendsofasaprosa.repository.GlassesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.orm.ObjectRetrievalFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Mostly used as a facade for all Petclinic controllers
 * Also a placeholder for @Transactional and @Cacheable annotations
 *
 * @author Michael Isvy
 * @author Vitaliy Fedoriv
 */
@Service

public class MainServiceImpl implements MainService {

    private GlassesRepository glassesRepository;
    private EyeRepository eyeRepository;

    @Autowired
     public MainServiceImpl(GlassesRepository glassesRepository, EyeRepository eyeRepository) {
        this.glassesRepository = glassesRepository;
        this.eyeRepository = eyeRepository;
    }



    @Override
    @Transactional
    public Glasses findGlassesById(int glassesId) {
        Glasses glasses = null;
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
    public Collection<Glasses> findAllGlasses() throws DataAccessException {
        return glassesRepository.findAll();
    }

    @Override
    @Transactional
    public void saveGlasses(Glasses glasses) throws DataAccessException {
        glassesRepository.save(glasses);
    }

    @Override
    @Transactional
    public void deleteGlasses(Glasses glasses) throws DataAccessException {
        glassesRepository.delete(glasses);
    }

    @Override
    @Transactional
    public Eye findEyeById(int eyeId) {
        return eyeRepository.findById(eyeId);
    }

    @Override
    @Transactional
    public Collection<Eye> findAllEyes() throws DataAccessException {
        return eyeRepository.findAll();
    }

    @Override
    @Transactional
    public void saveEye(Eye eye) throws DataAccessException {
        eyeRepository.save(eye);
    }

    @Override
    @Transactional
    public void deleteEye(Eye eye) throws DataAccessException {
        eyeRepository.delete(eye);
    }






}
