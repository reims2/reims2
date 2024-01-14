package org.pvh.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Pattern;

@Entity
@Table(name = "changevalue")
public class ChangeValue{
    @Id
    @Column(name = "hash_value")
    private String hashValue;

    @Column(name = "location")
    @Pattern(regexp = "sm|sa")
    private String location;

    public ChangeValue(String hashValue, String location) {
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

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    
}
