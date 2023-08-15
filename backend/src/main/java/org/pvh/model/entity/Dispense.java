package org.pvh.model.entity;

import javax.persistence.*;
import org.pvh.model.enums.DispenseReasonEnum;
import java.util.Date;

@Entity
@Table(name = "dispense")
public class Dispense extends BaseEntity {

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "modify_date")
    private Date modifyDate;

    @Column(name = "previous_sku")
    private Integer previousSku;

    @Column(name = "dispense_reason")
    private String dispenseReason;

    public Dispense(Date modifyDate, String dispenseReason) {
        this.modifyDate = modifyDate;
        this.dispenseReason = dispenseReason;
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

    public DispenseReasonEnum getDispenseReason() {
        return dispenseReason != null ? Enum.valueOf(DispenseReasonEnum.class, dispenseReason) : null;
    }

    public void setDispenseReason(DispenseReasonEnum dispenseReason) {
        this.dispenseReason = dispenseReason != null ? dispenseReason.name() : null;
    }

    @Override
    public String toString() {
        return "Dispense [modifyDate=" + modifyDate + ", previousSku=" + previousSku + ", dispenseReason="
                + dispenseReason + "]";
    }
    
}
