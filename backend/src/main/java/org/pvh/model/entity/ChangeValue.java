package org.pvh.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.pvh.model.enums.LocationEnum;

@Entity
@Table(name = "changevalue")
public class ChangeValue {
    @Id
    @Enumerated(EnumType.STRING)
    @Column(name = "location")
    private LocationEnum location;

    @Column(name = "hash_value")
    private String hashValue;

    public ChangeValue(String hashValue, LocationEnum location) {
        this.hashValue = hashValue;
        this.location = location;
    }

    public ChangeValue() {

    }


    public String getHashValue() {
        return hashValue;
    }

    public void setHashValue(String hashValue) {
        this.hashValue = hashValue;
    }

    public LocationEnum getLocation() {
        return location;
    }

    public void setLocation(LocationEnum location) {
        this.location = location;
    }


}
