package org.pvh.repository;


import java.util.List;

import org.pvh.model.entity.ChangeValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.google.common.base.Optional;

@Repository
public interface ChangeValueRepository extends JpaRepository<ChangeValue, Long> {
    Optional<List<ChangeValue>> findByLocation(String location);
}
