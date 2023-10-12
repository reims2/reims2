package org.pvh.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.hamcrest.Matchers;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.pvh.model.dto.EyeDTO;
import org.pvh.model.dto.GlassesRequestDTO;
import org.pvh.model.entity.Dispense;
import org.pvh.model.entity.Eye;
import org.pvh.model.entity.Glasses;
import org.pvh.model.enums.GlassesTypeEnum;
import org.pvh.model.mapper.GlassesMapperImpl;
import org.pvh.service.MainService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.math.BigDecimal;
import java.util.stream.Collectors;

import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
public class GlassesRestControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private MainService mainService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void addGlasses_thenStatus201()
            throws Exception {
        Glasses glasses =
                new Glasses("multifocal", "small", "neutral", "sm", new Dispense(),
                        new Eye(BigDecimal.ONE, BigDecimal.valueOf(-2), 2, BigDecimal.ONE),
                        new Eye(BigDecimal.ONE, BigDecimal.valueOf(-2), 2, BigDecimal.ONE));

        Glasses failGlasses =
                new Glasses("multifocal", "small", "neutral", "ss",
                        new Dispense(), new Eye(BigDecimal.ONE, BigDecimal.valueOf(-2), 2, BigDecimal.ONE),
                        new Eye(BigDecimal.ONE, BigDecimal.valueOf(-2), 2, BigDecimal.ONE));

        this.mockMvc.perform(post("/api/glasses").contentType(MediaType.APPLICATION_JSON).content(
                objectMapper.writeValueAsBytes(GlassesMapperImpl.getInstance().glassesToGlassesRequestDTO(glasses))))
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.jsonPath("$.glassesType", Matchers.is(glasses.getGlassesType().name())))
                .andExpect(MockMvcResultMatchers.jsonPath("$.glassesSize", Matchers.is(glasses.getGlassesSize().name())))
                .andExpect(MockMvcResultMatchers.jsonPath("$.appearance", Matchers.is(glasses.getAppearance().name())))
                .andExpect(MockMvcResultMatchers.jsonPath("$.os.cylinder", Matchers.is(glasses.getOs().getCylinder().intValue())))
                .andExpect(MockMvcResultMatchers.jsonPath("$.od.cylinder", Matchers.is(glasses.getOd().getCylinder().intValue())))
                .andDo(print());

        this.mockMvc.perform(post("/api/glasses").contentType(MediaType.APPLICATION_JSON).content(
                objectMapper.writeValueAsBytes(GlassesMapperImpl.getInstance().glassesToGlassesRequestDTO(glasses))))
                .andExpect(status().isCreated())
                .andExpect(MockMvcResultMatchers.content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.jsonPath("$.glassesType", Matchers.is(glasses.getGlassesType().name())))
                .andExpect(MockMvcResultMatchers.jsonPath("$.glassesSize", Matchers.is(glasses.getGlassesSize().name())))
                .andExpect(MockMvcResultMatchers.jsonPath("$.appearance", Matchers.is(glasses.getAppearance().name())))
                .andExpect(MockMvcResultMatchers.jsonPath("$.os.cylinder", Matchers.is(glasses.getOs().getCylinder().intValue())))
                .andExpect(MockMvcResultMatchers.jsonPath("$.od.cylinder", Matchers.is(glasses.getOd().getCylinder().intValue())))
                .andDo(print());

        this.mockMvc.perform(post("/api/glasses").contentType(MediaType.APPLICATION_JSON).content(
                objectMapper.writeValueAsBytes(GlassesMapperImpl.getInstance().glassesToGlassesRequestDTO(failGlasses))))
                .andExpect(status().is4xxClientError())
                .andDo(print());

        this.mockMvc.perform(post("/api/glasses").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().is4xxClientError())
                .andDo(print());
    }

    @Test
    public void givenGlasses_whenGetGlasses_thenStatus200()
            throws Exception {

        Glasses saveEntitySa = mainService.saveGlasses(
                new Glasses("multifocal", "medium", "neutral", "sa", new Dispense(),
                        new Eye(BigDecimal.ONE, BigDecimal.valueOf(-2), 2, BigDecimal.ONE),
                        new Eye(BigDecimal.ONE, BigDecimal.valueOf(-2), 2, BigDecimal.ONE)));


        this.mockMvc.perform(get("/api/glasses/sa/" + saveEntitySa.getSku()))
                .andExpect(status().isOk())
                .andExpect(MockMvcResultMatchers.content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.jsonPath("$.sku", Matchers.is(saveEntitySa.getSku())))
                .andExpect(MockMvcResultMatchers.jsonPath("$.glassesType", Matchers.is(saveEntitySa.getGlassesType().name())))
                .andExpect(MockMvcResultMatchers.jsonPath("$.glassesSize", Matchers.is(saveEntitySa.getGlassesSize().name())))
                .andExpect(MockMvcResultMatchers.jsonPath("$.appearance", Matchers.is(saveEntitySa.getAppearance().name())))
                .andExpect(MockMvcResultMatchers.jsonPath("$.os.cylinder", Matchers.is(saveEntitySa.getOs().getCylinder().doubleValue())))
                .andExpect(MockMvcResultMatchers.jsonPath("$.od.cylinder", Matchers.is(saveEntitySa.getOd().getCylinder().doubleValue())))
                .andDo(print());

        Glasses saveEntitySm = mainService.saveGlasses(
                new Glasses("multifocal", "medium", "neutral", "sm", new Dispense(),
                        new Eye(BigDecimal.ONE, BigDecimal.valueOf(-2), 2, BigDecimal.ONE),
                        new Eye(BigDecimal.ONE, BigDecimal.valueOf(-2), 2, BigDecimal.ONE)));

        this.mockMvc.perform(get("/api/glasses/sm/" + saveEntitySm.getSku()))
                .andExpect(status().isOk())
                .andExpect(MockMvcResultMatchers.content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.jsonPath("$.sku", Matchers.is(saveEntitySm.getSku())))
                .andExpect(MockMvcResultMatchers.jsonPath("$.glassesType", Matchers.is(saveEntitySm.getGlassesType().name())))
                .andExpect(MockMvcResultMatchers.jsonPath("$.glassesSize", Matchers.is(saveEntitySm.getGlassesSize().name())))
                .andExpect(MockMvcResultMatchers.jsonPath("$.appearance", Matchers.is(saveEntitySm.getAppearance().name())))
                .andExpect(MockMvcResultMatchers.jsonPath("$.os.cylinder", Matchers.is(saveEntitySm.getOs().getCylinder().doubleValue())))
                .andExpect(MockMvcResultMatchers.jsonPath("$.od.cylinder", Matchers.is(saveEntitySm.getOd().getCylinder().doubleValue())))
                .andDo(print());

        this.mockMvc.perform(get("/api/glasses/sa/" + -10))
                .andExpect(status().is4xxClientError())
                .andExpect(MockMvcResultMatchers.content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.jsonPath("$.error", Matchers.is(notNullValue())))
                .andDo(print());

        int totalItems = mainService.findByDispensedAndLocation(false, "sm").size();

        this.mockMvc.perform(get("/api/glasses/sm?size=2&page=0&sort=sku,asc"))
                .andExpect(status().isOk())
                .andExpect(MockMvcResultMatchers.content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.jsonPath("$.glasses[0].location", Matchers.is("sm")))
                .andExpect(MockMvcResultMatchers.jsonPath("$.totalItems", Matchers.is(totalItems)))
                .andExpect(MockMvcResultMatchers.jsonPath("$.currentPage", Matchers.is(0)))
                .andDo(print());

        int totalItemsSa = mainService.findByDispensedAndLocation(false, "sa").size();

        this.mockMvc.perform(get("/api/glasses/sa?size=2&page=1&sort=sku,desc"))
                .andExpect(status().isOk())
                .andExpect(MockMvcResultMatchers.content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.jsonPath("$.glasses[0].location", Matchers.is("sa")))
                .andExpect(MockMvcResultMatchers.jsonPath("$.totalItems", Matchers.is(totalItemsSa)))
                .andExpect(MockMvcResultMatchers.jsonPath("$.currentPage", Matchers.is(1)))
                .andDo(print());


        int totalItemsSaWithMultifocal = mainService.findByDispensedAndLocation(false, "sa")
                .stream()
                .filter(a -> a.getGlassesType().equals(GlassesTypeEnum.multifocal))
                .collect(Collectors.toList()).size();


        this.mockMvc.perform(get("/api/glasses/sa?size=2&page=2&sort=sku,desc&search=glassesType==multifocal"))
                .andExpect(status().isOk())
                .andExpect(MockMvcResultMatchers.content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.jsonPath("$.glasses[0].location", Matchers.is("sa")))
                .andExpect(MockMvcResultMatchers.jsonPath("$.glasses[0].glassesType", Matchers.is("multifocal")))
                .andExpect(MockMvcResultMatchers.jsonPath("$.totalItems", Matchers.is(totalItemsSaWithMultifocal)))
                .andExpect(MockMvcResultMatchers.jsonPath("$.currentPage", Matchers.is(2)))
                .andDo(print());

        this.mockMvc.perform(get("/api/glasses/sa?size=2&page=2&sort=sku,desc&search=glassesType==aaa"))
                .andExpect(status().is4xxClientError())
                .andExpect(MockMvcResultMatchers.content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.jsonPath("$.error", Matchers.is(notNullValue())))
                .andDo(print());
    }

    @Test
    public void givenGlasses_whenDeleteGlasses_thenStatus204()
            throws Exception {

        Glasses saveEntitySa = mainService.saveGlasses(
                new Glasses("multifocal", "medium", "neutral", "sm", new Dispense(),
                        new Eye(BigDecimal.ONE, BigDecimal.valueOf(-2), 2, BigDecimal.ONE),
                        new Eye(BigDecimal.ONE, BigDecimal.valueOf(-2), 2, BigDecimal.ONE)));


        this.mockMvc.perform(delete("/api/glasses/sm/" + saveEntitySa.getSku()))
                .andExpect(status().isNoContent())
                .andDo(print());

        this.mockMvc.perform(delete("/api/glasses/sm/-1"))
                .andExpect(status().is4xxClientError())
                .andDo(print());
    }


    @Test
    public void updateGlasses_thenStatus200()
            throws Exception {
        Glasses glasses =
                new Glasses("multifocal", "small", "neutral", "sm", new Dispense(),
                        new Eye(BigDecimal.ONE, BigDecimal.valueOf(-2), 2, BigDecimal.ONE),
                        new Eye(BigDecimal.ONE, BigDecimal.valueOf(-2), 2, BigDecimal.ONE));

        MvcResult result = this.mockMvc.perform(post("/api/glasses").contentType(MediaType.APPLICATION_JSON).content(
                objectMapper.writeValueAsBytes(GlassesMapperImpl.getInstance().glassesToGlassesRequestDTO(glasses))))
                .andExpect(status().isCreated())
                .andExpect(MockMvcResultMatchers.jsonPath("$.sku", Matchers.is(5001)))
                .andExpect(MockMvcResultMatchers.content().contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andReturn();

        Glasses glassesToUpdate =
                new Glasses("multifocal", "medium", "feminine", "sm", new Dispense(),
                        new Eye(BigDecimal.valueOf(2), BigDecimal.valueOf(-5), 3, BigDecimal.valueOf(2)),
                        new Eye(BigDecimal.valueOf(2), BigDecimal.valueOf(-5), 3, BigDecimal.valueOf(2)));

        this.mockMvc.perform(MockMvcRequestBuilders.put("/api/glasses/sm/" + 5001).contentType(MediaType.APPLICATION_JSON)
                .content(
                        objectMapper.writeValueAsBytes(GlassesMapperImpl.getInstance().glassesToGlassesRequestDTO(glassesToUpdate))))
                .andExpect(status().isOk())
                .andExpect(MockMvcResultMatchers.content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.jsonPath("$.sku", Matchers.is(5001)))
                .andExpect(MockMvcResultMatchers.jsonPath("$.appearance", Matchers.is(glassesToUpdate.getAppearance().name())))
                .andExpect(MockMvcResultMatchers.jsonPath("$.glassesType", Matchers.is(glassesToUpdate.getGlassesType().name())))
                .andExpect(MockMvcResultMatchers.jsonPath("$.glassesSize", Matchers.is(glassesToUpdate.getGlassesSize().name())))
                .andExpect(MockMvcResultMatchers.jsonPath("$.os.cylinder", Matchers.is(glassesToUpdate.getOs().getCylinder().intValue())))
                .andExpect(MockMvcResultMatchers.jsonPath("$.od.cylinder", Matchers.is(glassesToUpdate.getOd().getCylinder().intValue())))
                .andDo(print());

        GlassesRequestDTO failGlassesToUpdate =
                new GlassesRequestDTO("multifocal", "medium", "test", "sm",
                        new EyeDTO(BigDecimal.valueOf(2), BigDecimal.valueOf(-5), 3, BigDecimal.valueOf(2)),
                        new EyeDTO(BigDecimal.valueOf(2), BigDecimal.valueOf(-5), 3, BigDecimal.valueOf(2)));

        this.mockMvc.perform(MockMvcRequestBuilders.put("/api/glasses/sm/" + 5001).contentType(MediaType.APPLICATION_JSON)
                .content(
                        objectMapper.writeValueAsBytes(failGlassesToUpdate)))
                .andExpect(status().is4xxClientError())
                .andExpect(MockMvcResultMatchers.content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
                .andDo(print());
    }

    @Test
    public void givenGlasses_Dispense_And_Undispense()
            throws Exception {

        Glasses saveEntitySa = mainService.saveGlasses(
                new Glasses("multifocal", "medium", "neutral", "sa", new Dispense(),
                        new Eye(BigDecimal.ONE, BigDecimal.valueOf(-2), 2, BigDecimal.ONE),
                        new Eye(BigDecimal.ONE, BigDecimal.valueOf(-2), 2, BigDecimal.ONE)));


        // Get create Glasses
        this.mockMvc.perform(get("/api/glasses/sa/" + saveEntitySa.getSku()))
                .andExpect(status().isOk())
                .andExpect(MockMvcResultMatchers.content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.jsonPath("$.sku", Matchers.is(saveEntitySa.getSku())))
                .andExpect(MockMvcResultMatchers.jsonPath("$.glassesType", Matchers.is(saveEntitySa.getGlassesType().name())))
                .andExpect(MockMvcResultMatchers.jsonPath("$.glassesSize", Matchers.is(saveEntitySa.getGlassesSize().name())))
                .andExpect(MockMvcResultMatchers.jsonPath("$.dispensed", Matchers.is(false)))
                .andExpect(MockMvcResultMatchers.jsonPath("$.appearance", Matchers.is(saveEntitySa.getAppearance().name())))
                .andExpect(MockMvcResultMatchers.jsonPath("$.os.cylinder", Matchers.is(saveEntitySa.getOs().getCylinder().doubleValue())))
                .andExpect(MockMvcResultMatchers.jsonPath("$.od.cylinder", Matchers.is(saveEntitySa.getOd().getCylinder().doubleValue())))
                .andDo(print());

        // Dispense created Glasses for first time
        this.mockMvc.perform(put("/api/glasses/dispense/sa/" + saveEntitySa.getSku()))
                .andExpect(status().isOk())
                .andDo(print());

        // Dispense created Glasses for second time --> Sku not valid anymore
        this.mockMvc.perform(put("/api/glasses/dispense/sa/" + saveEntitySa.getSku()))
                .andExpect(status().is4xxClientError())
                .andDo(print());

        // Dispense non existing Glasses
        this.mockMvc.perform(put("/api/glasses/dispense/sa/" + -1))
                .andExpect(status().isNotFound())
                .andDo(print());

        // try to get created Glasses
        this.mockMvc.perform(get("/api/glasses/sa/" + saveEntitySa.getSku()))
                .andExpect(status().isNotFound())
                .andExpect(MockMvcResultMatchers.content().contentType(MediaType.APPLICATION_JSON))
                .andDo(print());

        // check if created Glasses is dispensed
        this.mockMvc.perform(get("/api/glasses/dispensed/sa"))
                .andExpect(status().isOk())
                .andExpect(MockMvcResultMatchers.content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.jsonPath("$.[0].location", Matchers.is("sa")))
                .andExpect(MockMvcResultMatchers.jsonPath("$.[0].glassesType", Matchers.is(saveEntitySa.getGlassesType().name())))
                .andExpect(MockMvcResultMatchers.jsonPath("$.[0].glassesSize", Matchers.is(saveEntitySa.getGlassesSize().name())))
                .andExpect(MockMvcResultMatchers.jsonPath("$.[0].dispensed", Matchers.is(true)))
                .andExpect(MockMvcResultMatchers.jsonPath("$.[0].appearance", Matchers.is(saveEntitySa.getAppearance().name())))
                .andExpect(
                        MockMvcResultMatchers.jsonPath("$.[0].os.cylinder", Matchers.is(saveEntitySa.getOs().getCylinder().doubleValue())))
                .andExpect(
                        MockMvcResultMatchers.jsonPath("$.[0].od.cylinder", Matchers.is(saveEntitySa.getOd().getCylinder().doubleValue())))
                .andDo(print());


        Glasses saveEntitySa2 = mainService.saveGlasses(
                new Glasses("multifocal", "medium", "neutral", "sa", new Dispense(),
                        new Eye(BigDecimal.ONE, BigDecimal.valueOf(-2), 2, BigDecimal.ONE),
                        new Eye(BigDecimal.ONE, BigDecimal.valueOf(-2), 2, BigDecimal.ONE)));

        // Try to Undispense firstly created glass -> not possible because of secondly created glass
        this.mockMvc.perform(put("/api/glasses/undispense/" + saveEntitySa.getId()))
                .andExpect(status().isBadRequest())
                .andDo(print());

        // dispense secondly created glass
        this.mockMvc.perform(put("/api/glasses/dispense/sa/" + saveEntitySa2.getSku()))
                .andExpect(status().isOk())
                .andDo(print());


        // undispense secondly created glass
        this.mockMvc.perform(put("/api/glasses/undispense/" + saveEntitySa2.getId()))
                .andExpect(status().isOk())
                .andDo(print());
        // undispense secondly created glass second time
        this.mockMvc.perform(put("/api/glasses/undispense/" + saveEntitySa2.getId()))
                .andExpect(status().isNoContent())
                .andDo(print());
        // undispense empty glasss
        this.mockMvc.perform(put("/api/glasses/undispense/fsdg"))
                .andExpect(status().isBadRequest())
                .andDo(print());

        // undispense wrong id glasss
        saveEntitySa.setId(-1L);
        this.mockMvc.perform(put("/api/glasses/undispense/" + saveEntitySa.getId()))
                .andExpect(status().isBadRequest())
                .andDo(print());

        this.mockMvc.perform(get("/api/glasses/sa/" + saveEntitySa2.getSku()))
                .andExpect(status().isOk())
                .andExpect(MockMvcResultMatchers.content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.jsonPath("$.sku", Matchers.is(saveEntitySa2.getSku())))
                .andExpect(MockMvcResultMatchers.jsonPath("$.glassesType", Matchers.is(saveEntitySa2.getGlassesType().name())))
                .andExpect(MockMvcResultMatchers.jsonPath("$.glassesSize", Matchers.is(saveEntitySa2.getGlassesSize().name())))
                .andExpect(MockMvcResultMatchers.jsonPath("$.dispensed", Matchers.is(false)))
                .andExpect(MockMvcResultMatchers.jsonPath("$.appearance", Matchers.is(saveEntitySa2.getAppearance().name())))
                .andExpect(MockMvcResultMatchers.jsonPath("$.os.cylinder", Matchers.is(saveEntitySa2.getOs().getCylinder().doubleValue())))
                .andExpect(MockMvcResultMatchers.jsonPath("$.od.cylinder", Matchers.is(saveEntitySa2.getOd().getCylinder().doubleValue())))
                .andDo(print());
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
}
