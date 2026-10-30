package org.pvh.model.enums;

public enum LocationEnum {
    sa(1, 5000), sm(5001, 10000); // NOSONAR

    private final int minSku;
    private final int maxSku;

    LocationEnum(int minSku, int maxSku) {
        this.minSku = minSku;
        this.maxSku = maxSku;
    }

    public int getMinSku() {
        return minSku;
    }

    public int getMaxSku() {
        return maxSku;
    }
}
