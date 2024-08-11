package org.pvh.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

@Entity
@Table(name = "eye")
public class Eye extends BaseEntity {

    @Column(name = "sphere")
    @DecimalMin(value = "-30.0")
    @DecimalMax(value = "30.0")
    private BigDecimal sphere;

    @Column(name = "cylinder")
    @NegativeOrZero(message = "Cylinder must be negative")
    @DecimalMin(value = "-6.0", message = "Cylinder must be greater than -6 D")
    private BigDecimal cylinder;

    @Column(name = "axis")
    @PositiveOrZero(message = "Axis must be positive")
    @Max(value = 180)
    private int axis;

    @Column(name = "additional")
    @PositiveOrZero(message = "Additional must be positive")
    @DecimalMax(value = "8.0")
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
