package org.pvh.model.entity;

public class DispenseBoolean {
    public boolean isDispensed() {
        return dispensed;
    }

    public void setDispensed(boolean dispensed) {
        this.dispensed = dispensed;
    }

    private boolean dispensed;

    @Override
    public String toString() {
        return "DispenseBoolean [dispensed=" + dispensed + "]";
    }

}
