import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DAYS = 7;
const SERVICE_KEY = "custom_meal_plan";

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase server environment variables are not configured."
    );
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function fail(message, status = 400, extra = {}) {
  return Response.json(
    {
      ok: false,
      error: message,
      ...extra,
    },
    { status }
  );
}

const arr = (value) =>
  Array.isArray(value) ? value.filter(Boolean) : [];

const clean = (value) => String(value ?? "").trim();

const norm = (value) =>
  clean(value)
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const clamp = (value, min, max) =>
  Math.min(max, Math.max(min, value));

const uniq = (values) => [...new Set(values.filter(Boolean))];

const round = (value, digits = 0) =>
  Math.round(Number(value || 0) * 10 ** digits) /
  10 ** digits;

const iso = (date) => date.toISOString().slice(0, 10);

function tokenFrom(request) {
  const header =
    request.headers.get("authorization") || "";

  return header.toLowerCase().startsWith("bearer ")
    ? header.slice(7).trim()
    : null;
}

function normalizeAllergens(values) {
  const output = new Set();

  for (const raw of arr(values)) {
    const value = norm(raw);

    if (
      value.includes("peanut") ||
      value.includes("groundnut")
    ) {
      output.add("peanut");
    }

    if (
      value.includes("tree nut") ||
      value === "nuts" ||
      /almond|cashew|walnut|pecan|pistachio|hazelnut/.test(
        value
      )
    ) {
      output.add("tree_nut");
    }

    if (
      /shellfish|shrimp|prawn|crab|lobster/.test(value)
    ) {
      output.add("shellfish");
    }

    if (
      value === "fish" ||
      value.includes("fish allergy")
    ) {
      output.add("fish");
    }

    if (value.includes("egg")) {
      output.add("egg");
    }

    if (/soy|soya/.test(value)) {
      output.add("soy");
    }

    if (/wheat|gluten/.test(value)) {
      output.add("wheat");
    }

    if (/milk|dairy/.test(value)) {
      output.add("milk");
    }
  }

  return [...output];
}

function hasText(name, terms) {
  const haystack = norm(name);

  return terms.some((term) => {
    const needle = norm(term);

    return needle && haystack.includes(needle);
  });
}

function cookingOK(level, preference) {
  const selected = clean(preference).toLowerCase();

  if (
    !selected ||
    selected === "no_preference" ||
    selected === "meal_prep"
  ) {
    return true;
  }

  const rank = {
    none: 0,
    minimal: 1,
    moderate: 2,
    meal_prep: 3,
  };

  if (!(level in rank)) {
    return true;
  }

  if (selected === "minimal") {
    return rank[level] <= 1;
  }

  return rank[level] <= 2;
}

function dietOK(template, foods, preferences) {
  const prefs = arr(preferences)
    .map((value) => clean(value).toLowerCase())
    .filter(
      (value) =>
        value &&
        value !== "none"
    );

  const tags = new Set(
    arr(template.dietary_tags)
  );

  for (const preference of prefs) {
    if (preference === "low_sodium") {
      // Sodium is not stored in the food library yet.
      // The plan will be flagged for coach review.
      continue;
    }

    if (preference === "gluten_free") {
      const containsWheat = foods.some((food) =>
        arr(food.allergens).includes("wheat")
      );

      if (containsWheat) {
        return false;
      }

      continue;
    }

    if (preference === "dairy_free") {
      const containsMilk = foods.some((food) =>
        arr(food.allergens).includes("milk")
      );

      if (containsMilk) {
        return false;
      }

      continue;
    }

    if (
      [
        "vegetarian",
        "vegan",
        "pescatarian",
      ].includes(preference) &&
      !tags.has(preference)
    ) {
      return false;
    }
  }

  return true;
}

function safeTemplate(
  template,
  assessment,
  allergies
) {
  const foods = template.foods.map(
    (item) => item.food
  );

  if (
    !template.is_active ||
    !foods.length ||
    !cookingOK(
      template.cooking_level,
      assessment.cooking_preference
    )
  ) {
    return false;
  }

  if (
    !dietOK(
      template,
      foods,
      assessment.dietary_preferences
    )
  ) {
    return false;
  }

  for (const food of foods) {
    if (!food.is_active) {
      return false;
    }

    if (
      arr(food.allergens).some((allergen) =>
        allergies.includes(allergen)
      )
    ) {
      return false;
    }

    if (
      hasText(
        food.name,
        arr(assessment.disliked_foods)
      ) ||
      hasText(
        food.name,
        arr(assessment.foods_to_avoid)
      )
    ) {
      return false;
    }
  }

  return true;
}

function activity(level) {
  return (
    {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
    }[clean(level).toLowerCase()] || 1.2
  );
}

function targets(assessment) {
  const age = Number(assessment.age);
  const inches = Number(
    assessment.height_inches
  );
  const pounds = Number(
    assessment.weight_lbs
  );

  if (
    ![age, inches, pounds].every(
      Number.isFinite
    )
  ) {
    throw new Error(
      "Onboarding is missing age, height, or weight."
    );
  }

  const kg = pounds * 0.45359237;
  const cm = inches * 2.54;

  const sex = clean(
    assessment.biological_sex
  ).toLowerCase();

  const constant =
    sex === "male"
      ? 5
      : sex === "female"
      ? -161
      : -78;

  const bmr =
    10 * kg +
    6.25 * cm -
    5 * age +
    constant;

  const maintenance =
    bmr *
    activity(assessment.activity_level);

  const goal = clean(
    assessment.nutrition_goal ||
      assessment.goal
  ).toLowerCase();

  const adjustment =
    goal === "fat_loss"
      ? -400
      : goal === "muscle_gain"
      ? 250
      : goal === "performance"
      ? 150
      : 0;

  const calories =
    Math.round(
      clamp(
        maintenance + adjustment,
        1200,
        5000
      ) / 10
    ) * 10;

  const protein = Math.round(
    clamp(
      pounds *
        ([
          "fat_loss",
          "muscle_gain",
          "performance",
        ].includes(goal)
          ? 0.9
          : 0.8),
      70,
      300
    )
  );

  const fat = Math.round(
    clamp(
      (calories * 0.27) / 9,
      40,
      150
    )
  );

  const carbs = Math.max(
    50,
    Math.round(
      (calories -
        protein * 4 -
        fat * 9) /
        4
    )
  );

  return {
    calories,
    protein,
    carbs,
    fat,
    maintenance:
      Math.round(maintenance),

    sexReview:
      !["male", "female"].includes(sex),
  };
}

function pattern(numberOfMeals) {
  if (numberOfMeals <= 1) {
    return ["dinner"];
  }

  if (numberOfMeals === 2) {
    return [
      "breakfast",
      "dinner",
    ];
  }

  if (numberOfMeals === 3) {
    return [
      "breakfast",
      "lunch",
      "dinner",
    ];
  }

  if (numberOfMeals === 4) {
    return [
      "breakfast",
      "lunch",
      "dinner",
      "snack",
    ];
  }

  if (numberOfMeals === 5) {
    return [
      "breakfast",
      "snack",
      "lunch",
      "dinner",
      "snack",
    ];
  }

  const result = [
    "breakfast",
    "snack",
    "lunch",
    "snack",
    "dinner",
    "snack",
  ];

  while (
    result.length <
    numberOfMeals
  ) {
    result.push("snack");
  }

  return result.slice(
    0,
    numberOfMeals
  );
}

function splitTargets(
  nutritionTargets,
  mealPattern
) {
  const weights =
    mealPattern.map((type) => {
      if (type === "breakfast") {
        return 0.25;
      }

      if (
        type === "lunch" ||
        type === "dinner"
      ) {
        return 0.3;
      }

      return 0.15;
    });

  const total =
    weights.reduce(
      (sum, value) =>
        sum + value,
      0
    );

  return weights.map(
    (weight) => ({
      calories: Math.round(
        nutritionTargets.calories *
          weight /
          total
      ),

      protein: Math.round(
        nutritionTargets.protein *
          weight /
          total
      ),

      carbs: Math.round(
        nutritionTargets.carbs *
          weight /
          total
      ),

      fat: Math.round(
        nutritionTargets.fat *
          weight /
          total
      ),
    })
  );
}

function templateMacros(template) {
  return template.foods.reduce(
    (totals, item) => {
      const multiplier =
        Number(
          item.serving_multiplier || 1
        );

      const food = item.food;

      totals.calories +=
        Number(
          food.calories || 0
        ) * multiplier;

      totals.protein +=
        Number(
          food.protein_grams || 0
        ) * multiplier;

      totals.carbs +=
        Number(
          food.carb_grams || 0
        ) * multiplier;

      totals.fat +=
        Number(
          food.fat_grams || 0
        ) * multiplier;

      return totals;
    },
    {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    }
  );
}

function pick(
  candidates,
  target,
  preferred,
  recent
) {
  return [...candidates].sort(
    (a, b) => {
      const score = (template) => {
        const macros =
          templateMacros(template);

        const difference =
          Math.abs(
            macros.calories -
              target.calories
          ) /
            Math.max(
              1,
              target.calories
            ) +
          0.7 *
            Math.abs(
              macros.protein -
                target.protein
            ) /
            Math.max(
              1,
              target.protein
            );

        const preferenceBonus =
          template.foods.filter(
            (item) =>
              hasText(
                item.food.name,
                preferred
              )
          ).length * 0.18;

        return (
          difference +
          (recent.includes(
            template.id
          )
            ? 0.35
            : 0) -
          preferenceBonus
        );
      };

      return score(a) - score(b);
    }
  )[0];
}

function scaleMeal(
  template,
  target
) {
  const base =
    templateMacros(template);

  const scale = clamp(
    base.calories
      ? target.calories /
          base.calories
      : 1,
    0.65,
    1.75
  );

  return template.foods.map(
    (item, index) => {
      const food = item.food;

      const multiplier =
        Number(
          item.serving_multiplier || 1
        ) * scale;

      return {
        food_order: index + 1,

        food_name:
          food.name,

        serving_amount: round(
          Number(
            food.serving_amount || 1
          ) * multiplier,
          2
        ),

        serving_unit:
          food.serving_unit,

        calories:
          Math.round(
            Number(
              food.calories || 0
            ) * multiplier
          ),

        protein_grams:
          round(
            Number(
              food.protein_grams || 0
            ) * multiplier,
            1
          ),

        carb_grams:
          round(
            Number(
              food.carb_grams || 0
            ) * multiplier,
            1
          ),

        fat_grams:
          round(
            Number(
              food.fat_grams || 0
            ) * multiplier,
            1
          ),

        preparation:
          food.preparation ||
          null,

        notes:
          multiplier < 0.8 ||
          multiplier > 1.25
            ? "Portion adjusted by generator; coach should verify practicality."
            : null,

        is_optional:
          Boolean(
            item.is_optional
          ),
      };
    }
  );
}

function buildMeals(
  templates,
  nutritionTargets,
  mealsPerDay,
  preferredFoods
) {
  const mealPattern =
    pattern(mealsPerDay);

  const targetSplits =
    splitTargets(
      nutritionTargets,
      mealPattern
    );

  const result = [];
  const recent = {};

  for (
    let day = 1;
    day <= DAYS;
    day += 1
  ) {
    mealPattern.forEach(
      (type, index) => {
        const candidates =
          templates.filter(
            (template) =>
              template.meal_type ===
              type
          );

        if (
          !candidates.length
        ) {
          throw new Error(
            `No safe ${type} templates are available for this client's restrictions.`
          );
        }

        const chosen = pick(
          candidates,
          targetSplits[index],
          preferredFoods,
          recent[type] || []
        );

        recent[type] = [
          chosen.id,
          ...(recent[type] || []).filter(
            (id) =>
              id !== chosen.id
          ),
        ].slice(
          0,
          Math.max(
            1,
            candidates.length - 1
          )
        );

        const foods =
          scaleMeal(
            chosen,
            targetSplits[index]
          );

        result.push({
          day_number: day,

          meal_order:
            index + 1,

          meal_name:
            chosen.name,

          meal_type:
            type,

          instructions:
            chosen.preparation_instructions ||
            null,

          notes:
            "Generated from an approved template. Nutrition values are planning estimates.",

          target_calories:
            targetSplits[index]
              .calories,

          target_protein_grams:
            targetSplits[index]
              .protein,

          target_carb_grams:
            targetSplits[index]
              .carbs,

          target_fat_grams:
            targetSplits[index]
              .fat,

          foods,
        });
      }
    );
  }

  return result;
}

async function profile(
  database,
  id
) {
  const {
    data,
    error,
  } =
    await database
      .from("profiles")
      .select(
        "id, role, membership_status"
      )
      .eq("id", id)
      .single();

  if (
    error ||
    !data
  ) {
    throw new Error(
      "Unable to load user profile."
    );
  }

  return data;
}

async function entitled(
  database,
  userId
) {
  const {
    data: service,
    error: serviceError,
  } =
    await database
      .from(
        "coaching_services"
      )
      .select("id")
      .eq(
        "service_key",
        SERVICE_KEY
      )
      .eq(
        "is_active",
        true
      )
      .maybeSingle();

  if (serviceError) {
    throw serviceError;
  }

  if (!service) {
    return {
      enabled: false,
      reason:
        "Custom meal plan service is not configured.",
    };
  }

  const {
    data: override,
    error: overrideError,
  } =
    await database
      .from(
        "client_service_entitlements"
      )
      .select(
        "enabled, source"
      )
      .eq(
        "user_id",
        userId
      )
      .eq(
        "service_id",
        service.id
      )
      .maybeSingle();

  if (overrideError) {
    throw overrideError;
  }

  if (override) {
    return {
      enabled:
        Boolean(
          override.enabled
        ),

      source:
        override.source ||
        "client_override",
    };
  }

  const {
    data: clientPackage,
    error: packageError,
  } =
    await database
      .from(
        "client_packages"
      )
      .select(
        "id, package_id"
      )
      .eq(
        "user_id",
        userId
      )
      .eq(
        "status",
        "active"
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      )
      .limit(1)
      .maybeSingle();

  if (packageError) {
    throw packageError;
  }

  if (!clientPackage) {
    return {
      enabled: false,
      reason:
        "No active coaching package was found.",
    };
  }

  const {
    data: packageService,
    error:
      packageServiceError,
  } =
    await database
      .from(
        "package_services"
      )
      .select("id")
      .eq(
        "package_id",
        clientPackage.package_id
      )
      .eq(
        "service_id",
        service.id
      )
      .maybeSingle();

  if (
    packageServiceError
  ) {
    throw packageServiceError;
  }

  return {
    enabled:
      Boolean(
        packageService
      ),

    source:
      packageService
        ? "package"
        : null,
  };
}

async function assessment(
  database,
  userId
) {
  const columns = [
    "id",
    "user_id",
    "goal",
    "age",
    "height_inches",
    "weight_lbs",
    "activity_level",
    "medical_considerations",
    "dietary_preferences",
    "food_allergies",
    "nutrition_goal",
    "biological_sex",
    "meals_per_day",
    "disliked_foods",
    "preferred_foods",
    "foods_to_avoid",
    "cooking_preference",
    "nutrition_notes",
    "completed",
    "updated_at",
  ].join(",");

  const {
    data,
    error,
  } =
    await database
      .from(
        "onboarding_assessments"
      )
      .select(columns)
      .eq(
        "user_id",
        userId
      )
      .eq(
        "completed",
        true
      )
      .order(
        "updated_at",
        {
          ascending: false,
        }
      )
      .limit(1)
      .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

async function library(
  database
) {
  const {
    data: templates,
    error: templateError,
  } =
    await database
      .from(
        "meal_templates"
      )
      .select(
        "id,name,meal_type,dietary_tags,cooking_level,preparation_instructions,is_active"
      )
      .eq(
        "is_active",
        true
      )
      .order("id");

  if (templateError) {
    throw templateError;
  }

  const {
    data: links,
    error: linkError,
  } =
    await database
      .from(
        "meal_template_foods"
      )
      .select(
        "meal_template_id,food_id,food_order,serving_multiplier,is_optional"
      )
      .order(
        "food_order"
      );

  if (linkError) {
    throw linkError;
  }

  const ids = uniq(
    links.map(
      (item) =>
        item.food_id
    )
  );

  if (!ids.length) {
    throw new Error(
      "Meal template library contains no foods."
    );
  }

  const {
    data: foods,
    error: foodError,
  } =
    await database
      .from(
        "food_library"
      )
      .select(
        "id,name,serving_amount,serving_unit,calories,protein_grams,carb_grams,fat_grams,preparation,allergens,is_active"
      )
      .in(
        "id",
        ids
      )
      .eq(
        "is_active",
        true
      );

  if (foodError) {
    throw foodError;
  }

  const foodMap =
    new Map(
      foods.map(
        (food) => [
          food.id,
          food,
        ]
      )
    );

  const linkMap =
    new Map();

  links.forEach(
    (link) => {
      const food =
        foodMap.get(
          link.food_id
        );

      if (!food) {
        return;
      }

      if (
        !linkMap.has(
          link.meal_template_id
        )
      ) {
        linkMap.set(
          link.meal_template_id,
          []
        );
      }

      linkMap
        .get(
          link.meal_template_id
        )
        .push({
          ...link,
          food,
        });
    }
  );

  return templates.map(
    (template) => ({
      ...template,

      foods:
        (
          linkMap.get(
            template.id
          ) || []
        ).sort(
          (a, b) =>
            a.food_order -
            b.food_order
        ),
    })
  );
}

async function nutritionPlan(
  database,
  userId,
  assessmentData,
  nutritionTargets
) {
  const {
    data: existing,
    error: existingError,
  } =
    await database
      .from(
        "nutrition_plans"
      )
      .select("id")
      .eq(
        "user_id",
        userId
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      )
      .limit(1)
      .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  const payload = {
    calorie_target:
      nutritionTargets.calories,

    protein_grams:
      nutritionTargets.protein,

    carb_grams:
      nutritionTargets.carbs,

    fat_grams:
      nutritionTargets.fat,

    water_ounces:
      Math.round(
        clamp(
          Number(
            assessmentData.weight_lbs
          ) * 0.5,
          64,
          160
        )
      ),

    nutrition_goal:
      assessmentData.nutrition_goal ||
      assessmentData.goal ||
      null,

    target_source:
      "calculated",

    coach_approved:
      false,

    coach_approved_at:
      null,

    target_weight_lbs:
      Number(
        assessmentData.weight_lbs
      ),

    meals_per_day:
      Number(
        assessmentData.meals_per_day ||
          4
      ),

    dietary_preferences:
      arr(
        assessmentData.dietary_preferences
      ),

    food_allergies:
      arr(
        assessmentData.food_allergies
      ),

    nutrition_notes:
      assessmentData.nutrition_notes ||
      null,
  };

  if (existing?.id) {
    const {
      error,
    } =
      await database
        .from(
          "nutrition_plans"
        )
        .update(
          payload
        )
        .eq(
          "id",
          existing.id
        )
        .eq(
          "user_id",
          userId
        );

    if (error) {
      throw error;
    }

    return existing.id;
  }

  const {
    data,
    error,
  } =
    await database
      .from(
        "nutrition_plans"
      )
      .insert({
        user_id:
          userId,

        ...payload,
      })
      .select("id")
      .single();

  if (error) {
    throw error;
  }

  return data.id;
}

export async function POST(
  request
) {
  try {
    const database =
      adminClient();

    const token =
      tokenFrom(request);

    if (!token) {
      return fail(
        "You must be logged in.",
        401
      );
    }

    const {
      data: {
        user,
      },
      error:
        authError,
    } =
      await database.auth.getUser(
        token
      );

    if (
      authError ||
      !user
    ) {
      return fail(
        "Your login session is invalid or expired.",
        401
      );
    }

    const requester =
      await profile(
        database,
        user.id
      );

    let body = {};

    try {
      body =
        await request.json();
    } catch {
      body = {};
    }

    const requestedId =
      clean(
        body?.client_id
      );

    const isCoach =
      requester.role ===
      "coach";

    if (
      !isCoach &&
      requestedId &&
      requestedId !==
        user.id
    ) {
      return fail(
        "You cannot generate a meal plan for another client.",
        403
      );
    }

    const clientId =
      isCoach &&
      requestedId
        ? requestedId
        : user.id;

    const client =
      await profile(
        database,
        clientId
      );

    if (
      !isCoach &&
      client.membership_status !==
        "active"
    ) {
      return fail(
        "An active membership is required.",
        403
      );
    }

    const access =
      await entitled(
        database,
        clientId
      );

    if (
      !access.enabled
    ) {
      return fail(
        access.reason ||
          "Custom meal planning is not included for this client.",
        403
      );
    }

    const assessmentData =
      await assessment(
        database,
        clientId
      );

    if (
      !assessmentData
    ) {
      return fail(
        "Complete onboarding before generating a meal plan.",
        409
      );
    }

    const allergyList =
      normalizeAllergens(
        assessmentData.food_allergies
      );

    const nutritionTargets =
      targets(
        assessmentData
      );

    const mealsPerDay =
      clamp(
        Number(
          assessmentData.meals_per_day ||
            4
        ),
        1,
        8
      );

    const allTemplates =
      await library(
        database
      );

    const safeTemplates =
      allTemplates.filter(
        (template) =>
          safeTemplate(
            template,
            assessmentData,
            allergyList
          )
      );

    const missingTypes =
      uniq(
        pattern(
          mealsPerDay
        )
      ).filter(
        (type) =>
          !safeTemplates.some(
            (template) =>
              template.meal_type ===
              type
          )
      );

    if (
      missingTypes.length
    ) {
      return fail(
        "The approved food library does not contain enough safe meal templates for this client's restrictions.",
        409,
        {
          missing_meal_types:
            missingTypes,

          requires_coach_review:
            true,
        }
      );
    }

    const meals =
      buildMeals(
        safeTemplates,
        nutritionTargets,
        mealsPerDay,
        arr(
          assessmentData.preferred_foods
        )
      );

    const nutritionPlanId =
      await nutritionPlan(
        database,
        clientId,
        assessmentData,
        nutritionTargets
      );

    const notes = [
      `Generated from onboarding assessment #${assessmentData.id}.`,

      `Estimated targets: ${nutritionTargets.calories} kcal, ${nutritionTargets.protein}g protein, ${nutritionTargets.carbs}g carbs, ${nutritionTargets.fat}g fat.`,

      "Food values are planning estimates and may vary by brand, preparation, and portion measurement.",

      "Coach review and approval are required before publication.",

      nutritionTargets.sexReview
        ? "Biological sex was not provided; midpoint calorie estimation was used and requires coach review."
        : "",

      arr(
        assessmentData.dietary_preferences
      ).includes(
        "low_sodium"
      )
        ? "Lower sodium was requested; sodium is not stored in the current food library, so coach verification is required."
        : "",

      clean(
        assessmentData.medical_considerations
      )
        ? "Medical considerations were reported. No medical diagnosis or therapeutic diet was generated; coach review is required."
        : "",

      allergyList.length
        ? `Structured allergen exclusions applied: ${allergyList.join(
            ", "
          )}.`
        : "",
    ]
      .filter(Boolean)
      .join(" ");

    const start =
      new Date();

    const end =
      new Date(start);

    end.setUTCDate(
      end.getUTCDate() + 6
    );

    const {
      data:
        mealPlanId,

      error:
        saveError,
    } =
      await database.rpc(
        "save_generated_meal_plan",
        {
          p_user_id:
            clientId,

          p_nutrition_plan_id:
            nutritionPlanId,

          p_assessment_id:
            assessmentData.id,

          p_name:
            "Personalized 7-Day Nutrition Plan",

          p_description:
            "Personalized draft built from onboarding, package entitlement, approved meal templates, dietary preferences, and estimated nutrition targets.",

          p_calorie_target:
            nutritionTargets.calories,

          p_protein_grams:
            nutritionTargets.protein,

          p_carb_grams:
            nutritionTargets.carbs,

          p_fat_grams:
            nutritionTargets.fat,

          p_days_per_week:
            DAYS,

          p_start_date:
            iso(start),

          p_end_date:
            iso(end),

          p_coach_notes:
            "Review targets, allergies, restrictions, portions, food selections, and client context before approval.",

          p_generation_notes:
            notes,

          p_meals:
            meals,
        }
      );

    if (saveError) {
      if (
        (
          saveError.message ||
          ""
        ).includes(
          "active approved meal plan"
        )
      ) {
        return fail(
          saveError.message,
          409
        );
      }

      throw saveError;
    }

    return Response.json({
      ok: true,

      meal_plan_id:
        mealPlanId,

      client_id:
        clientId,

      status:
        "pending_review",

      entitlement_source:
        access.source ||
        null,

      days:
        DAYS,

      meals_per_day:
        mealsPerDay,

      total_meals:
        meals.length,

      targets: {
        calories:
          nutritionTargets.calories,

        protein_grams:
          nutritionTargets.protein,

        carb_grams:
          nutritionTargets.carbs,

        fat_grams:
          nutritionTargets.fat,
      },

      requires_coach_review:
        true,

      message:
        "Personalized meal-plan draft generated successfully. Coach approval is required before publication.",
    });
  } catch (error) {
    console.error(
      "Meal plan generation error:",
      error
    );

    return fail(
      error?.message ||
        "Unable to generate meal plan.",
      500
    );
  }
}
