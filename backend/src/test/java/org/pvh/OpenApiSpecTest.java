package org.pvh;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.fail;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

// snapshot of the API, the frontend generates its types from it
@SpringBootTest
@AutoConfigureMockMvc
@Import(MariaDbTestConfiguration.class)
public class OpenApiSpecTest {

    private static final Path SPEC = Path.of("openapi.json");

    @Autowired
    private MockMvc mockMvc;

    @Test
    void committedSpecIsUpToDate() throws Exception {
        String spec = mockMvc.perform(get("/v3/api-docs")).andReturn().getResponse().getContentAsString() + "\n";
        if (Files.exists(SPEC) && Files.readString(SPEC).equals(spec))
            return;
        Files.writeString(SPEC, spec);
        fail("The API changed, commit the updated backend/openapi.json and run pnpm generate:api in frontend/");
    }
}
