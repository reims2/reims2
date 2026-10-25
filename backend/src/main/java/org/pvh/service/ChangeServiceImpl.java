package org.pvh.service;

import com.google.common.hash.Hashing;
import org.pvh.error.PVHException;
import org.pvh.model.entity.ChangeValue;
import org.pvh.repository.ChangeValueRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class ChangeServiceImpl implements ChangeService {

    private final ChangeValueRepository changeValueRepository;

    public ChangeServiceImpl(ChangeValueRepository changeValueRepository) {
        this.changeValueRepository = changeValueRepository;
    }

    public String getHashValue(String location) {
        return changeValueRepository.findById(location).map(ChangeValue::getHashValue)
            .orElseThrow(() -> new PVHException("Unknown location", HttpStatus.NOT_FOUND));
    }

    public void setNewHashValue(String location) {
        changeValueRepository.updateHashValue(location, calcHash());
    }

    private String calcHash() {
        return Hashing.sha256().hashString("" + ThreadLocalRandom.current().nextDouble(), StandardCharsets.UTF_8).toString();
    }

}
