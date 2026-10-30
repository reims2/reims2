package org.pvh.service;

import org.pvh.model.entity.ChangeValue;
import org.pvh.model.enums.LocationEnum;
import org.pvh.repository.ChangeValueRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class ChangeService {

    private final ChangeValueRepository changeValueRepository;

    public ChangeService(ChangeValueRepository changeValueRepository) {
        this.changeValueRepository = changeValueRepository;
    }

    public String getHashValue(LocationEnum location) {
        return changeValueRepository.findById(location).map(ChangeValue::getHashValue).orElseThrow();
    }

    public void setNewHashValue(LocationEnum location) {
        changeValueRepository.updateHashValue(location, UUID.randomUUID().toString());
    }

}
