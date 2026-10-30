package org.pvh.model.entity;

import jakarta.persistence.*;
import org.pvh.model.enums.DispenseReasonEnum;

import java.time.Instant;

@Entity
@Table(name = "dispense")
public class Dispense extends BaseEntity {

    @Column(name = "modify_date")
    private Instant modifyDate;
    @Column(name = "previous_sku")
    private Integer previousSku;
    @Enumerated(EnumType.STRING)
    @Column(name = "dispense_reason")
    private DispenseReasonEnum dispenseReason;

    public Instant getModifyDate() {
        return modifyDate;
    }

    public void setModifyDate(Instant modifyDate) {
        this.modifyDate = modifyDate;
    }

    public Integer getPreviousSku() {
        return previousSku;
    }

    public void setPreviousSku(Integer previousSku) {
        this.previousSku = previousSku;
    }

    public DispenseReasonEnum getDispenseReason() {
        return dispenseReason;
    }

    public void setDispenseReason(DispenseReasonEnum dispenseReason) {
        this.dispenseReason = dispenseReason;
    }

    @Override
    public String toString() {
        return "Dispense [modifyDate=" + modifyDate + ", previousSku=" + previousSku + ", dispenseReason="
            + dispenseReason + "]";
    }

}
