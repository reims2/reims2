package org.pvh.repository;

import org.pvh.model.entity.SearchLog;
import org.pvh.model.enums.LocationEnum;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SearchLogRepository extends JpaRepository<SearchLog, Long> {

    List<SearchLog> findAllByLocationAndResultCount(LocationEnum location, int resultCount);
}
