package org.PVH.repository.jpa;

import org.PVH.model.Glasses;
import org.PVH.repository.CustomGlassesRepository;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigInteger;

import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.transaction.Transactional;

public class CustomGlassesRepositoryImpl implements CustomGlassesRepository {

    @Autowired
    private EntityManager entityManager;

    @Override
    @Transactional
    public Glasses saveGlassesWithNextPossibleSKU(Glasses glasses, int min, int max) {
        String query = "SELECT g.SKU + 1 AS FirstAvailableId FROM glasses g LEFT JOIN glasses g1 ON g1.SKU = g.SKU + 1 "
                + "WHERE g1.SKU IS NULL AND g.SKU >= " + min + " AND g.SKU < " + max + "  ORDER BY g.SKU LIMIT 0, 1";

        Integer nextSKU;
        try {
            // JPA returns BigInteger even though it really is just a java int => convert it
            nextSKU = ((BigInteger) entityManager.createNativeQuery(query).getSingleResult()).intValue();
        } catch (NoResultException e) {
            // either no glasses entered yet or all full. find it out!
            boolean hasEntry = entityManager.createQuery("SELECT sku FROM Glasses WHERE sku = " + min).getResultList().size() > 0;
            if (hasEntry)
                throw e; // todo better error handling when DB is full!
            else
                nextSKU = min;
        }
        
        glasses.setSku(nextSKU);

        entityManager.persist(glasses);
        entityManager.flush();
        return glasses;
    }

}
