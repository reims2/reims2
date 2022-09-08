package org.PVH.repository;

import org.PVH.model.Glasses;
import org.springframework.data.jpa.repository.Lock;

import javax.persistence.LockModeType;

public interface CustomGlassesRepository {

    Glasses saveGlassesWithNextPossibleSKU(Glasses glasses, int min, int max);

}
