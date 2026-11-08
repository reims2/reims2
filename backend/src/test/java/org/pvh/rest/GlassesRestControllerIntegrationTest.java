package org.pvh.rest;

import com.jayway.jsonpath.JsonPath;
import tools.jackson.databind.ObjectMapper;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.pvh.IntegrationTest;
import org.pvh.model.dto.EyeDTO;
import org.pvh.model.dto.GlassesRequestDTO;
import org.pvh.model.entity.Eye;
import org.pvh.model.entity.Glasses;
import org.pvh.model.entity.SearchLog;
import org.pvh.model.enums.AppearanceEnum;
import org.pvh.model.enums.BalLensEnum;
import org.pvh.model.enums.DispenseReasonEnum;
import org.pvh.model.enums.GlassesSizeEnum;
import org.pvh.model.enums.GlassesTypeEnum;
import org.pvh.repository.GlassesRepository;
import org.pvh.repository.SearchLogRepository;
import org.pvh.service.GlassesService;
import org.pvh.model.enums.LocationEnum;
import org.pvh.util.CampaignZone;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@IntegrationTest
@WithMockUser(roles = "USER")
public class GlassesRestControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private GlassesService mainService;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private SearchLogRepository searchLogRepository;

    @Autowired
    private GlassesRepository glassesRepository;

    private static final String VALID_EYE = "{\"sphere\":1,\"cylinder\":-1,\"axis\":10,\"add\":1}";

    private static Eye eye() {
        return new Eye(BigDecimal.ONE, BigDecimal.valueOf(-2), 2, BigDecimal.ONE);
    }

    private static Glasses newGlasses(GlassesTypeEnum type, GlassesSizeEnum size, AppearanceEnum appearance, LocationEnum location) {
        return new Glasses(type, size, appearance, location, eye(), eye());
    }

    private static GlassesRequestDTO request(Glasses glasses) {
        return new GlassesRequestDTO(glasses.getGlassesType(), glasses.getGlassesSize(), glasses.getAppearance(),
            glasses.getLocation(), EyeDTO.from(glasses.getOs()), EyeDTO.from(glasses.getOd()));
    }

    private Glasses saveGlasses(LocationEnum location) {
        return mainService.saveGlasses(newGlasses(GlassesTypeEnum.multifocal, GlassesSizeEnum.medium, AppearanceEnum.neutral, location));
    }

    // as if the pair was dispensed before the freed SKU hold
    private void endHold(Glasses dispensed) {
        jdbcTemplate.update("UPDATE dispense SET modify_date = modify_date - INTERVAL 11 MINUTE WHERE id = ?",
            dispensed.getDispense().getId());
    }

    private String hash(String location) throws Exception {
        return mockMvc.perform(get("/api/glasses/" + location + "/all")).andReturn().getResponse().getHeader(HttpHeaders.ETAG);
    }

    @Test
    public void allGlasses_NotModified_WhileETagIsCurrent() throws Exception {
        saveGlasses(LocationEnum.sa);
        String etag = hash("sa");

        mockMvc.perform(get("/api/glasses/sa/all").header(HttpHeaders.IF_NONE_MATCH, etag))
            .andExpect(status().isNotModified())
            .andExpect(header().string(HttpHeaders.ETAG, etag))
            .andExpect(content().string(""));
        // proxies that compress may weaken the tag
        mockMvc.perform(get("/api/glasses/sa/all").header(HttpHeaders.IF_NONE_MATCH, "W/" + etag))
            .andExpect(status().isNotModified());
        mockMvc.perform(get("/api/glasses/sa/all").header(HttpHeaders.IF_NONE_MATCH, "\"stale\""))
            .andExpect(status().isOk())
            .andExpect(header().string(HttpHeaders.ETAG, etag))
            .andExpect(jsonPath("$").isArray());

        saveGlasses(LocationEnum.sa);
        mockMvc.perform(get("/api/glasses/sa/all").header(HttpHeaders.IF_NONE_MATCH, etag))
            .andExpect(status().isOk())
            .andExpect(header().string(HttpHeaders.ETAG, not(etag)));
    }

    @Test
    public void givenGlasses_Dispense_And_Undispense()
        throws Exception {

        Glasses saveEntitySa = saveGlasses(LocationEnum.sa);

        String cv = hash("sa");
        // Get create Glasses
        this.mockMvc.perform(get("/api/glasses/sa/" + saveEntitySa.getSku()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.sku", Matchers.is(saveEntitySa.getSku())))
            .andExpect(jsonPath("$.glassesType", Matchers.is(saveEntitySa.getGlassesType().name())))
            .andExpect(jsonPath("$.glassesSize", Matchers.is(saveEntitySa.getGlassesSize().name())))
            .andExpect(jsonPath("$.dispensed", Matchers.is(false)))
            .andExpect(jsonPath("$.appearance", Matchers.is(saveEntitySa.getAppearance().name())))
            .andExpect(jsonPath("$.os.cylinder", Matchers.is(saveEntitySa.getOs().getCylinder().doubleValue())))
            .andExpect(jsonPath("$.od.cylinder", Matchers.is(saveEntitySa.getOd().getCylinder().doubleValue())));

        // Dispense created Glasses for first time
        this.mockMvc.perform(put("/api/glasses/" + saveEntitySa.getId() + "/dispense"))
            .andExpect(status().isOk());

        assertNotEquals(cv, hash("sa"));

        // Dispense created Glasses for second time --> nothing to change
        cv = hash("sa");
        this.mockMvc.perform(put("/api/glasses/" + saveEntitySa.getId() + "/dispense"))
            .andExpect(status().isNoContent());
        assertEquals(cv, hash("sa"));
        // Dispense non existing Glasses
        this.mockMvc.perform(put("/api/glasses/-1/dispense"))
            .andExpect(status().isNotFound());
        assertEquals(cv, hash("sa"));

        // try to get created Glasses
        this.mockMvc.perform(get("/api/glasses/sa/" + saveEntitySa.getSku()))
            .andExpect(status().isNotFound())
            .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON));

        // check if created Glasses is dispensed
        this.mockMvc.perform(get("/api/glasses/dispensed/sa"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.[0].location", Matchers.is("sa")))
            .andExpect(jsonPath("$.[0].glassesType", Matchers.is(saveEntitySa.getGlassesType().name())))
            .andExpect(jsonPath("$.[0].glassesSize", Matchers.is(saveEntitySa.getGlassesSize().name())))
            .andExpect(jsonPath("$.[0].dispensed", Matchers.is(true)))
            .andExpect(jsonPath("$.[0].appearance", Matchers.is(saveEntitySa.getAppearance().name())))
            .andExpect(jsonPath("$.[0].os.cylinder", Matchers.is(saveEntitySa.getOs().getCylinder()
                        .doubleValue())))
            .andExpect(jsonPath("$.[0].od.cylinder", Matchers.is(saveEntitySa.getOd().getCylinder()
                        .doubleValue())));

        endHold(saveEntitySa);
        Glasses saveEntitySa2 = saveGlasses(LocationEnum.sa);
        assertEquals(saveEntitySa.getSku(), saveEntitySa2.getSku());

        cv = hash("sa");
        // Try to Undispense firstly created glass -> not possible because of secondly
        // created glass
        this.mockMvc.perform(put("/api/glasses/" + saveEntitySa.getId() + "/undispense"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.detail", Matchers.is("SKU %04d is already used by other glasses.".formatted(saveEntitySa.getSku()))));
        assertEquals(cv, hash("sa"));

        // dispense secondly created glass
        this.mockMvc.perform(put("/api/glasses/" + saveEntitySa2.getId() + "/dispense"))
            .andExpect(status().isOk());
        assertNotEquals(cv, hash("sa"));

        // undispense secondly created glass
        cv = hash("sa");
        this.mockMvc.perform(put("/api/glasses/" + saveEntitySa2.getId() + "/undispense"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.sku", Matchers.is(saveEntitySa2.getSku())))
            .andExpect(jsonPath("$.dispensed", Matchers.is(false)));
        assertNotEquals(cv, hash("sa"));
        // undispense must not leave the old reason behind
        assertNull(glassesRepository.findById(saveEntitySa2.getId()).orElseThrow().getDispense().getDispenseReason());

        // undispense secondly created glass second time
        cv = hash("sa");
        this.mockMvc.perform(put("/api/glasses/" + saveEntitySa2.getId() + "/undispense"))
            .andExpect(status().isNoContent());
        assertEquals(cv, hash("sa"));
        // undispense empty glasss
        this.mockMvc.perform(put("/api/glasses/fsdg/undispense"))
            .andExpect(status().isBadRequest());
        assertEquals(cv, hash("sa"));
        // undispense wrong id glasss
        this.mockMvc.perform(put("/api/glasses/-1/undispense"))
            .andExpect(status().isNotFound());
        assertEquals(cv, hash("sa"));

        this.mockMvc.perform(get("/api/glasses/sa/" + saveEntitySa2.getSku()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.sku", Matchers.is(saveEntitySa2.getSku())))
            .andExpect(jsonPath("$.glassesType", Matchers.is(saveEntitySa2.getGlassesType().name())))
            .andExpect(jsonPath("$.glassesSize", Matchers.is(saveEntitySa2.getGlassesSize().name())))
            .andExpect(jsonPath("$.dispensed", Matchers.is(false)))
            .andExpect(jsonPath("$.appearance", Matchers.is(saveEntitySa2.getAppearance().name())))
            .andExpect(jsonPath("$.os.cylinder", Matchers.is(saveEntitySa2.getOs().getCylinder().doubleValue())))
            .andExpect(jsonPath("$.od.cylinder", Matchers.is(saveEntitySa2.getOd().getCylinder().doubleValue())));
    }

    // a dispense queued offline may replay after another device dispensed the same pair
    @Test
    public void dispense_twice_keepsTheFirstDispense()
        throws Exception {
        Glasses glasses = saveGlasses(LocationEnum.sa);

        this.mockMvc.perform(put("/api/glasses/" + glasses.getId() + "/dispense").param("reason", "BROKEN"))
            .andExpect(status().isOk());
        this.mockMvc.perform(put("/api/glasses/" + glasses.getId() + "/dispense"))
            .andExpect(status().isNoContent());

        Glasses dispensed = glassesRepository.findById(glasses.getId()).orElseThrow();
        assertTrue(dispensed.isDispensed());
        assertEquals(DispenseReasonEnum.BROKEN, dispensed.getDispense().getDispenseReason());
        assertEquals(glasses.getSku(), dispensed.getDispense().getPreviousSku());
    }

    @Test
    public void addGlasses_thenStatus201() throws Exception {
        Glasses glasses = newGlasses(GlassesTypeEnum.multifocal, GlassesSizeEnum.small, AppearanceEnum.neutral, LocationEnum.sm);

        Glasses failGlasses = newGlasses(GlassesTypeEnum.multifocal, GlassesSizeEnum.small, AppearanceEnum.neutral, LocationEnum.sm);

        String cv = hash("sm");

        for (int i = 0; i < 2; i++) {
            this.mockMvc.perform(post("/api/glasses").contentType(MediaType.APPLICATION_JSON).content(
                    objectMapper.writeValueAsBytes(request(glasses))))
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.glassesType", Matchers.is(glasses.getGlassesType().name())))
                .andExpect(jsonPath("$.glassesSize", Matchers.is(glasses.getGlassesSize().name())))
                .andExpect(jsonPath("$.appearance", Matchers.is(glasses.getAppearance().name())))
                .andExpect(jsonPath("$.os.cylinder", Matchers.is(glasses.getOs().getCylinder().intValue())))
                .andExpect(jsonPath("$.od.cylinder", Matchers.is(glasses.getOd().getCylinder().intValue())));

            assertNotEquals(cv, hash("sm"));
            cv = hash("sm");
        }

        this.mockMvc.perform(post("/api/glasses").contentType(MediaType.APPLICATION_JSON).content(
                objectMapper.writeValueAsString(request(failGlasses)).replace("\"sm\"", "\"ss\"")))
            .andExpect(status().isBadRequest());
        assertEquals(cv, hash("sm"));

        this.mockMvc.perform(post("/api/glasses").contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isBadRequest());
        assertEquals(cv, hash("sm"));
    }

    @Test
    public void addGlasses_withInvalidInput_thenBadRequest() throws Exception {
        Map<String, String> invalid = Map.of(
            "missing location", "{\"glassesType\":\"single\",\"glassesSize\":\"small\",\"appearance\":\"neutral\",\"os\":%1$s,\"od\":%1$s}",
            "missing type", "{\"glassesSize\":\"small\",\"appearance\":\"neutral\",\"location\":\"sa\",\"os\":%1$s,\"od\":%1$s}",
            "missing eye", "{\"glassesType\":\"single\",\"glassesSize\":\"small\",\"appearance\":\"neutral\",\"location\":\"sa\",\"os\":%1$s}",
            "missing sphere", "{\"glassesType\":\"single\",\"glassesSize\":\"small\",\"appearance\":\"neutral\",\"location\":\"sa\",\"os\":%1$s,\"od\":{\"cylinder\":-1,\"axis\":10}}",
            "unknown type", "{\"glassesType\":\"bifocal\",\"glassesSize\":\"small\",\"appearance\":\"neutral\",\"location\":\"sa\",\"os\":%1$s,\"od\":%1$s}");
        for (var entry : invalid.entrySet()) {
            this.mockMvc.perform(post("/api/glasses").contentType(MediaType.APPLICATION_JSON)
                    .content(String.format(entry.getValue(), VALID_EYE)))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON));
        }

        this.mockMvc.perform(post("/api/glasses").contentType(MediaType.APPLICATION_JSON)
                .content("{\"glassesType\":\"single\",\"glassesSize\":\"small\",\"appearance\":\"neutral\",\"location\":\"sa\","
                    + "\"os\":{\"sphere\":100,\"cylinder\":-1,\"axis\":10,\"add\":1},\"od\":" + VALID_EYE + "}"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.detail", Matchers.is("os.sphere must be less than or equal to 30.0")));
    }

    @Test
    public void givenGlasses_whenGetGlasses_thenStatus200() throws Exception {
        Glasses saveEntitySa = saveGlasses(LocationEnum.sa);
        // Save two glasses for this test
        saveGlasses(LocationEnum.sa);

        this.mockMvc.perform(get("/api/glasses/sa/" + saveEntitySa.getSku()))
            .andExpect(status().isOk())
            .andExpect(content()
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.sku", Matchers.is(saveEntitySa.getSku())))
            .andExpect(jsonPath("$.glassesType", Matchers.is(saveEntitySa.getGlassesType().name())))
            .andExpect(jsonPath("$.glassesSize", Matchers.is(saveEntitySa.getGlassesSize().name())))
            .andExpect(jsonPath("$.appearance", Matchers.is(saveEntitySa.getAppearance().name())))
            .andExpect(jsonPath("$.os.cylinder", Matchers.is(saveEntitySa.getOs().getCylinder().doubleValue())))
            .andExpect(jsonPath("$.od.cylinder", Matchers.is(saveEntitySa.getOd().getCylinder().doubleValue())));

        Glasses saveEntitySm = saveGlasses(LocationEnum.sm);

        this.mockMvc.perform(get("/api/glasses/sm/" + saveEntitySm.getSku()))
            .andExpect(status().isOk())
            .andExpect(content()
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.sku", Matchers.is(saveEntitySm.getSku())))
            .andExpect(jsonPath("$.glassesType", Matchers.is(saveEntitySm.getGlassesType().name())))
            .andExpect(jsonPath("$.glassesSize", Matchers.is(saveEntitySm.getGlassesSize().name())))
            .andExpect(jsonPath("$.appearance", Matchers.is(saveEntitySm.getAppearance().name())))
            .andExpect(jsonPath("$.os.cylinder", Matchers.is(saveEntitySm.getOs().getCylinder().doubleValue())))
            .andExpect(jsonPath("$.od.cylinder", Matchers.is(saveEntitySm.getOd().getCylinder().doubleValue())));

        this.mockMvc.perform(get("/api/glasses/sa/" + -10))
            .andExpect(status().isNotFound())
            .andExpect(content()
                .contentType(MediaType.APPLICATION_PROBLEM_JSON))
            .andExpect(jsonPath("$.detail", Matchers.is(notNullValue())));
    }

    @Test
    public void updateGlasses_thenStatus200()
        throws Exception {

        Glasses glasses = newGlasses(GlassesTypeEnum.multifocal, GlassesSizeEnum.small, AppearanceEnum.neutral, LocationEnum.sm);

        String cv = hash("sm");
        String added = this.mockMvc.perform(post("/api/glasses").contentType(MediaType.APPLICATION_JSON).content(
                objectMapper.writeValueAsBytes(request(glasses))))
            .andExpect(status().isCreated())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andReturn().getResponse().getContentAsString();
        int sku = JsonPath.read(added, "$.sku");
        int id = JsonPath.read(added, "$.id");
        assertNotEquals(cv, hash("sm"));

        cv = hash("sm");
        Glasses glassesToUpdate = new Glasses(GlassesTypeEnum.multifocal, GlassesSizeEnum.medium, AppearanceEnum.feminine, LocationEnum.sm,
            new Eye(BigDecimal.valueOf(2), BigDecimal.valueOf(-5), 3, BigDecimal.valueOf(2)),
            new Eye(BigDecimal.valueOf(2), BigDecimal.valueOf(-5), 3, BigDecimal.valueOf(2)));

        this.mockMvc.perform(MockMvcRequestBuilders.put("/api/glasses/" + id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsBytes(request(glassesToUpdate))))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.sku", Matchers.is(sku)))
            .andExpect(jsonPath("$.appearance", Matchers.is(glassesToUpdate.getAppearance().name())))
            .andExpect(jsonPath("$.glassesType", Matchers.is(glassesToUpdate.getGlassesType().name())))
            .andExpect(jsonPath("$.glassesSize", Matchers.is(glassesToUpdate.getGlassesSize().name())))
            .andExpect(jsonPath("$.os.cylinder", Matchers.is(glassesToUpdate.getOs().getCylinder().intValue())))
            .andExpect(jsonPath("$.od.cylinder", Matchers.is(glassesToUpdate.getOd().getCylinder().intValue())));
        assertNotEquals(cv, hash("sm"));

        cv = hash("sm");
        this.mockMvc.perform(MockMvcRequestBuilders.put("/api/glasses/" + id)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"glassesType\":\"multifocal\",\"glassesSize\":\"medium\",\"appearance\":\"test\",\"location\":\"sm\","
                    + "\"os\":" + VALID_EYE + ",\"od\":" + VALID_EYE + "}"))
            .andExpect(status().isBadRequest())
            .andExpect(content()
                .contentType(MediaType.APPLICATION_PROBLEM_JSON));
        assertEquals(cv, hash("sm"));
    }

    @Test
    public void updateGlasses_updatesEyesInPlaceAndKeepsLocation() throws Exception {
        Glasses glasses = saveGlasses(LocationEnum.sa);
        Integer eyeRows = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM eye", Integer.class);

        GlassesRequestDTO edit = new GlassesRequestDTO(GlassesTypeEnum.single, GlassesSizeEnum.small,
            AppearanceEnum.feminine, LocationEnum.sm, new EyeDTO(BigDecimal.valueOf(3), BigDecimal.valueOf(-1), 90, BigDecimal.ZERO),
            new EyeDTO(BigDecimal.valueOf(-3), BigDecimal.ZERO, 0, BigDecimal.ZERO));
        this.mockMvc.perform(put("/api/glasses/" + glasses.getId()).contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsBytes(edit)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.location", Matchers.is("sa")))
            .andExpect(jsonPath("$.os.axis", Matchers.is(90)));

        assertEquals(eyeRows, jdbcTemplate.queryForObject("SELECT COUNT(*) FROM eye", Integer.class));
        Glasses edited = glassesRepository.findById(glasses.getId()).orElseThrow();
        assertEquals(LocationEnum.sa, edited.getLocation());
        assertEquals(glasses.getOs().getId(), edited.getOs().getId());
        assertEquals(90, edited.getOs().getAxis());
    }

    // an edit queued offline may replay after the pair was dispensed
    @Test
    public void updateGlasses_whenDispensed_thenConflict() throws Exception {
        Glasses glasses = saveGlasses(LocationEnum.sa);
        mainService.dispense(glasses.getId(), DispenseReasonEnum.DISPENSED);
        GlassesRequestDTO edit = request(glasses);
        GlassesRequestDTO staleEdit = new GlassesRequestDTO(edit.glassesType(), edit.glassesSize(),
            AppearanceEnum.masculine, edit.location(), edit.os(), edit.od());

        this.mockMvc.perform(put("/api/glasses/" + glasses.getId()).contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsBytes(staleEdit)))
            .andExpect(status().isConflict());
        assertEquals(AppearanceEnum.neutral, glassesRepository.findById(glasses.getId()).orElseThrow().getAppearance());
    }

    @Test
    public void undispense_withoutPreviousSku_thenBadRequest() throws Exception {
        Glasses glasses = saveGlasses(LocationEnum.sa);
        mainService.dispense(glasses.getId(), DispenseReasonEnum.DISPENSED);
        jdbcTemplate.update("UPDATE dispense SET previous_sku = NULL WHERE id = ?", glasses.getDispense().getId());

        this.mockMvc.perform(put("/api/glasses/" + glasses.getId() + "/undispense"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.detail", Matchers.is("These glasses have no previous SKU to restore.")));
        assertTrue(glassesRepository.findById(glasses.getId()).orElseThrow().isDispensed());
        // the database is shared, and real dispensed rows always have one
        jdbcTemplate.update("UPDATE dispense SET previous_sku = ? WHERE id = ?", glasses.getSku(), glasses.getDispense().getId());
    }

    @Test
    public void freedSku_isHeldBeforeAddHandsItOutAgain() {
        Glasses glasses = saveGlasses(LocationEnum.sa);
        mainService.dispense(glasses.getId(), DispenseReasonEnum.DISPENSED);
        assertNotEquals(glasses.getSku(), saveGlasses(LocationEnum.sa).getSku());

        endHold(glasses);
        assertEquals(glasses.getSku(), saveGlasses(LocationEnum.sa).getSku());
    }

    @Test
    public void glassesSku_isUnique() {
        Glasses glasses = saveGlasses(LocationEnum.sa);
        Glasses other = saveGlasses(LocationEnum.sa);
        assertThrows(DataIntegrityViolationException.class, () -> jdbcTemplate.update(
            "UPDATE glasses SET sku = ? WHERE id = ?", glasses.getSku(), other.getId()));
    }

    @Test
    public void glassesSku_isOnlyMissingWhenDispensed() {
        Glasses glasses = saveGlasses(LocationEnum.sa);
        assertThrows(DataIntegrityViolationException.class, () -> jdbcTemplate.update(
            "UPDATE glasses SET sku = NULL WHERE id = ?", glasses.getId()));
        assertThrows(DataIntegrityViolationException.class, () -> jdbcTemplate.update(
            "UPDATE glasses SET dispensed = true WHERE id = ?", glasses.getId()));
    }

    @Test
    public void whenDispensedCSVDownload_thenVerifyStatus()
        throws Exception {
        Glasses glasses = saveGlasses(LocationEnum.sa);
        mainService.dispense(glasses.getId(), DispenseReasonEnum.DISPENSED);
        this.mockMvc.perform(get("/api/glasses/dispensed/sa.csv"))
            .andExpect(status().isOk())
            .andExpect(content().contentType("text/csv"));
    }

    @Test
    public void whenCSVDownload_thenVerifyStatus()
        throws Exception {
        saveGlasses(LocationEnum.sa);
        this.mockMvc.perform(get("/api/glasses/sa.csv"))
            .andExpect(status().isOk())
            .andExpect(content().contentType("text/csv"));
    }

    @Test
    public void csvDates_areInElSalvadorTime() throws Exception {
        Glasses glasses = saveGlasses(LocationEnum.sa);
        String added = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss").withZone(CampaignZone.ZONE)
            .format(glasses.getCreationDate());

        this.mockMvc.perform(get("/api/glasses/sa.csv"))
            .andExpect(content().string(containsString("\"" + glasses.getSku() + "\",\"sa\",\"multifocal\",\"neutral\",\"medium\",\""
                + added + "\"")));
    }

    @Test
    public void unsuccessfulSearchesCsv_onlyHasSearchesWithoutResultsAtThatLocation() throws Exception {
        saveSearch(LocationEnum.sm, "7.25", 0);
        saveSearch(LocationEnum.sm, "7.50", 3);
        saveSearch(LocationEnum.sa, "7.75", 0);

        this.mockMvc.perform(get("/api/glasses/unsuccessful/sm.csv"))
            .andExpect(status().isOk())
            .andExpect(content().contentType("text/csv"))
            .andExpect(content().string(containsString("\"7.25\"")))
            .andExpect(content().string(not(containsString("\"7.50\""))))
            .andExpect(content().string(not(containsString("\"7.75\""))));
    }

    private void saveSearch(LocationEnum location, String sphere, int resultCount) {
        SearchLog search = new SearchLog();
        search.setLocation(location);
        search.setGlassesType(GlassesTypeEnum.single);
        search.setSearchDate(Instant.now());
        search.setBalLens(BalLensEnum.DISABLE_NONE);
        search.setIncreaseSearchTolerance(false);
        search.setResultCount(resultCount);
        search.setOd(new Eye(new BigDecimal(sphere), BigDecimal.ZERO, 0, BigDecimal.ZERO));
        search.setOs(new Eye(new BigDecimal(sphere), BigDecimal.ZERO, 0, BigDecimal.ZERO));
        searchLogRepository.save(search);
    }

    @Test
    public void dispensedGlasses_filtersByCampaignDay() throws Exception {
        Glasses glasses = saveGlasses(LocationEnum.sa);
        mainService.dispense(glasses.getId(), DispenseReasonEnum.DISPENSED);
        DateTimeFormatter format = DateTimeFormatter.ofPattern("MM/dd/yyyy");
        LocalDate today = LocalDate.now(CampaignZone.ZONE);

        this.mockMvc.perform(get("/api/glasses/dispensed/sa").param("startDate", today.format(format))
                .param("endDate", today.format(format)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[*].id", hasItem(glasses.getId().intValue())));
        this.mockMvc.perform(get("/api/glasses/dispensed/sa").param("startDate", today.minusDays(2).format(format))
                .param("endDate", today.minusDays(1).format(format)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[*].id", not(hasItem(glasses.getId().intValue()))));
    }

    @Test
    public void logSearch_storesResultCount()
        throws Exception {
        Instant before = Instant.now();
        Map<String, Object> search = new HashMap<>(Map.of(
            "glassesType", "single",
            "balLens", "DISABLE_NONE",
            "increaseSearchTolerance", false,
            "searchDate", System.currentTimeMillis(),
            "resultCount", 2,
            "od", new EyeDTO(BigDecimal.valueOf(2), BigDecimal.valueOf(-5), 3, BigDecimal.ZERO),
            "os", new EyeDTO(BigDecimal.valueOf(2), BigDecimal.valueOf(-5), 3, BigDecimal.ZERO)));

        this.mockMvc.perform(post("/api/glasses/sa/searchLog").contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsBytes(search)))
            .andExpect(status().isCreated());
        SearchLog stored = searchLogRepository.findAll().stream().max(Comparator.comparing(SearchLog::getId)).orElseThrow();
        assertEquals(2, stored.getResultCount());
        // the date arrives as epoch millis
        assertTrue(Duration.between(before, stored.getSearchDate()).abs().toSeconds() < 60, "got " + stored.getSearchDate());

        search.remove("resultCount");
        this.mockMvc.perform(post("/api/glasses/sa/searchLog").contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsBytes(search)))
            .andExpect(status().isBadRequest());

        search.put("resultCount", -1);
        this.mockMvc.perform(post("/api/glasses/sa/searchLog").contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsBytes(search)))
            .andExpect(status().isBadRequest());

        search.put("resultCount", 0);
        search.put("balLens", "nope");
        this.mockMvc.perform(post("/api/glasses/sa/searchLog").contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsBytes(search)))
            .andExpect(status().isBadRequest());
    }

    @Test
    public void logSearch_storesResults()
        throws Exception {
        Map<String, Object> search = new HashMap<>(Map.of(
            "glassesType", "single",
            "balLens", "DISABLE_NONE",
            "increaseSearchTolerance", false,
            "searchDate", System.currentTimeMillis(),
            "resultCount", 0,
            "results", List.of(
                Map.of("id", 4711, "algorithm", "blurscore"),
                Map.of("id", 802, "algorithm", "philscore")),
            "od", new EyeDTO(BigDecimal.valueOf(2), BigDecimal.valueOf(-5), 3, BigDecimal.ZERO),
            "os", new EyeDTO(BigDecimal.valueOf(2), BigDecimal.valueOf(-5), 3, BigDecimal.ZERO)));

        this.mockMvc.perform(post("/api/glasses/sa/searchLog").contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsBytes(search)))
            .andExpect(status().isCreated());
        String stored = jdbcTemplate.queryForObject(
            "SELECT results FROM search_log ORDER BY id DESC LIMIT 1", String.class);
        assertEquals(objectMapper.valueToTree(search.get("results")), objectMapper.readTree(stored));

        // cached PWAs from before this column don't send it
        search.remove("results");
        this.mockMvc.perform(post("/api/glasses/sa/searchLog").contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsBytes(search)))
            .andExpect(status().isCreated());
        assertNull(jdbcTemplate.queryForObject(
            "SELECT results FROM search_log ORDER BY id DESC LIMIT 1", String.class));
    }
}
