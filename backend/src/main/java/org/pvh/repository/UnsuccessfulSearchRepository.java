package org.pvh.repository;

import org.pvh.model.entity.UnsuccessfulSearch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UnsuccessfulSearchRepository extends JpaRepository<UnsuccessfulSearch, Long> {

}
