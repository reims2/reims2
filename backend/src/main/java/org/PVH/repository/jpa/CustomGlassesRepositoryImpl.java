package org.PVH.repository.jpa;

import org.PVH.model.Glasses;
import org.PVH.repository.CustomGlassesRepository;
import org.springframework.beans.factory.annotation.Autowired;

import javax.persistence.EntityManager;
import javax.transaction.Transactional;
import java.math.BigDecimal;

public class CustomGlassesRepositoryImpl implements CustomGlassesRepository {

    @Autowired
    private EntityManager entityManager;


    @Override
    @Transactional
    public Glasses saveGlassesWithNextPossibleSKU(Glasses glasses) {
        String query = "SELECT g.SKU + 1 AS FirstAvailableId FROM glasses g LEFT JOIN glasses g1 ON g1.SKU = g.SKU + 1 WHERE g1.SKU IS NULL ORDER BY g.SKU LIMIT 0, 1";
        BigDecimal nextSKU = (BigDecimal) entityManager.createNativeQuery(query).getSingleResult();

        glasses.setSku(nextSKU.longValue());
        entityManager.persist(glasses);
        entityManager.flush();
        return glasses;
    }

    @Override
    public Glasses saveGlassesWithNextPossibleSKUinSM(Glasses glasses) {
        String query = "SELECT g.SKU + 1 AS FirstAvailableId FROM glasses g LEFT JOIN glasses g1 ON g1.SKU = g.SKU + 1 WHERE g1.SKU IS NULL AND g.SKU > 5000 ORDER BY g.SKU LIMIT 0, 1";
        BigDecimal nextSKU = (BigDecimal) entityManager.createNativeQuery(query).getSingleResult();

        glasses.setSku(nextSKU.longValue());
        entityManager.persist(glasses);
        entityManager.flush();
        return glasses;
    }
}
