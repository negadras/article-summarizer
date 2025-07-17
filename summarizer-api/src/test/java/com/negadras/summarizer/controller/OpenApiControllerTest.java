package com.negadras.summarizer.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(OpenApiController.class)
class OpenApiControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void getApiDocs_shouldReturnJsonOpenApiSpec() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.openapi").value("3.0.3"))
                .andExpect(jsonPath("$.info.title").value("Article Summarizer API"))
                .andExpect(jsonPath("$.info.version").value("1.0.0"))
                .andExpect(jsonPath("$.info.description").exists())
                .andExpect(jsonPath("$.servers").isArray())
                .andExpect(jsonPath("$.servers", hasSize(greaterThan(0))))
                .andExpect(jsonPath("$.paths").exists())
                .andExpect(jsonPath("$.paths['/api/summarize/text']").exists())
                .andExpect(jsonPath("$.paths['/api/summarize/url']").exists())
                .andExpect(jsonPath("$.components.schemas").exists())
                .andExpect(jsonPath("$.components.schemas.ErrorResponse").exists())
                .andExpect(jsonPath("$.components.schemas.SummarizationResponse").exists());
    }

    @Test
    void getApiDocs_shouldIncludeExpectedEndpoints() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paths['/api/summarize/text'].post").exists())
                .andExpect(jsonPath("$.paths['/api/summarize/url'].post").exists())
                .andExpect(jsonPath("$.paths['/api/summarize/text'].post.summary").value("Summarize text content"))
                .andExpect(jsonPath("$.paths['/api/summarize/url'].post.summary").value("Summarize content from URL"));
    }

    @Test
    void getApiDocs_shouldIncludeResponseSchemas() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paths['/api/summarize/text'].post.responses['200']").exists())
                .andExpect(jsonPath("$.paths['/api/summarize/text'].post.responses['400']").exists())
                .andExpect(jsonPath("$.paths['/api/summarize/text'].post.responses['500']").exists())
                .andExpect(jsonPath("$.paths['/api/summarize/url'].post.responses['200']").exists())
                .andExpect(jsonPath("$.paths['/api/summarize/url'].post.responses['400']").exists())
                .andExpect(jsonPath("$.paths['/api/summarize/url'].post.responses['500']").exists());
    }

    @Test
    void getApiDocs_shouldIncludeComponentSchemas() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.components.schemas.TextSummarizeRequest").exists())
                .andExpect(jsonPath("$.components.schemas.UrlSummarizeRequest").exists())
                .andExpect(jsonPath("$.components.schemas.SummarizationResponse").exists())
                .andExpect(jsonPath("$.components.schemas.Article").exists())
                .andExpect(jsonPath("$.components.schemas.Summary").exists())
                .andExpect(jsonPath("$.components.schemas.ErrorResponse").exists());
    }

    @Test
    void getOpenApiYaml_shouldReturnYamlOpenApiSpec() throws Exception {
        mockMvc.perform(get("/openapi.yaml"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith("application/yaml"))
                .andExpect(content().string(containsString("openapi: 3.0.3")))
                .andExpect(content().string(containsString("Article Summarizer API")))
                .andExpect(content().string(containsString("version: 1.0.0")));
    }

    @Test
    void getOpenApiYaml_shouldContainExpectedPaths() throws Exception {
        mockMvc.perform(get("/openapi.yaml"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("/api/summarize/text")))
                .andExpect(content().string(containsString("/api/summarize/url")))
                .andExpect(content().string(containsString("post:")))
                .andExpect(content().string(containsString("Summarize text content")))
                .andExpect(content().string(containsString("Summarize content from URL")));
    }

    @Test
    void getOpenApiYaml_shouldContainSchemaDefinitions() throws Exception {
        mockMvc.perform(get("/openapi.yaml"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("components:")))
                .andExpect(content().string(containsString("schemas:")))
                .andExpect(content().string(containsString("TextSummarizeRequest:")))
                .andExpect(content().string(containsString("UrlSummarizeRequest:")))
                .andExpect(content().string(containsString("SummarizationResponse:")))
                .andExpect(content().string(containsString("ErrorResponse:")));
    }

    @Test
    void getOpenApiYaml_shouldContainServerInformation() throws Exception {
        mockMvc.perform(get("/openapi.yaml"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("servers:")))
                .andExpect(content().string(containsString("http://localhost:8080")))
                .andExpect(content().string(containsString("Development server")));
    }

    @Test
    void getApiDocsHealth_shouldReturnUpWhenFileExists() throws Exception {
        mockMvc.perform(get("/v3/api-docs/health"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.openapi").value("available"));
    }

    @Test
    void getApiDocs_shouldReturnCorrectContentType() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", MediaType.APPLICATION_JSON_VALUE));
    }

    @Test
    void getOpenApiYaml_shouldReturnCorrectContentType() throws Exception {
        mockMvc.perform(get("/openapi.yaml"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/yaml"));
    }

    @Test
    void getApiDocs_multipleRequests_shouldReturnConsistentResults() throws Exception {
        String firstResponse = mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String secondResponse = mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        assert firstResponse.equals(secondResponse);
    }

    @Test
    void getOpenApiYaml_multipleRequests_shouldReturnConsistentResults() throws Exception {
        String firstResponse = mockMvc.perform(get("/openapi.yaml"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String secondResponse = mockMvc.perform(get("/openapi.yaml"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        assert firstResponse.equals(secondResponse);
    }

    @Test
    void getApiDocs_shouldReturnValidJsonStructure() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.openapi").isString())
                .andExpect(jsonPath("$.info").isMap())
                .andExpect(jsonPath("$.paths").isMap())
                .andExpect(jsonPath("$.components").isMap())
                .andExpect(jsonPath("$.servers").isArray());
    }

    @Test
    void getOpenApiYaml_shouldContainRequiredFields() throws Exception {
        mockMvc.perform(get("/openapi.yaml"))
                .andExpect(status().isOk())
                .andExpect(content().string(matchesPattern("(?s).*openapi:\\s*[0-9.]+.*")))
                .andExpect(content().string(matchesPattern("(?s).*info:.*")))
                .andExpect(content().string(matchesPattern("(?s).*paths:.*")));
    }
}
