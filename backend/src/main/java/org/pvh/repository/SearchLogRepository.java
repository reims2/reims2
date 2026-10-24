package org.pvh.repository;

import java.util.List;

import org.pvh.model.entity.SearchLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SearchLogRepository extends JpaRepository<SearchLog, Long> {

    List<SearchLog> findAllByLocationAndResultCount(String location, int resultCount);
}
