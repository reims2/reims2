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

import org.friendsofasaprosa.model.Glasses;
import org.friendsofasaprosa.repository.GlassesRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Repository;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.util.Collection;

@Repository
@Profile("jpa")
public class JpaGlassesRepositoryImpl implements GlassesRepository {

    @PersistenceContext
    private EntityManager em;

	@Override
	public Glasses findById(int id) {
		return this.em.find(Glasses.class, id);
	}

	@SuppressWarnings("unchecked")
	@Override
	public Collection<Glasses> findAll() throws DataAccessException {
		return this.em.createQuery("SELECT s FROM Glasses s").getResultList();
	}

	@Override
	public void save(Glasses glasses) throws DataAccessException {
		if (glasses.getId() == null) {
		    this.em.persist(glasses);
        } else {
            this.em.merge(glasses);
        }
	}

	@Override
	public void delete(Glasses glasses) throws DataAccessException {
        this.em.remove(this.em.contains(glasses) ? glasses : this.em.merge(glasses));
	}

}
