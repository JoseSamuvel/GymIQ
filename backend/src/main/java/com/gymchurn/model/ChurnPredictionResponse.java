package com.gymchurn.model;

import lombok.Builder;
import lombok.Data;

/**
 * Churn prediction response returned to the frontend.
 */
@Data
@Builder
public class ChurnPredictionResponse {

    /** Predicted class label: 0 = Retained, 1 = Churned */
    private int predictedLabel;

    /** Churn probability (0.0 – 1.0), from ONNX softmax output */
    private double churnProbability;

    /** Human-readable probability percentage */
    private String churnProbabilityPct;

    /** Risk level: HIGH / MEDIUM / LOW */
    private String riskLevel;

    /** Color hex for risk badge (#color) */
    private String riskColor;

    /** Intervention message tailored to risk level */
    private String retentionStrategy;

    /** Specific action items list */
    private java.util.List<String> actionItems;
}
