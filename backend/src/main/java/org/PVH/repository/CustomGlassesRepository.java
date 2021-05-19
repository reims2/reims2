package org.PVH.repository;

import org.PVH.model.Eye;
import org.PVH.model.Glasses;

public interface CustomGlassesRepository {

    void saveGlassesWithNextPossibleSKU(Glasses glasses, Eye OS, Eye OD);

}
