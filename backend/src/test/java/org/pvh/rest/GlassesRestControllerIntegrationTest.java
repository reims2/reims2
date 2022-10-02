package org.pvh.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.hamcrest.Matchers;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.pvh.model.dto.EyeDTO;
import org.pvh.model.dto.GlassesDTO;
import org.pvh.model.dto.GlassesResponseDTO;
import org.pvh.model.entity.Dispense;
import org.pvh.model.entity.Eye;
import org.pvh.model.entity.Glasses;
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
            new Glasses("multifocal", "small", "neutral", "sm", new Dispense(), new Eye(BigDecimal.ONE, BigDecimal.valueOf(-2), 2, BigDecimal.ONE),
                new Eye(BigDecimal.ONE, BigDecimal.valueOf(-2), 2, BigDecimal.ONE));

        Glasses failGlasses =
            new Glasses("multifocal", "small", "neutral", "ss",
                new Dispense(), new Eye(BigDecimal.ONE, BigDecimal.valueOf(-2), 2, BigDecimal.ONE),
                new Eye(BigDecimal.ONE, BigDecimal.valueOf(-2), 2, BigDecimal.ONE));

        this.mockMvc.perform(post("/api/glasses/").contentType(MediaType.APPLICATION_JSON).content(
                objectMapper.writeValueAsBytes(GlassesMapperImpl.getInstance().glassesToGlassesDTO(glasses))))
            .andExpect(status().isCreated())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(MockMvcResultMatchers.jsonPath("$.glassesType", Matchers.is(glasses.getGlassesType().name())))
            .andExpect(MockMvcResultMatchers.jsonPath("$.glassesSize", Matchers.is(glasses.getGlassesSize().name())))
            .andExpect(MockMvcResultMatchers.jsonPath("$.appearance", Matchers.is(glasses.getAppearance().name())))
            .andExpect(MockMvcResultMatchers.jsonPath("$.os.cylinder", Matchers.is(glasses.getOs().getCylinder().intValue())))
            .andExpect(MockMvcResultMatchers.jsonPath("$.od.cylinder", Matchers.is(glasses.getOd().getCylinder().intValue())))

            .andDo(print());

        this.mockMvc.perform(post("/api/glasses/").contentType(MediaType.APPLICATION_JSON).content(
                objectMapper.writeValueAsBytes(GlassesMapperImpl.getInstance().glassesToGlassesDTO(glasses))))
            .andExpect(status().isCreated())
            .andExpect(MockMvcResultMatchers.content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(MockMvcResultMatchers.jsonPath("$.glassesType", Matchers.is(glasses.getGlassesType().name())))
            .andExpect(MockMvcResultMatchers.jsonPath("$.glassesSize", Matchers.is(glasses.getGlassesSize().name())))
            .andExpect(MockMvcResultMatchers.jsonPath("$.appearance", Matchers.is(glasses.getAppearance().name())))
            .andExpect(MockMvcResultMatchers.jsonPath("$.os.cylinder", Matchers.is(glasses.getOs().getCylinder().intValue())))
            .andExpect(MockMvcResultMatchers.jsonPath("$.od.cylinder", Matchers.is(glasses.getOd().getCylinder().intValue())))
            .andDo(print());

        this.mockMvc.perform(post("/api/glasses/").contentType(MediaType.APPLICATION_JSON).content(
                objectMapper.writeValueAsBytes(GlassesMapperImpl.getInstance().glassesToGlassesDTO(failGlasses))))
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
            new Glasses("multifocal", "medium", "neutral", "sm", new Dispense(), new Eye(BigDecimal.ONE, BigDecimal.valueOf(-2), 2, BigDecimal.ONE),
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

        var totalItems = mainService.findByDispensedAndLocation(false,"sm").size();

        this.mockMvc.perform(get("/api/glasses/sm?size=2&page=0&sort=sku,asc" ))
            .andExpect(status().isOk())
            .andExpect(MockMvcResultMatchers.content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(MockMvcResultMatchers.jsonPath("$.glasses[0].location", Matchers.is("sm")))
            .andExpect(MockMvcResultMatchers.jsonPath("$.totalItems", Matchers.is(totalItems)))
            .andExpect(MockMvcResultMatchers.jsonPath("$.currentPage", Matchers.is(0)))
            .andDo(print());

    }

    @Test
    public void givenGlasses_whenDeleteGlasses_thenStatus204()
        throws Exception {

        Glasses saveEntitySa = mainService.saveGlasses(
            new Glasses("multifocal", "medium", "neutral", "sm", new Dispense(), new Eye(BigDecimal.ONE, BigDecimal.valueOf(-2), 2, BigDecimal.ONE),
                new Eye(BigDecimal.ONE, BigDecimal.valueOf(-2), 2, BigDecimal.ONE)));


        this.mockMvc.perform(delete("/api/glasses/sm/" + saveEntitySa.getSku()))
            .andExpect(status().isNoContent())
            .andDo(print());
    }


    @Test
    public void updateGlasses_thenStatus200()
        throws Exception {
        Glasses glasses =
            new Glasses("multifocal", "small", "neutral", "sm", new Dispense(), new Eye(BigDecimal.ONE, BigDecimal.valueOf(-2), 2, BigDecimal.ONE),
                new Eye(BigDecimal.ONE, BigDecimal.valueOf(-2), 2, BigDecimal.ONE));

        MvcResult result = this.mockMvc.perform(post("/api/glasses/").contentType(MediaType.APPLICATION_JSON).content(
                objectMapper.writeValueAsBytes(GlassesMapperImpl.getInstance().glassesToGlassesDTO(glasses))))
            .andExpect(status().isCreated())
            .andExpect(MockMvcResultMatchers.jsonPath("$.sku", Matchers.is(5000)))
            .andExpect(MockMvcResultMatchers.content().contentType(MediaType.APPLICATION_JSON))
            .andDo(print())
            .andReturn();

        Glasses glassesToUpdate =
            new Glasses("multifocal", "medium", "feminine", "sm", new Dispense(), new Eye(BigDecimal.valueOf(2), BigDecimal.valueOf(-5), 3, BigDecimal.valueOf(2)),
                new Eye(BigDecimal.valueOf(2), BigDecimal.valueOf(-5), 3, BigDecimal.valueOf(2)));

        this.mockMvc.perform(MockMvcRequestBuilders.put("/api/glasses/sm/" + 5000).contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsBytes(GlassesMapperImpl.getInstance().glassesToGlassesDTO(glassesToUpdate))))
            .andExpect(status().isOk())
            .andExpect(MockMvcResultMatchers.content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(MockMvcResultMatchers.jsonPath("$.sku", Matchers.is(5000)))
            .andExpect(MockMvcResultMatchers.jsonPath("$.appearance", Matchers.is(glassesToUpdate.getAppearance().name())))
            .andExpect(MockMvcResultMatchers.jsonPath("$.glassesType", Matchers.is(glassesToUpdate.getGlassesType().name())))
            .andExpect(MockMvcResultMatchers.jsonPath("$.glassesSize", Matchers.is(glassesToUpdate.getGlassesSize().name())))
            .andExpect(MockMvcResultMatchers.jsonPath("$.os.cylinder", Matchers.is(glassesToUpdate.getOs().getCylinder().intValue())))
            .andExpect(MockMvcResultMatchers.jsonPath("$.od.cylinder", Matchers.is(glassesToUpdate.getOd().getCylinder().intValue())))
            .andDo(print());

        GlassesDTO failGlassesToUpdate =
            new GlassesDTO("multifocal", "medium", "test", "sm", new EyeDTO(BigDecimal.valueOf(2), BigDecimal.valueOf(-5), 3, BigDecimal.valueOf(2)),
                new EyeDTO(BigDecimal.valueOf(2), BigDecimal.valueOf(-5), 3, BigDecimal.valueOf(2)));

        this.mockMvc.perform(MockMvcRequestBuilders.put("/api/glasses/sm/" + 5000).contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsBytes(failGlassesToUpdate)))
            .andExpect(status().is4xxClientError())
            .andExpect(MockMvcResultMatchers.content().contentType(MediaType.APPLICATION_JSON))
            .andDo(print());
    }

    @Test
    public void givenGlasses_Dispense_And_Undispense()
        throws Exception {

        Glasses saveEntitySa = mainService.saveGlasses(
            new Glasses("multifocal", "medium", "neutral", "sa", new Dispense(), new Eye(BigDecimal.ONE, BigDecimal.valueOf(-2), 2, BigDecimal.ONE),
                new Eye(BigDecimal.ONE, BigDecimal.valueOf(-2), 2, BigDecimal.ONE)));

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


        this.mockMvc.perform(put("/api/glasses/dispense/sa/" + saveEntitySa.getSku()))
            .andExpect(status().isOk())
            .andDo(print());

        this.mockMvc.perform(get("/api/glasses/sa/" + saveEntitySa.getSku()))
            .andExpect(status().isBadRequest())
            .andExpect(MockMvcResultMatchers.content().contentType(MediaType.APPLICATION_JSON))
            .andDo(print());

        this.mockMvc.perform(post("/api/glasses/undispense")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsBytes(GlassesMapperImpl.getInstance().glassesToGlassesDTO(saveEntitySa))))
            .andExpect(status().isOk())
            .andDo(print());

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


    }

}
