package org.pvh.security.model.entity;

import jakarta.persistence.*;
import org.pvh.security.model.enums.ERole;

@Entity
@Table(name = "roles")
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(length = 20)
    private String name;

    public Role() {

    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public ERole getName() {
        return Enum.valueOf(ERole.class, name);
    }

    public void setName(ERole name) {
        this.name = name.name();
    }
}
