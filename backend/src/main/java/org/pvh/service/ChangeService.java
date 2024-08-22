package org.pvh.service;

public interface ChangeService {
    String getHashValue(String location);

    void setNewHashValue(String location);
}
