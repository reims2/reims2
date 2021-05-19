package org.PVH.repository.jpa;

import org.PVH.model.Dispense;
import org.PVH.model.Eye;
import org.PVH.model.Glasses;
import org.PVH.repository.CustomGlassesRepository;
import org.springframework.beans.factory.annotation.Autowired;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import javax.transaction.Transactional;
import java.math.BigDecimal;
import java.math.BigInteger;

public class CustomGlassesRepositoryImpl implements CustomGlassesRepository {

    @Autowired
    private EntityManager entityManager;


    @Override
    @Transactional
    public void saveGlassesWithNextPossibleSKU(Glasses glasses, Eye OS, Eye OD, Dispense dispense) {
        String query = "SELECT g.SKU + 1 AS FirstAvailableId FROM glasses g LEFT JOIN glasses g1 ON g1.SKU = g.SKU + 1 WHERE g1.SKU IS NULL ORDER BY g.SKU LIMIT 0, 1";

        BigDecimal nextSKU = (BigDecimal) entityManager.createNativeQuery(query).getSingleResult();

        entityManager.createNativeQuery("INSERT INTO glasses ( glasses_type, glasses_size, appearance,location, SKU ,OS_ID, OD_ID, dispense_id) VALUES (?,?,?,?,?,?,?,?)")
            .setParameter(1, glasses.getGlassesType())
            .setParameter(2, glasses.getGlassesSize())
            .setParameter(3, glasses.getAppearance())
            .setParameter(4, glasses.getLocation())
            .setParameter(5, nextSKU.longValue())
            .setParameter(6, OS.getId())
            .setParameter(7,OD.getId())
            .setParameter(8,dispense.getId())
            .executeUpdate();

        entityManager.flush();

    }
}
