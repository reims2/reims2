package org.PVH.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

@Entity
@Table(name = "eye")
public class Eye extends BaseEntity {

    @Column(name = "sphere")
    private float sphere;

    @Column(name = "cylinder")
    private float cylinder;

    @Column(name = "axis")
    private int axis;

    @Column(name = "additional")
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
