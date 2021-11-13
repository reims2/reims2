package org.PVH.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.validation.constraints.Min;
import javax.validation.constraints.NegativeOrZero;
import javax.validation.constraints.Size;

@Entity
@Table(name = "eye")
public class Eye extends BaseEntity {

    @Column(name = "sphere")
    @Size(min = -30, max = 30, message = "Sphere must be between -30 and 30 D")
    private float sphere;

    @Column(name = "cylinder")
    @NegativeOrZero(message = "Cylinder must be negative")
    @Min(value = -6, message = "Cylinder must be greater than -6 D")
    private float cylinder;

    @Column(name = "axis")
    @Size(min = 0, max = 180, message = "Axis must be between 0 and 180")
    private int axis;

    @Column(name = "additional")
    @Size(min = 0, max = 8)
    private float add;

    public float getSphere() {
        return sphere;
    }

    public void setSphere(float sphere) {
        this.sphere = sphere;
    }

    public float getCylinder() {
        return cylinder;
    }

    public void setCylinder(float cylinder) {
        this.cylinder = cylinder;
    }

    public int getAxis() {
        return axis;
    }

    public void setAxis(int axis) {
        this.axis = axis;
    }

    public float getAdd() {
        return add;
    }

    public void setAdd(float add) {
        this.add = add;
    }
}
