package org.pvh.repository;


import com.google.common.base.Optional;
import org.pvh.model.entity.ChangeValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChangeValueRepository extends JpaRepository<ChangeValue, Long> {
    Optional<List<ChangeValue>> findByLocation(String location);
}
