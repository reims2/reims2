package org.pvh.model.entity;

public class DispenseBoolean {
    private boolean dispensed;

    public boolean isDispensed() {
        return dispensed;
    }

    public void setDispensed(boolean dispensed) {
        this.dispensed = dispensed;
    }

    @Override
    public String toString() {
        return "DispenseBoolean [dispensed=" + dispensed + "]";
    }

}
