package org.pvh.repository;

import org.pvh.model.entity.Glasses;

public interface CustomGlassesRepository {

    Glasses saveGlassesWithNextPossibleSKU(Glasses glasses, int min, int max);

}
