package org.PVH.model;

import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.util.Date;

@Entity
@Table(name = "dispense")
public class Dispense extends BaseEntity {

    @UpdateTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "modify_date")
    private Date modifyDate;

    public Date getModifyDate() {
        return modifyDate;
    }

    public void setModifyDate(Date modify_date) {
        this.modifyDate = modify_date;
    }

}
