package org.pvh.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.math.BigDecimal;

// validated as EyeDTO at the API boundary
@Entity
@Table(name = "eye")
public class Eye extends BaseEntity {

    @Column(name = "sphere")
    private BigDecimal sphere;

    @Column(name = "cylinder")
    private BigDecimal cylinder;

    @Column(name = "axis")
    private int axis;

    @Column(name = "additional")
    private BigDecimal add;

    public Eye() {
    }

    public Eye(BigDecimal sphere, BigDecimal cylinder, int axis, BigDecimal add) {
        this.sphere = sphere;
        this.cylinder = cylinder;
        this.axis = axis;
        this.add = add;
    }

    public BigDecimal getSphere() {
        return sphere;
    }

    public void setSphere(BigDecimal sphere) {
        this.sphere = sphere;
    }

    public BigDecimal getCylinder() {
        return cylinder;
    }

    public void setCylinder(BigDecimal cylinder) {
        this.cylinder = cylinder;
    }

    public int getAxis() {
        return axis;
    }

    public void setAxis(int axis) {
        this.axis = axis;
    }

    public BigDecimal getAdd() {
        return add;
    }

    public void setAdd(BigDecimal add) {
        this.add = add;
    }

    @Override
    public String toString() {
        return "Eye [sphere=" + sphere + ", cylinder=" + cylinder + ", axis=" + axis + ", add=" + add + "]";
    }

}
