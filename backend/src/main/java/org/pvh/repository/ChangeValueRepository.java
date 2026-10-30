package org.pvh.repository;

import org.pvh.model.entity.ChangeValue;
import org.pvh.model.enums.LocationEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

public interface ChangeValueRepository extends JpaRepository<ChangeValue, LocationEnum> {
    @Transactional
    @Modifying
    @Query("UPDATE ChangeValue SET hashValue = :hashValue WHERE location = :location")
    void updateHashValue(LocationEnum location, String hashValue);
}
