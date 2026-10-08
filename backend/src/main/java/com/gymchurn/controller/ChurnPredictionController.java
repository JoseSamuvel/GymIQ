package com.gymchurn.controller;

import com.gymchurn.model.ChurnPredictionResponse;
import com.gymchurn.model.MemberFeatureRequest;
import com.gymchurn.service.OnnxInferenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * ChurnPredictionController
 * ─────────────────────────
 * REST endpoints for the Gym Churn Prediction System.
 *
 * POST /api/predict        → Run churn prediction for a member
 * GET  /api/health         → Service health check
 */
@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")   // Allow React frontend on any port
public class ChurnPredictionController {

    private final OnnxInferenceService inferenceService;

    // ─────────────────────────────────────────────────────────
    // POST /api/predict
    // ─────────────────────────────────────────────────────────

    /**
     * Accepts member feature data, runs ONNX inference,
     * and returns a full churn prediction with risk level + retention strategy.
     *
     * @param request  MemberFeatureRequest JSON body
     * @return         200 OK with ChurnPredictionResponse
     */
    @PostMapping("/predict")
    public ResponseEntity<?> predict(@RequestBody MemberFeatureRequest request) {
        log.info("Received prediction request: visits={}, tenure={}, age={}",
                 request.getVisitsPerMonth(), request.getTenureDays(), request.getAge());
        try {
            ChurnPredictionResponse response = inferenceService.predict(request);
            log.info("Prediction: label={}, prob={}, risk={}",
                     response.getPredictedLabel(),
                     response.getChurnProbabilityPct(),
                     response.getRiskLevel());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Prediction failed: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Prediction failed: " + e.getMessage()));
        }
    }

    // ─────────────────────────────────────────────────────────
    // GET /api/health
    // ─────────────────────────────────────────────────────────

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
            "status",      "UP",
            "service",     "Gym Churn Prediction API",
            "modelLoaded", inferenceService.isModelLoaded(),
            "version",     "1.0.0"
        ));
    }
}
