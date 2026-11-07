package org.pvh.rest;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.junit.jupiter.api.Test;
import org.pvh.IntegrationTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@IntegrationTest
@WithMockUser(roles = "USER")
public class ClientErrorControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private MeterRegistry meterRegistry;

    private double count() {
        Counter counter = meterRegistry.find("reims.client.errors").counter();
        return counter == null ? 0 : counter.count();
    }

    private ResultActions report(String body) throws Exception {
        return mockMvc.perform(post("/api/clientErrors").contentType(MediaType.APPLICATION_JSON).content(body));
    }

    @Test
    public void report_isCounted() throws Exception {
        double before = count();
        report("{\"message\":\"TypeError: x is undefined\\nat App.vue\",\"version\":\"abc1234\"}")
            .andExpect(status().isNoContent());
        assertEquals(before + 1, count());
    }

    @Test
    public void report_withoutMessage_isBadRequest() throws Exception {
        report("{\"message\":\"\"}").andExpect(status().isBadRequest());
    }

    @Test
    @WithAnonymousUser
    public void report_needsLogin() throws Exception {
        report("{\"message\":\"boom\"}").andExpect(status().isUnauthorized());
    }
}
