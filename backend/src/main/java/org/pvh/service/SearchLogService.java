package org.pvh.service;

import org.pvh.model.entity.SearchLog;
import org.pvh.model.enums.LocationEnum;
import org.pvh.repository.SearchLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SearchLogService {

    private final SearchLogRepository searchLogRepository;

    public SearchLogService(SearchLogRepository searchLogRepository) {
        this.searchLogRepository = searchLogRepository;
    }

    public SearchLog save(SearchLog search) {
        return searchLogRepository.save(search);
    }

    public List<SearchLog> findUnsuccessful(LocationEnum location) {
        return searchLogRepository.findAllByLocationAndResultCount(location, 0);
    }
}
