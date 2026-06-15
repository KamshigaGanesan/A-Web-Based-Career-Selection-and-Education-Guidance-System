import { AlternativePath } from "../models/AlternativePath.js";

/**
 * Calculates the overlap score between two tag arrays.
 * Returns "strong" (3+ matches), "medium" (1-2 matches), or "none".
 */
function overlapScore(tagsA = [], tagsB = []) {
  const setB = new Set(tagsB.map((t) => t.toLowerCase()));
  const matches = tagsA.filter((t) => setB.has(t.toLowerCase()));
  if (matches.length >= 3) return { level: "strong", matched: matches };
  if (matches.length >= 1) return { level: "medium", matched: matches };
  return { level: "none", matched: [] };
}

function budgetScore(feesLKR, budgetLKR) {
  if (!budgetLKR || budgetLKR <= 0) return { score: 0, withinBudget: true };
  if (feesLKR <= budgetLKR) return { score: 10, withinBudget: true };
  return { score: -10, withinBudget: false };
}

function durationScore(durationMonths, preferredDurationMonths) {
  if (!preferredDurationMonths || preferredDurationMonths <= 0) return 0;
  const diff = Math.abs(durationMonths - preferredDurationMonths);
  return diff <= 6 ? 5 : 0;
}

function buildReasons({ path, streamMatch, districtMatch, careerOverlap, budget, durationFit, eligibilityBoost }) {
  const reasons = [];

  if (eligibilityBoost) {
    reasons.push(
      `Recommended as a ${path.type} alternative since government university placement may not be available`
    );
  }

  if (streamMatch) {
    reasons.push(`Matches your ${streamMatch} stream`);
  }

  if (districtMatch) {
    reasons.push(`Available in your district (${districtMatch})`);
  }

  if (careerOverlap.level === "strong") {
    reasons.push(`Strong career match: ${careerOverlap.matched.join(", ")}`);
  } else if (careerOverlap.level === "medium") {
    reasons.push(`Relevant career tags: ${careerOverlap.matched.join(", ")}`);
  }

  if (budget.withinBudget && budget.score > 0) {
    reasons.push(`Within your budget of LKR ${path.feesLKR.toLocaleString()}`);
  } else if (!budget.withinBudget) {
    reasons.push(`Exceeds your budget (LKR ${path.feesLKR.toLocaleString()})`);
  }

  if (durationFit > 0) {
    reasons.push(`Duration (${path.durationMonths} months) is close to your preferred timeline`);
  }

  if (path.ratingAvg >= 4) {
    reasons.push(`Highly rated (${path.ratingAvg}/5 from ${path.ratingCount} reviews)`);
  }

  return reasons;
}

export async function recommendAlternatives(req, res, next) {
  try {
    const {
      stream,
      district,
      zScore,
      eligiblePrograms = [],
      quizCareerTags = [],
      budgetLKR,
      preferredDurationMonths,
      govEligibility,
    } = req.body;

    if (!stream) {
      return res.status(400).json({ message: "stream is required" });
    }

    const allPaths = await AlternativePath.find().lean();

    const scored = allPaths.map((path) => {
      let score = 50;
      const reasons_data = {};

      // Eligibility boost: if no government options, boost private/diploma/foundation
      const noGovOptions =
        govEligibility === false || !eligiblePrograms || eligiblePrograms.length === 0;
      if (noGovOptions && ["private", "diploma", "foundation"].includes(path.type)) {
        score += 15;
        reasons_data.eligibilityBoost = true;
      }

      // Stream match
      const streamLower = stream.toLowerCase();
      const hasStreamMatch = path.streamTags.some((t) => t.toLowerCase() === streamLower);
      if (hasStreamMatch) {
        score += 15;
        reasons_data.streamMatch = stream;
      }

      // District match
      let districtMatched = false;
      if (district && path.districtAvailability?.length > 0) {
        districtMatched = path.districtAvailability.some(
          (d) => d.toLowerCase() === district.toLowerCase()
        );
        if (districtMatched) {
          score += 5;
          reasons_data.districtMatch = district;
        }
      }

      // Career tags overlap
      const careerOverlap = overlapScore(quizCareerTags, path.careerTags);
      if (careerOverlap.level === "strong") score += 20;
      else if (careerOverlap.level === "medium") score += 10;
      reasons_data.careerOverlap = careerOverlap;

      // Budget fit
      const budget = budgetScore(path.feesLKR, budgetLKR);
      score += budget.score;
      reasons_data.budget = budget;

      // Duration closeness
      const durScore = durationScore(path.durationMonths, preferredDurationMonths);
      score += durScore;
      reasons_data.durationFit = durScore;

      const finalScore = Math.max(0, Math.min(100, score));

      const reasons = buildReasons({
        path,
        streamMatch: reasons_data.streamMatch,
        districtMatch: reasons_data.districtMatch,
        careerOverlap: reasons_data.careerOverlap,
        budget: reasons_data.budget,
        durationFit: reasons_data.durationFit,
        eligibilityBoost: reasons_data.eligibilityBoost,
      });

      return { path, finalScore, reasons };
    });

    scored.sort((a, b) => b.finalScore - a.finalScore);

    const topResults = scored.slice(0, 10);

    res.json({
      count: topResults.length,
      recommendations: topResults,
    });
  } catch (err) {
    next(err);
  }
}
