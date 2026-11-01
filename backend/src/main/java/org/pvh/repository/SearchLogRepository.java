package org.pvh.repository;

import org.pvh.model.entity.SearchLog;
import org.pvh.model.enums.LocationEnum;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SearchLogRepository extends JpaRepository<SearchLog, Long> {

    @EntityGraph(attributePaths = {"od", "os"})
    List<SearchLog> findAllByLocationAndResultCount(LocationEnum location, int resultCount);
}
