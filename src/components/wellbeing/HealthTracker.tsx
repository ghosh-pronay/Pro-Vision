import { useState } from "react";
import { motion } from "framer-motion";
import { Droplets, Plus, Minus, Target, Flame, Footprints, Timer } from "lucide-react";

interface WaterIntake {
  amount: number; // in ml
  timestamp: number;
}

interface Exercise {
  id: string;
  type: "walk" | "run" | "cycle" | "swim" | "yoga" | "gym" | "other";
  duration: number; // in minutes
  calories: number;
  timestamp: number;
}

interface HealthTrackerProps {
  waterGoal?: number; // in ml
  waterIntakes?: WaterIntake[];
  exercises?: Exercise[];
  onAddWater?: (amount: number) => void;
  onRemoveWater?: (index: number) => void;
  onAddExercise?: (exercise: Omit<Exercise, "id" | "timestamp">) => void;
  onRemoveExercise?: (id: string) => void;
}

const WATER_AMOUNTS = [100, 200, 250, 330, 500];

const EXERCISE_TYPES = [
  { type: "walk" as const, label: "Walk", icon: "🚶", caloriesPerMin: 4 },
  { type: "run" as const, label: "Run", icon: "🏃", caloriesPerMin: 10 },
  { type: "cycle" as const, label: "Cycle", icon: "🚴", caloriesPerMin: 8 },
  { type: "swim" as const, label: "Swim", icon: "🏊", caloriesPerMin: 9 },
  { type: "yoga" as const, label: "Yoga", icon: "🧘", caloriesPerMin: 4 },
  { type: "gym" as const, label: "Gym", icon: "💪", caloriesPerMin: 7 },
  { type: "other" as const, label: "Other", icon: "⚡", caloriesPerMin: 5 },
];

export default function HealthTracker({
  waterGoal = 2500,
  waterIntakes = [],
  exercises = [],
  onAddWater,
  onRemoveWater,
  onAddExercise,
  onRemoveExercise,
}: HealthTrackerProps) {
  const [selectedWaterAmount, setSelectedWaterAmount] = useState(250);
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [exerciseType, setExerciseType] = useState<Exercise["type"]>("walk");
  const [exerciseDuration, setExerciseDuration] = useState("30");

  const totalWater = waterIntakes.reduce((sum, intake) => sum + intake.amount, 0);
  const waterProgress = Math.min((totalWater / waterGoal) * 100, 100);

  const totalCalories = exercises.reduce((sum, ex) => sum + ex.calories, 0);
  const totalExerciseMinutes = exercises.reduce((sum, ex) => sum + ex.duration, 0);
  const totalSteps = exercises
    .filter((ex) => ex.type === "walk" || ex.type === "run")
    .reduce((sum, ex) => sum + ex.duration * 100, 0);

  const todayExercises = exercises.filter((ex) => {
    const today = new Date().toDateString();
    return new Date(ex.timestamp).toDateString() === today;
  });

  const handleAddWater = () => {
    onAddWater?.(selectedWaterAmount);
  };

  const handleAddExercise = () => {
    const type = EXERCISE_TYPES.find((t) => t.type === exerciseType);
    const duration = parseInt(exerciseDuration) || 30;
    const calories = duration * (type?.caloriesPerMin || 5);

    onAddExercise?.({
      type: exerciseType,
      duration,
      calories,
    });

    setShowExerciseForm(false);
    setExerciseDuration("30");
  };

  return (
    <div className="space-y-6">
      {/* Water Tracker */}
      <div className="glass-strong rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Droplets className="h-5 w-5 text-blue-500" />
          <h3 className="font-semibold text-foreground">Water Intake</h3>
        </div>

        <div className="relative mb-4">
          <div className="h-32 flex items-end justify-center">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${waterProgress}%` }}
              className="w-24 rounded-b-xl bg-gradient-to-t from-blue-500 to-blue-300"
            />
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold">{totalWater}ml</span>
            <span className="text-xs text-muted-foreground">
              of {waterGoal}ml goal
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1 mb-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className={`h-8 w-6 rounded ${
                i < Math.floor(waterProgress / 10)
                  ? "bg-blue-500"
                  : "bg-white/10"
              }`}
            />
          ))}
        </div>

        <div className="grid grid-cols-5 gap-2 mb-4">
          {WATER_AMOUNTS.map((amount) => (
            <button
              key={amount}
              onClick={() => setSelectedWaterAmount(amount)}
              className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedWaterAmount === amount
                  ? "bg-blue-500 text-white"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10"
              }`}
            >
              {amount}ml
            </button>
          ))}
        </div>

        <button
          onClick={handleAddWater}
          className="w-full py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
        >
          + Add {selectedWaterAmount}ml
        </button>

        {waterIntakes.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-xs text-muted-foreground mb-2">Today's intake:</p>
            <div className="flex flex-wrap gap-2">
              {waterIntakes.slice(-5).map((intake, i) => (
                <span
                  key={i}
                  className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full"
                >
                  {intake.amount}ml
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Exercise Tracker */}
      <div className="glass-strong rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <h3 className="font-semibold text-foreground">Exercise</h3>
          </div>
          <button
            onClick={() => setShowExerciseForm(!showExerciseForm)}
            className="p-2 rounded-lg hover:bg-white/10"
          >
            <Plus className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 rounded-xl bg-white/5">
            <Flame className="h-5 w-5 mx-auto mb-1 text-orange-500" />
            <p className="text-lg font-bold">{totalCalories}</p>
            <p className="text-xs text-muted-foreground">calories</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/5">
            <Timer className="h-5 w-5 mx-auto mb-1 text-blue-500" />
            <p className="text-lg font-bold">{totalExerciseMinutes}</p>
            <p className="text-xs text-muted-foreground">minutes</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/5">
            <Footprints className="h-5 w-5 mx-auto mb-1 text-green-500" />
            <p className="text-lg font-bold">{totalSteps.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">steps</p>
          </div>
        </div>

        {showExerciseForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-4 p-4 rounded-xl bg-white/5 border border-white/10"
          >
            <div className="grid grid-cols-4 gap-2 mb-3">
              {EXERCISE_TYPES.map((type) => (
                <button
                  key={type.type}
                  onClick={() => setExerciseType(type.type)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                    exerciseType === type.type
                      ? "bg-primary/20 border border-primary"
                      : "bg-white/5 border border-white/10"
                  }`}
                >
                  <span className="text-lg">{type.icon}</span>
                  <span className="text-xs">{type.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 mb-3">
              <label className="text-sm text-muted-foreground">Duration:</label>
              <input
                type="number"
                value={exerciseDuration}
                onChange={(e) => setExerciseDuration(e.target.value)}
                className="flex-1 bg-white/10 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-primary"
                min="1"
              />
              <span className="text-sm text-muted-foreground">min</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddExercise}
                className="flex-1 py-2 text-sm font-medium text-white bg-primary rounded-lg"
              >
                Add Exercise
              </button>
              <button
                onClick={() => setShowExerciseForm(false)}
                className="px-4 py-2 text-sm text-muted-foreground hover:bg-white/10 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {todayExercises.length > 0 && (
          <div className="space-y-2">
            {todayExercises.map((exercise) => {
              const type = EXERCISE_TYPES.find((t) => t.type === exercise.type);
              return (
                <div
                  key={exercise.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5"
                >
                  <span className="text-xl">{type?.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{type?.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {exercise.duration} min · {exercise.calories} cal
                    </p>
                  </div>
                  <button
                    onClick={() => onRemoveExercise?.(exercise.id)}
                    className="p-1 rounded hover:bg-white/10"
                  >
                    <Minus className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
