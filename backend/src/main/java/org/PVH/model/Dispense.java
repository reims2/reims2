package org.PVH.model;

import javax.persistence.*;
import java.util.Date;

@Entity
@Table(name = "dispense")
public class Dispense extends BaseEntity {

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "modify_date")
    private Date modifyDate;

    @Column(name = "previous_sku")
    private Integer previousSku;

    public Dispense(Date modifyDate) {
        this.modifyDate = modifyDate;
    }

    public Dispense() {

    }

    public Date getModifyDate() {
        return modifyDate;
    }

    public void setModifyDate(Date modify_date) {
        this.modifyDate = modify_date;
    }

    public Integer getPreviousSku() {
        return previousSku;
    }

    public void setPreviousSku(Integer previousSku) {
        this.previousSku = previousSku;
    }
}
