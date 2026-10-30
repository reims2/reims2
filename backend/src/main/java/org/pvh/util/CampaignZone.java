package org.pvh.util;

import java.time.ZoneId;

public final class CampaignZone {
    // UTC-6 all year, the three letter "CST" would follow Chicago's daylight saving time
    public static final ZoneId ZONE = ZoneId.of("America/El_Salvador");

    private CampaignZone() {
    }
}
