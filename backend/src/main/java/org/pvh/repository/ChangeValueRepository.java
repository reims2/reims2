package org.pvh.repository;

import org.pvh.model.entity.ChangeValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface ChangeValueRepository extends JpaRepository<ChangeValue, String> {
    @Transactional
    @Modifying
    @Query("UPDATE ChangeValue SET hashValue = :hashValue WHERE location = :location")
    void updateHashValue(String location, String hashValue);
}
