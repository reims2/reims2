package org.PVH.model;

import javax.persistence.*;

@Entity
@Table(name = "eye")
public class Eye extends BaseEntity{


    @Column(name = "sphere")
    private String sphere;

    @Column(name = "cylinder")
    private String cylinder;

    @Column(name = "axis")
    private String axis;

    @Column(name = "additional")
    private String add;


    public String getSphere() {
        return sphere;
    }

    public void setSphere(String sphere) {
        this.sphere = sphere;
    }

    public String getCylinder() {
        return cylinder;
    }

    public void setCylinder(String cylinder) {
        this.cylinder = cylinder;
    }

    public String getAxis() {
        return axis;
    }

    public void setAxis(String axis) {
        this.axis = axis;
    }

    public String getAdd() {
        return add;
    }

    public void setAdd(String add) {
        this.add = add;
    }
}
