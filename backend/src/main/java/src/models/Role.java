package src.models;

import jakarta.persistence.*;

@Entity
@Table(name = "roles")
public class Role {

    @Id
   @Column(name = "name", nullable = false, length = 255)
    private String name;

    public Role() {
    }

    public Role(String name) {
        this.name = name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}