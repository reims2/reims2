package org.pvh.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.pvh.model.enums.LocationEnum;

// only read and written through ChangeValueRepository's queries
@Entity
@Table(name = "changevalue")
public class ChangeValue {
    @Id
    @Enumerated(EnumType.STRING)
    @Column(name = "location")
    private LocationEnum location;

    @Column(name = "hash_value")
    private String hashValue;
}
