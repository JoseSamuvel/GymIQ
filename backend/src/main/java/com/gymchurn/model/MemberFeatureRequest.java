package com.gymchurn.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Incoming member feature payload for churn prediction.
 * Field names mirror the cleaned_gym_members.csv column schema.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MemberFeatureRequest {

    // ── Numerical Features ──────────────────────────────────
    @JsonProperty("age")
    private float age;

    @JsonProperty("avg_workout_duration_min")
    private float avgWorkoutDurationMin;

    @JsonProperty("avg_calories_burned")
    private float avgCaloriesBurned;

    @JsonProperty("total_weight_lifted_kg")
    private float totalWeightLiftedKg;

    @JsonProperty("visits_per_month")
    private float visitsPerMonth;

    @JsonProperty("tenure_days")
    private float tenureDays;

    // ── Binary / One-Hot Encoded Features ───────────────────
    @JsonProperty("gender_male")
    private int genderMale;                        // 1 = Male, 0 = Female

    @JsonProperty("membership_type_quarterly")
    private int membershipTypeQuarterly;           // 1 = Quarterly

    @JsonProperty("membership_type_yearly")
    private int membershipTypeYearly;              // 1 = Yearly (Monthly = 0 in both)

    @JsonProperty("favorite_exercise_cycling")
    private int favoriteExerciseCycling;

    @JsonProperty("favorite_exercise_deadlift")
    private int favoriteExerciseDeadlift;

    @JsonProperty("favorite_exercise_pullups")
    @com.fasterxml.jackson.annotation.JsonAlias("favorite_exercise_pull-ups")
    private int favoriteExercisePullups;

    @JsonProperty("favorite_exercise_squats")
    private int favoriteExerciseSquats;

    @JsonProperty("favorite_exercise_treadmill")
    private int favoriteExerciseTreadmill;

    /**
     * Converts this request into a float[] feature vector
     * matching the exact column order used during Python training.
     *
     * Column order (from cleaned_gym_members.csv):
     *   Age, Avg_Workout_Duration_Min, Avg_Calories_Burned, Total_Weight_Lifted_kg,
     *   Visits_Per_Month, Tenure_Days, Gender_Male, Membership_Type_Quarterly,
     *   Membership_Type_Yearly, Favorite_Exercise_Cycling, Favorite_Exercise_Deadlift,
     *   Favorite_Exercise_Pull-ups, Favorite_Exercise_Squats, Favorite_Exercise_Treadmill
     */
    public float[] toFeatureVector() {
        return new float[]{
            age,
            avgWorkoutDurationMin,
            avgCaloriesBurned,
            totalWeightLiftedKg,
            visitsPerMonth,
            tenureDays,
            genderMale,
            membershipTypeQuarterly,
            membershipTypeYearly,
            favoriteExerciseCycling,
            favoriteExerciseDeadlift,
            favoriteExercisePullups,
            favoriteExerciseSquats,
            favoriteExerciseTreadmill
        };
    }
}
