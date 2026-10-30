package org.pvh.rest;

import tools.jackson.databind.ObjectMapper;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.pvh.MariaDbTestConfiguration;
import org.pvh.model.dto.EyeDTO;
import org.pvh.model.dto.GlassesRequestDTO;
import org.pvh.model.entity.ChangeValue;
import org.pvh.model.entity.Eye;
import org.pvh.model.entity.Glasses;
import org.pvh.model.entity.SearchLog;
import org.pvh.model.enums.AppearanceEnum;
import org.pvh.model.enums.GlassesSizeEnum;
import org.pvh.model.enums.GlassesTypeEnum;
import org.pvh.repository.SearchLogRepository;
import org.pvh.service.GlassesService;
import org.pvh.model.enums.LocationEnum;
import org.pvh.util.CampaignZone;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Map;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Import(MariaDbTestConfiguration.class)
@WithMockUser(roles = "USER")
public class GlassesRestControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoSpyBean
    private GlassesService mainService;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private SearchLogRepository searchLogRepository;

    private static final String VALID_EYE = "{\"sphere\":1,\"cylinder\":-1,\"axis\":10,\"add\":1}";

    private static Eye eye() {
        return new Eye(BigDecimal.ONE, BigDecimal.valueOf(-2), 2, BigDecimal.ONE);
    }

    private static Glasses newGlasses(GlassesTypeEnum type, GlassesSizeEnum size, AppearanceEnum appearance, LocationEnum location) {
        return new Glasses(type, size, appearance, location, eye(), eye());
    }

    private static GlassesRequestDTO request(Glasses glasses) {
        return new GlassesRequestDTO(glasses.getId(), glasses.getGlassesType(), glasses.getGlassesSize(), glasses.getAppearance(),
            glasses.getLocation(), EyeDTO.from(glasses.getOs()), EyeDTO.from(glasses.getOd()));
    }

    private Glasses saveGlasses(LocationEnum location) {
        return mainService.saveGlasses(newGlasses(GlassesTypeEnum.multifocal, GlassesSizeEnum.medium, AppearanceEnum.neutral, location));
    }

    private ChangeValue callChangeValueAndReturnHash(String location) throws Exception {

        MvcResult changeValue = this.mockMvc.perform(get(String.format("/api/glasses/%s/changes", location)))
            .andReturn();
        ChangeValue cv = objectMapper.readValue(changeValue.getResponse().getContentAsByteArray(),
            ChangeValue.class);

        return cv;
    }

    private boolean isChangeValueEqualNewChangeValue(ChangeValue cv, String location) throws Exception {

        MvcResult changeValueMvc = this.mockMvc.perform(get(String.format("/api/glasses/%s/changes", location)))
            .andReturn();
        ChangeValue changeValue2 = objectMapper.readValue(changeValueMvc.getResponse().getContentAsByteArray(),
            ChangeValue.class);

        return cv.getHashValue().equals(changeValue2.getHashValue());

    }

    @Test
    public void givenGlasses_Dispense_And_Undispense()
        throws Exception {

        Glasses saveEntitySa = saveGlasses(LocationEnum.sa);

        ChangeValue cv = callChangeValueAndReturnHash("sa");
        // Get create Glasses
        this.mockMvc.perform(get("/api/glasses/sa/" + saveEntitySa.getSku()))
            .andExpect(status().isOk())
            .andExpect(MockMvcResultMatchers.content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(MockMvcResultMatchers.jsonPath("$.sku", Matchers.is(saveEntitySa.getSku())))
            .andExpect(MockMvcResultMatchers.jsonPath("$.glassesType",
                Matchers.is(saveEntitySa.getGlassesType().name())))
            .andExpect(MockMvcResultMatchers.jsonPath("$.glassesSize",
                Matchers.is(saveEntitySa.getGlassesSize().name())))
            .andExpect(MockMvcResultMatchers.jsonPath("$.dispensed", Matchers.is(false)))
            .andExpect(MockMvcResultMatchers.jsonPath("$.appearance",
                Matchers.is(saveEntitySa.getAppearance().name())))
            .andExpect(MockMvcResultMatchers.jsonPath("$.os.cylinder",
                Matchers.is(saveEntitySa.getOs().getCylinder().doubleValue())))
            .andExpect(MockMvcResultMatchers.jsonPath("$.od.cylinder",
                Matchers.is(saveEntitySa.getOd().getCylinder().doubleValue())))
            .andDo(print());

        // Dispense created Glasses for first time
        this.mockMvc.perform(put("/api/glasses/dispense/sa/" + saveEntitySa.getSku()))
            .andExpect(status().isOk())
            .andDo(print());

        assertFalse(isChangeValueEqualNewChangeValue(cv, "sa"));

        // Dispense created Glasses for second time --> Sku not valid anymore
        cv = callChangeValueAndReturnHash("sa");
        this.mockMvc.perform(put("/api/glasses/dispense/sa/" + saveEntitySa.getSku()))
            .andExpect(status().isNotFound())
            .andDo(print());
        assertTrue(isChangeValueEqualNewChangeValue(cv, "sa"));
        // Dispense non existing Glasses
        this.mockMvc.perform(put("/api/glasses/dispense/sa/" + -1))
            .andExpect(status().isNotFound())
            .andDo(print());
        assertTrue(isChangeValueEqualNewChangeValue(cv, "sa"));

        // try to get created Glasses
        this.mockMvc.perform(get("/api/glasses/sa/" + saveEntitySa.getSku()))
            .andExpect(status().isNotFound())
            .andExpect(MockMvcResultMatchers.content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
            .andDo(print());

        // check if created Glasses is dispensed
        this.mockMvc.perform(get("/api/glasses/dispensed/sa"))
            .andExpect(status().isOk())
            .andExpect(MockMvcResultMatchers.content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(MockMvcResultMatchers.jsonPath("$.[0].location", Matchers.is("sa")))
            .andExpect(MockMvcResultMatchers.jsonPath("$.[0].glassesType",
                Matchers.is(saveEntitySa.getGlassesType().name())))
            .andExpect(MockMvcResultMatchers.jsonPath("$.[0].glassesSize",
                Matchers.is(saveEntitySa.getGlassesSize().name())))
            .andExpect(MockMvcResultMatchers.jsonPath("$.[0].dispensed", Matchers.is(true)))
            .andExpect(MockMvcResultMatchers.jsonPath("$.[0].appearance",
                Matchers.is(saveEntitySa.getAppearance().name())))
            .andExpect(
                MockMvcResultMatchers.jsonPath("$.[0].os.cylinder",
                    Matchers.is(saveEntitySa.getOs().getCylinder()
                        .doubleValue())))
            .andExpect(
                MockMvcResultMatchers.jsonPath("$.[0].od.cylinder",
                    Matchers.is(saveEntitySa.getOd().getCylinder()
                        .doubleValue())))
            .andDo(print());

        Glasses saveEntitySa2 = saveGlasses(LocationEnum.sa);

        cv = callChangeValueAndReturnHash("sa");
        // Try to Undispense firstly created glass -> not possible because of secondly
        // created glass
        this.mockMvc.perform(put("/api/glasses/undispense/" + saveEntitySa.getId()))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.detail", Matchers.is("Previous SKU is already used")))
            .andDo(print());
        assertTrue(isChangeValueEqualNewChangeValue(cv, "sa"));

        // dispense secondly created glass
        this.mockMvc.perform(put("/api/glasses/dispense/sa/" + saveEntitySa2.getSku()))
            .andExpect(status().isOk())
            .andDo(print());
        assertFalse(isChangeValueEqualNewChangeValue(cv, "sa"));

        // undispense secondly created glass
        cv = callChangeValueAndReturnHash("sa");
        this.mockMvc.perform(put("/api/glasses/undispense/" + saveEntitySa2.getId()))
            .andExpect(status().isOk())
            .andDo(print());
        assertFalse(isChangeValueEqualNewChangeValue(cv, "sa"));
        // undispense must not leave the old reason behind
        assertNull(mainService.findGlassesById(saveEntitySa2.getId()).orElseThrow().getDispense().getDispenseReason());

        // undispense secondly created glass second time
        cv = callChangeValueAndReturnHash("sa");
        this.mockMvc.perform(put("/api/glasses/undispense/" + saveEntitySa2.getId()))
            .andExpect(status().isNoContent())
            .andDo(print());
        assertTrue(isChangeValueEqualNewChangeValue(cv, "sa"));
        // undispense empty glasss
        this.mockMvc.perform(put("/api/glasses/undispense/fsdg"))
            .andExpect(status().isBadRequest())
            .andDo(print());
        assertTrue(isChangeValueEqualNewChangeValue(cv, "sa"));
        // undispense wrong id glasss
        this.mockMvc.perform(put("/api/glasses/undispense/-1"))
            .andExpect(status().isNotFound())
            .andDo(print());
        assertTrue(isChangeValueEqualNewChangeValue(cv, "sa"));

        this.mockMvc.perform(get("/api/glasses/sa/" + saveEntitySa2.getSku()))
            .andExpect(status().isOk())
            .andExpect(MockMvcResultMatchers.content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(MockMvcResultMatchers.jsonPath("$.sku", Matchers.is(saveEntitySa2.getSku())))
            .andExpect(MockMvcResultMatchers.jsonPath("$.glassesType",
                Matchers.is(saveEntitySa2.getGlassesType().name())))
            .andExpect(MockMvcResultMatchers.jsonPath("$.glassesSize",
                Matchers.is(saveEntitySa2.getGlassesSize().name())))
            .andExpect(MockMvcResultMatchers.jsonPath("$.dispensed", Matchers.is(false)))
            .andExpect(MockMvcResultMatchers.jsonPath("$.appearance",
                Matchers.is(saveEntitySa2.getAppearance().name())))
            .andExpect(MockMvcResultMatchers.jsonPath("$.os.cylinder",
                Matchers.is(saveEntitySa2.getOs().getCylinder().doubleValue())))
            .andExpect(MockMvcResultMatchers.jsonPath("$.od.cylinder",
                Matchers.is(saveEntitySa2.getOd().getCylinder().doubleValue())))
            .andDo(print());
    }

    @Test
    public void dispense_whenDatabaseFails_thenServerError()
        throws Exception {
        Glasses glasses = saveGlasses(LocationEnum.sa);
        doThrow(new DataAccessResourceFailureException("database down"))
            .when(mainService).dispense(any(), anyInt(), any(), any());

        // a 5xx keeps a change queued offline for the next try, a 4xx would drop it
        this.mockMvc.perform(put("/api/glasses/dispense/sa/" + glasses.getSku()))
            .andExpect(status().isInternalServerError());
    }

    @Test
    public void dispense_whenSkuBelongsToOtherGlasses_thenConflict()
        throws Exception {
        Glasses glasses = saveGlasses(LocationEnum.sa);

        this.mockMvc.perform(put("/api/glasses/dispense/sa/" + glasses.getSku()).param("id", "" + (glasses.getId() + 1000)))
            .andExpect(status().isConflict());
        assertFalse(mainService.findGlassesById(glasses.getId()).orElseThrow().isDispensed());

        this.mockMvc.perform(put("/api/glasses/dispense/sa/" + glasses.getSku()).param("id", "" + glasses.getId()))
            .andExpect(status().isOk());
        assertTrue(mainService.findGlassesById(glasses.getId()).orElseThrow().isDispensed());
    }

    @Test
    public void addGlasses_thenStatus201() throws Exception {
        Glasses glasses = newGlasses(GlassesTypeEnum.multifocal, GlassesSizeEnum.small, AppearanceEnum.neutral, LocationEnum.sm);

        Glasses failGlasses = newGlasses(GlassesTypeEnum.multifocal, GlassesSizeEnum.small, AppearanceEnum.neutral, LocationEnum.sm);

        ChangeValue cv = callChangeValueAndReturnHash("sm");

        for (int i = 0; i < 2; i++) {
            this.mockMvc.perform(post("/api/glasses").contentType(MediaType.APPLICATION_JSON).content(
                    objectMapper.writeValueAsBytes(request(glasses))))
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.jsonPath("$.glassesType",
                    Matchers.is(glasses.getGlassesType().name())))
                .andExpect(MockMvcResultMatchers.jsonPath("$.glassesSize",
                    Matchers.is(glasses.getGlassesSize().name())))
                .andExpect(MockMvcResultMatchers.jsonPath("$.appearance",
                    Matchers.is(glasses.getAppearance().name())))
                .andExpect(MockMvcResultMatchers.jsonPath("$.os.cylinder",
                    Matchers.is(glasses.getOs().getCylinder().intValue())))
                .andExpect(MockMvcResultMatchers.jsonPath("$.od.cylinder",
                    Matchers.is(glasses.getOd().getCylinder().intValue())))
                .andDo(print());

            assertFalse(isChangeValueEqualNewChangeValue(cv, "sm"));
            cv = callChangeValueAndReturnHash("sm");
        }

        this.mockMvc.perform(post("/api/glasses").contentType(MediaType.APPLICATION_JSON).content(
                objectMapper.writeValueAsString(request(failGlasses)).replace("\"sm\"", "\"ss\"")))
            .andExpect(status().isBadRequest())
            .andDo(print());
        assertTrue(isChangeValueEqualNewChangeValue(cv, "sm"));

        this.mockMvc.perform(post("/api/glasses").contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isBadRequest())
            .andDo(print());
        assertTrue(isChangeValueEqualNewChangeValue(cv, "sm"));
    }

    @Test
    public void addGlasses_withInvalidInput_thenBadRequest() throws Exception {
        Map<String, String> invalid = Map.of(
            "missing location", "{\"glassesType\":\"single\",\"glassesSize\":\"small\",\"appearance\":\"neutral\",\"os\":%1$s,\"od\":%1$s}",
            "missing type", "{\"glassesSize\":\"small\",\"appearance\":\"neutral\",\"location\":\"sa\",\"os\":%1$s,\"od\":%1$s}",
            "missing eye", "{\"glassesType\":\"single\",\"glassesSize\":\"small\",\"appearance\":\"neutral\",\"location\":\"sa\",\"os\":%1$s}",
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
            .andExpect(MockMvcResultMatchers.content()
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(MockMvcResultMatchers.jsonPath("$.sku",
                Matchers.is(saveEntitySa.getSku())))
            .andExpect(MockMvcResultMatchers.jsonPath("$.glassesType",
                Matchers.is(saveEntitySa.getGlassesType().name())))
            .andExpect(MockMvcResultMatchers.jsonPath("$.glassesSize",
                Matchers.is(saveEntitySa.getGlassesSize().name())))
            .andExpect(MockMvcResultMatchers.jsonPath("$.appearance",
                Matchers.is(saveEntitySa.getAppearance().name())))
            .andExpect(MockMvcResultMatchers.jsonPath("$.os.cylinder",
                Matchers.is(saveEntitySa.getOs().getCylinder().doubleValue())))
            .andExpect(MockMvcResultMatchers.jsonPath("$.od.cylinder",
                Matchers.is(saveEntitySa.getOd().getCylinder().doubleValue())))
            .andDo(print());

        Glasses saveEntitySm = saveGlasses(LocationEnum.sm);

        this.mockMvc.perform(get("/api/glasses/sm/" + saveEntitySm.getSku()))
            .andExpect(status().isOk())
            .andExpect(MockMvcResultMatchers.content()
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(MockMvcResultMatchers.jsonPath("$.sku",
                Matchers.is(saveEntitySm.getSku())))
            .andExpect(MockMvcResultMatchers.jsonPath("$.glassesType",
                Matchers.is(saveEntitySm.getGlassesType().name())))
            .andExpect(MockMvcResultMatchers.jsonPath("$.glassesSize",
                Matchers.is(saveEntitySm.getGlassesSize().name())))
            .andExpect(MockMvcResultMatchers.jsonPath("$.appearance",
                Matchers.is(saveEntitySm.getAppearance().name())))
            .andExpect(MockMvcResultMatchers.jsonPath("$.os.cylinder",
                Matchers.is(saveEntitySm.getOs().getCylinder().doubleValue())))
            .andExpect(MockMvcResultMatchers.jsonPath("$.od.cylinder",
                Matchers.is(saveEntitySm.getOd().getCylinder().doubleValue())))
            .andDo(print());

        this.mockMvc.perform(get("/api/glasses/sa/" + -10))
            .andExpect(status().isNotFound())
            .andExpect(MockMvcResultMatchers.content()
                .contentType(MediaType.APPLICATION_PROBLEM_JSON))
            .andExpect(MockMvcResultMatchers.jsonPath("$.detail",
                Matchers.is(notNullValue())))
            .andDo(print());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    public void givenGlasses_whenDeleteGlasses_thenStatus204()
        throws Exception {

        Glasses saveEntitySa = saveGlasses(LocationEnum.sm);

        ChangeValue cv = callChangeValueAndReturnHash("sm");
        this.mockMvc.perform(delete("/api/glasses/sm/" + saveEntitySa.getSku()))
            .andExpect(status().isNoContent())
            .andDo(print());
        assertFalse(isChangeValueEqualNewChangeValue(cv, "sm"));

        cv = callChangeValueAndReturnHash("sm");
        this.mockMvc.perform(delete("/api/glasses/sm/-1"))
            .andExpect(status().isNotFound())
            .andDo(print());
        assertTrue(isChangeValueEqualNewChangeValue(cv, "sm"));
    }

    @Test
    public void updateGlasses_thenStatus200()
        throws Exception {

        Glasses glasses = newGlasses(GlassesTypeEnum.multifocal, GlassesSizeEnum.small, AppearanceEnum.neutral, LocationEnum.sm);

        ChangeValue cv = callChangeValueAndReturnHash("sm");
        this.mockMvc.perform(post("/api/glasses").contentType(MediaType.APPLICATION_JSON).content(
                objectMapper.writeValueAsBytes(request(glasses))))
            .andExpect(status().isCreated())
            .andExpect(MockMvcResultMatchers.jsonPath("$.sku", Matchers.is(5001)))
            .andExpect(MockMvcResultMatchers.content().contentType(MediaType.APPLICATION_JSON))
            .andDo(print())
            .andReturn();
        assertFalse(isChangeValueEqualNewChangeValue(cv, "sm"));

        cv = callChangeValueAndReturnHash("sm");
        Glasses glassesToUpdate = new Glasses(GlassesTypeEnum.multifocal, GlassesSizeEnum.medium, AppearanceEnum.feminine, LocationEnum.sm,
            new Eye(BigDecimal.valueOf(2), BigDecimal.valueOf(-5), 3, BigDecimal.valueOf(2)),
            new Eye(BigDecimal.valueOf(2), BigDecimal.valueOf(-5), 3, BigDecimal.valueOf(2)));

        this.mockMvc.perform(MockMvcRequestBuilders.put("/api/glasses/sm/" + 5001)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsBytes(request(glassesToUpdate))))
            .andExpect(status().isOk())
            .andExpect(MockMvcResultMatchers.content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(MockMvcResultMatchers.jsonPath("$.sku", Matchers.is(5001)))
            .andExpect(MockMvcResultMatchers.jsonPath("$.appearance",
                Matchers.is(glassesToUpdate.getAppearance().name())))
            .andExpect(MockMvcResultMatchers.jsonPath("$.glassesType",
                Matchers.is(glassesToUpdate.getGlassesType().name())))
            .andExpect(MockMvcResultMatchers.jsonPath("$.glassesSize",
                Matchers.is(glassesToUpdate.getGlassesSize().name())))
            .andExpect(MockMvcResultMatchers.jsonPath("$.os.cylinder",
                Matchers.is(glassesToUpdate.getOs().getCylinder().intValue())))
            .andExpect(MockMvcResultMatchers.jsonPath("$.od.cylinder",
                Matchers.is(glassesToUpdate.getOd().getCylinder().intValue())))
            .andDo(print());
        assertFalse(isChangeValueEqualNewChangeValue(cv, "sm"));

        cv = callChangeValueAndReturnHash("sm");
        this.mockMvc.perform(MockMvcRequestBuilders.put("/api/glasses/sm/" + 5001)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"glassesType\":\"multifocal\",\"glassesSize\":\"medium\",\"appearance\":\"test\",\"location\":\"sm\","
                    + "\"os\":" + VALID_EYE + ",\"od\":" + VALID_EYE + "}"))
            .andExpect(status().isBadRequest())
            .andExpect(MockMvcResultMatchers.content()
                .contentType(MediaType.APPLICATION_PROBLEM_JSON))
            .andDo(print());
        assertTrue(isChangeValueEqualNewChangeValue(cv, "sm"));
    }

    @Test
    public void updateGlasses_updatesEyesInPlaceAndKeepsLocation() throws Exception {
        Glasses glasses = saveGlasses(LocationEnum.sa);
        Integer eyeRows = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM eye", Integer.class);

        GlassesRequestDTO edit = new GlassesRequestDTO(glasses.getId(), GlassesTypeEnum.single, GlassesSizeEnum.small,
            AppearanceEnum.feminine, LocationEnum.sm, new EyeDTO(BigDecimal.valueOf(3), BigDecimal.valueOf(-1), 90, BigDecimal.ZERO),
            new EyeDTO(BigDecimal.valueOf(-3), BigDecimal.ZERO, 0, BigDecimal.ZERO));
        this.mockMvc.perform(put("/api/glasses/sa/" + glasses.getSku()).contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsBytes(edit)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.location", Matchers.is("sa")))
            .andExpect(jsonPath("$.os.axis", Matchers.is(90)));

        assertEquals(eyeRows, jdbcTemplate.queryForObject("SELECT COUNT(*) FROM eye", Integer.class));
        Glasses edited = mainService.findGlassesById(glasses.getId()).orElseThrow();
        assertEquals(LocationEnum.sa, edited.getLocation());
        assertEquals(glasses.getOs().getId(), edited.getOs().getId());
        assertEquals(90, edited.getOs().getAxis());
    }

    @Test
    public void updateGlasses_whenSkuBelongsToOtherGlasses_thenConflict() throws Exception {
        Glasses glasses = saveGlasses(LocationEnum.sa);
        GlassesRequestDTO edit = request(glasses);
        GlassesRequestDTO staleEdit = new GlassesRequestDTO(glasses.getId() + 1000, edit.glassesType(), edit.glassesSize(),
            AppearanceEnum.masculine, edit.location(), edit.os(), edit.od());

        this.mockMvc.perform(put("/api/glasses/sa/" + glasses.getSku()).contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsBytes(staleEdit)))
            .andExpect(status().isConflict());
        assertEquals(AppearanceEnum.neutral, mainService.findGlassesById(glasses.getId()).orElseThrow().getAppearance());
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
        this.mockMvc.perform(get("/api/glasses/dispensed/sa.csv"))
            .andExpect(status().isOk())
            .andExpect(MockMvcResultMatchers.content().contentType("text/csv"))
            .andDo(print());
    }

    @Test
    public void whenCSVDownload_thenVerifyStatus()
        throws Exception {
        this.mockMvc.perform(get("/api/glasses/sa.csv"))
            .andExpect(status().isOk())
            .andExpect(MockMvcResultMatchers.content().contentType("text/csv"))
            .andDo(print());
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
    public void dispensedGlasses_filtersByCampaignDay() throws Exception {
        Glasses glasses = saveGlasses(LocationEnum.sa);
        mainService.dispense(LocationEnum.sa, glasses.getSku(), null, null);
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
}
