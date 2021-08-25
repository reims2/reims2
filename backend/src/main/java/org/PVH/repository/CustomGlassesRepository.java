package org.PVH.repository;

import org.PVH.model.Glasses;

public interface CustomGlassesRepository {

    Glasses saveGlassesWithNextPossibleSKU(Glasses glasses, int min, int max);

}
