package org.PVH.model;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

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
