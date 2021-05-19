package org.PVH.repository.jpa;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

import org.PVH.model.User;
import org.PVH.repository.UserRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.dao.DataAccessException;

import org.springframework.stereotype.Repository;

@Repository
@Profile("jpa")
public class JpaUserRepositoryImpl implements UserRepository {

    @PersistenceContext
    private EntityManager em;

    @Override
    public void save(User user) throws DataAccessException {
        if (this.em.find(User.class, user.getUsername()) == null) {
            this.em.persist(user);
        } else {
            this.em.merge(user);
        }
    }
}
