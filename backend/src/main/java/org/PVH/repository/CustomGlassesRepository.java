package org.PVH.repository;

import org.PVH.model.Dispense;
import org.PVH.model.Eye;
import org.PVH.model.Glasses;

public interface CustomGlassesRepository {

    Glasses saveGlassesWithNextPossibleSKU(Glasses glasses);

}
