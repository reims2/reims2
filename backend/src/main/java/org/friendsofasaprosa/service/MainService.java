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
import org.springframework.dao.DataAccessException;


/**
 * Mostly used as a facade so all controllers have a single point of entry
 *
 * @author Michael Isvy
 * @author Vitaliy Fedoriv
 */
public interface MainService {

    Glasses findGlassesById(int glassesId);
    Collection<Glasses> findAllGlasses() throws DataAccessException;
    void saveGlasses(Glasses glasses) throws DataAccessException;
    void deleteGlasses(Glasses glasses) throws DataAccessException;

    Eye findEyeById(int eyeId);
    Collection<Eye> findAllEyes() throws DataAccessException;
    void saveEye(Eye eye) throws DataAccessException;
    void deleteEye(Eye eye) throws DataAccessException;

}
