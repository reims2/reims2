/*
 * Copyright 2016-2017 the original author or authors.
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

package org.friendsofasaprosa.repository.jpa;

import org.friendsofasaprosa.model.Eye;
import org.friendsofasaprosa.model.Glasses;
import org.friendsofasaprosa.repository.EyeRepository;
import org.friendsofasaprosa.repository.GlassesRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Repository;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.util.Collection;
import java.util.List;

@Repository
@Profile("jpa")
public class JpaEyeRepositoryImpl implements EyeRepository {

    @PersistenceContext
    private EntityManager em;

    @Override
    public Eye findById(int id) {
        return this.em.find(Eye.class, id);
    }

    @SuppressWarnings("unchecked")
    @Override
    public Collection<Eye> findAll() throws DataAccessException {
        return this.em.createQuery("SELECT eye.add,eye.axis,eye.cylinder,eye.sphere FROM Eye eye").getResultList();
    }

    @Override
    public void save(Eye eye) throws DataAccessException {
        if (eye.getId() == null) {
            this.em.persist(eye);
        } else {
            this.em.merge(eye);
        }

    }

    @SuppressWarnings("unchecked")
    @Override
    public void delete(Eye eye) throws DataAccessException {
        this.em.remove(this.em.contains(eye) ? eye : this.em.merge(eye));
        Integer eyeId = eye.getId();

        List<Glasses> glassesList = this.em.createQuery("SELECT glasses FROM Glasses glasses WHERE glasses.OD =" + eyeId + "or glasses.OS = "+ eyeId).getResultList();
        for (Glasses glasses : glassesList){
            this.em.createQuery("DELETE FROM Glasses glasses WHERE glasses.id=" + glasses.getId()).executeUpdate();
        }
        this.em.createQuery("DELETE FROM Eye eye WHERE eye.id=" + eyeId).executeUpdate();
    }
}
