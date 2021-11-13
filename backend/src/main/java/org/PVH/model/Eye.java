package org.PVH.model;

import java.math.BigDecimal;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.validation.constraints.DecimalMax;
import javax.validation.constraints.DecimalMin;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NegativeOrZero;
import javax.validation.constraints.PositiveOrZero;
import javax.validation.constraints.Size;

import org.springframework.security.access.prepost.PostAuthorize;

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
}
