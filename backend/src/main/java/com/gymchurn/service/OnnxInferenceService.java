package com.gymchurn.service;

import ai.onnxruntime.*;
import com.gymchurn.model.ChurnPredictionResponse;
import com.gymchurn.model.MemberFeatureRequest;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

/**
 * OnnxInferenceService
 * ────────────────────
 * Loads the exported churn_model.onnx file at startup, then runs
 * in-memory inference for each member prediction request.
 *
 * ONNX Runtime is used directly — no Python server is needed.
 */
@Slf4j
@Service
public class OnnxInferenceService {

    @Value("${model.onnx.path:../churn_model.onnx}")
    private String modelPath;

    private OrtEnvironment env;
    private OrtSession   session;

    // ─────────────────────────────────────────────────────────
    // Lifecycle
    // ─────────────────────────────────────────────────────────

    @PostConstruct
    public void loadModel() throws OrtException {
        log.info("Attempting to load ONNX model...");
        env = OrtEnvironment.getEnvironment();

        java.io.File primaryFile = new java.io.File(modelPath);
        java.io.File fallbackFile = new java.io.File("churn_model.onnx");
        java.io.File rootFile = new java.io.File("../churn_model.onnx");

        String actualPath = null;
        if (primaryFile.exists()) {
            actualPath = primaryFile.getAbsolutePath();
        } else if (fallbackFile.exists()) {
            actualPath = fallbackFile.getAbsolutePath();
        } else if (rootFile.exists()) {
            actualPath = rootFile.getAbsolutePath();
        }

        if (actualPath != null) {
            log.info("Loading ONNX model from file: {}", actualPath);
            session = env.createSession(actualPath, new OrtSession.SessionOptions());
        } else {
            log.info("File not found on disk, attempting classpath resource loading...");
            try (var is = getClass().getResourceAsStream("/churn_model.onnx")) {
                if (is == null) {
                    throw new IllegalStateException("churn_model.onnx not found on classpath or disk.");
                }
                byte[] bytes = is.readAllBytes();
                session = env.createSession(bytes, new OrtSession.SessionOptions());
                log.info("Successfully loaded ONNX model from classpath resource.");
            } catch (Exception e) {
                throw new OrtException("Failed to load ONNX model: " + e.getMessage());
            }
        }

        log.info("✓ ONNX model loaded successfully. Input names: {}", session.getInputNames());
    }

    @PreDestroy
    public void closeModel() throws OrtException {
        if (session != null) session.close();
        if (env     != null) env.close();
        log.info("ONNX session closed.");
    }

    // ─────────────────────────────────────────────────────────
    // Inference
    // ─────────────────────────────────────────────────────────

    /**
     * Runs churn prediction for a single member.
     *
     * @param request  Deserialized member feature payload
     * @return         Full ChurnPredictionResponse with risk stratification
     */
    public ChurnPredictionResponse predict(MemberFeatureRequest request) throws OrtException {

        float[] features = request.toFeatureVector();

        // Build input tensor: shape [1, 14]
        float[][] input2D = new float[][]{ features };
        OnnxTensor inputTensor = OnnxTensor.createTensor(env, input2D);

        // Run ONNX session
        Map<String, OnnxTensor> inputMap = Map.of("float_input", inputTensor);
        OrtSession.Result result = session.run(inputMap);

        // Output[0] → predicted label (long[])
        // Output[1] → probability map (OnnxMap / float[][])
        long[] labels = (long[]) result.get(0).getValue();
        int predictedLabel = (int) labels[0];

        // Extract churn probability from output index 1
        Object rawProbs = result.get(1).getValue();
        log.info("ONNX rawProbs class: {}, content: {}",
                 rawProbs != null ? rawProbs.getClass().getName() : "null", rawProbs);

        double churnProb = 0.0;
        if (rawProbs instanceof List<?> list && !list.isEmpty()) {
            churnProb = extractProbFromMap(list.get(0));
        } else if (rawProbs instanceof Map<?, ?>[] mapArray && mapArray.length > 0) {
            churnProb = extractProbFromMap(mapArray[0]);
        } else {
            churnProb = extractProbFromMap(rawProbs);
        }

        inputTensor.close();
        result.close();

        return buildResponse(predictedLabel, churnProb);
    }

    // ─────────────────────────────────────────────────────────
    // Risk Stratification & Retention Strategy Mapping
    // ─────────────────────────────────────────────────────────

    private ChurnPredictionResponse buildResponse(int label, double prob) {
        String riskLevel;
        String riskColor;
        String strategy;
        List<String> actions;

        if (prob >= 0.70) {
            riskLevel = "HIGH";
            riskColor = "#FF4757";
            strategy  = "Immediate intervention required — member is at critical churn risk.";
            actions   = List.of(
                "🚨 Automated alert dispatched to gym manager",
                "📞 Schedule 1-on-1 personal trainer consultation",
                "🎯 Offer complimentary 30-day fitness assessment",
                "💰 Apply targeted 25% loyalty discount on next renewal",
                "📊 Review member's recent attendance decline pattern"
            );
        } else if (prob >= 0.40) {
            riskLevel = "MEDIUM";
            riskColor = "#FFA502";
            strategy  = "Member engagement is weakening — proactive outreach recommended.";
            actions   = List.of(
                "📱 Send personalized WhatsApp/SMS re-engagement reminder",
                "🎽 Invite to upcoming group classes (Zumba, CrossFit, HIIT)",
                "🏆 Enroll in monthly fitness challenge with rewards",
                "📧 Share customized 4-week workout plan via email",
                "🤝 Pair with a workout buddy through gym community board"
            );
        } else {
            riskLevel = "LOW";
            riskColor = "#2ED573";
            strategy  = "Member is well-engaged — maintain momentum with loyalty rewards.";
            actions   = List.of(
                "🌟 Enroll in VIP loyalty tier with premium benefits",
                "👥 Activate referral discount program (bring a friend)",
                "🎁 Send monthly milestone appreciation message",
                "📈 Share progress insights — calories burned, PRs set",
                "🏅 Recognize in gym's 'Member of the Month' spotlight"
            );
        }

        String probPct = String.format("%.1f%%", prob * 100);

        return ChurnPredictionResponse.builder()
            .predictedLabel(label)
            .churnProbability(prob)
            .churnProbabilityPct(probPct)
            .riskLevel(riskLevel)
            .riskColor(riskColor)
            .retentionStrategy(strategy)
            .actionItems(actions)
            .build();
    }

    private double extractProbFromMap(Object obj) throws OrtException {
        if (obj instanceof ai.onnxruntime.OnnxMap onnxMap) {
            obj = onnxMap.getValue();
        }
        if (!(obj instanceof Map<?, ?> map)) {
            log.warn("Expected Map for probabilities, but got: {}", obj != null ? obj.getClass().getName() : "null");
            return 0.0;
        }
        log.info("Inspecting probability map: {}", map);
        // Primary search for key 1
        for (Map.Entry<?, ?> entry : map.entrySet()) {
            String keyStr = String.valueOf(entry.getKey()).trim();
            if ("1".equals(keyStr) || "1.0".equals(keyStr) || "true".equalsIgnoreCase(keyStr)) {
                if (entry.getValue() instanceof Number num) {
                    return num.doubleValue();
                }
            }
        }
        // Fallback search for key 0
        for (Map.Entry<?, ?> entry : map.entrySet()) {
            String keyStr = String.valueOf(entry.getKey()).trim();
            if ("0".equals(keyStr) || "0.0".equals(keyStr) || "false".equalsIgnoreCase(keyStr)) {
                if (entry.getValue() instanceof Number num) {
                    return 1.0 - num.doubleValue();
                }
            }
        }
        // Fallback: second value in map
        if (map.size() >= 2) {
            var iterator = map.values().iterator();
            iterator.next();
            Object val = iterator.next();
            if (val instanceof Number num) {
                return num.doubleValue();
            }
        }
        return 0.0;
    }

    // Health-check helper
    public boolean isModelLoaded() {
        return session != null;
    }
}
