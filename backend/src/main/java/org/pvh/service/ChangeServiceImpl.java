package org.pvh.service;

import java.nio.charset.StandardCharsets;

import org.pvh.model.entity.ChangeValue;
import org.pvh.repository.ChangeValueRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.google.common.hash.Hashing;

@Service
public class ChangeServiceImpl implements ChangeService {
    Logger logger = LoggerFactory.getLogger(ChangeServiceImpl.class);

    @Autowired
    private ChangeValueRepository changeValueRepository;

    public ChangeServiceImpl(ChangeValueRepository changeValueRepository) {
        this.changeValueRepository = changeValueRepository;
    }

    public String getHashValue(String location) {
        if (changeValueRepository.findByLocation(location).get().isEmpty()) {
            String hashValue = calcHash();
            logger.info("HashValue is null, new hash value is calculated: " + hashValue + " for location: " + location);
            changeValueRepository.save(new ChangeValue(hashValue, location));
            return hashValue;
        }
        return changeValueRepository.findByLocation(location).get().get(0).getHashValue();
    }

    public void setNewHashValue(String location) {
        ChangeValue changeValue = changeValueRepository.findByLocation(location).get().isEmpty() ? null
                : changeValueRepository.findByLocation(location).get().get(0);

        if (changeValue != null) {
            changeValueRepository.delete(changeValue);
            logger.debug("ChangeValue at location " + location + " has been deleted");
        }

        changeValueRepository.save(new ChangeValue(calcHash(), location));
        logger.debug("A new hash value has been calculated");
    }

    private String calcHash() {
        return Hashing.sha256().hashString("" + Math.random(), StandardCharsets.UTF_8).toString();
    }

}
