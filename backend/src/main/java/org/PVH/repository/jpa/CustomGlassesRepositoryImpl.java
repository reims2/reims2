package org.PVH.repository.jpa;

import java.math.BigInteger;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.Date;

import javax.persistence.EntityManager;
import javax.persistence.LockModeType;
import javax.persistence.NoResultException;
import javax.persistence.Query;
import javax.transaction.Transactional;

import org.PVH.model.Glasses;
import org.PVH.repository.CustomGlassesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.Lock;

public class CustomGlassesRepositoryImpl implements CustomGlassesRepository {

    @Autowired
    private EntityManager entityManager;

    @Override
    @Transactional
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    public Glasses saveGlassesWithNextPossibleSKU(Glasses glasses, int min, int max) {
        Query query = entityManager.createQuery("SELECT sku FROM Glasses WHERE sku = :min" );
        query.setParameter("min",min);
        boolean minimumUsed = query.getResultList().size() > 0;


        // If the smallest possible SKU is still free, just use it. This is important because otherwise this number will be left out
        Integer nextSKU = min;

        if (minimumUsed) {
            // otherwise find the next free SKU in the database
            Query findNextSKUQuery = entityManager.createNativeQuery("SELECT g.SKU + 1 AS FirstAvailableId FROM glasses g LEFT JOIN glasses g1 ON g1.SKU = g.SKU + 1 "
                + "WHERE g1.SKU IS NULL AND g.SKU >= :min AND g.SKU < :max  ORDER BY g.SKU LIMIT 0, 1");
            findNextSKUQuery.setParameter("min",min);
            findNextSKUQuery.setParameter("max",max);

            try {
                // JPA returns BigInteger even though it really is just a java int => convert it
                nextSKU = ((BigInteger) findNextSKUQuery.getSingleResult()).intValue();
            } catch (NoResultException e) {
                // all SKUs used, todo add some better error message in the future, for now
                // throw exception
                throw e;
            }
        }
        glasses.setSku(nextSKU);
        glasses.setCreationDate(new Date());

        entityManager.persist(glasses);
        entityManager.flush();
        return glasses;
    }

}
