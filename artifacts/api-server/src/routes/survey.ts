import { Router, type IRouter } from "express";
import { supabase } from "../lib/supabase";
import { SubmitSurveyBody } from "@workspace/api-zod";

const router: IRouter = Router();

type SurveyRow = {
  state: string;
  gender: string;
  nfl_team: string;
  college_team: string;
  college_team_other: string | null;
  football_preference: string;
  watch_frequency: string;
  attends_in_person: boolean;
  favorite_position: string;
};

function aggregate(rows: SurveyRow[], key: keyof SurveyRow): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const row of rows) {
    const val = row[key];
    if (val === null || val === undefined) continue;
    const strVal = String(val);
    counts[strVal] = (counts[strVal] ?? 0) + 1;
  }
  return counts;
}

router.post("/survey", async (req, res) => {
  const parsed = SubmitSurveyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data;

  if (data.collegeTeam === "Other" && !data.collegeTeamOther?.trim()) {
    res.status(400).json({ error: "collegeTeamOther is required when collegeTeam is Other" });
    return;
  }

  const { data: inserted, error } = await supabase
    .from("survey_responses")
    .insert({
      state: data.state,
      gender: data.gender,
      nfl_team: data.nflTeam,
      college_team: data.collegeTeam,
      college_team_other: data.collegeTeamOther ?? null,
      football_preference: data.footballPreference,
      watch_frequency: data.watchFrequency,
      attends_in_person: data.attendsInPerson,
      favorite_position: data.favoritePosition,
    })
    .select("id")
    .single();

  if (error) {
    req.log.error({ error }, "Failed to insert survey response");
    res.status(500).json({ error: "Failed to save survey response" });
    return;
  }

  res.status(201).json({ success: true, id: inserted.id });
});

router.get("/survey/results", async (req, res) => {
  const { data, error } = await supabase
    .from("survey_responses")
    .select(
      "state, gender, nfl_team, college_team, college_team_other, football_preference, watch_frequency, attends_in_person, favorite_position"
    );

  if (error) {
    req.log.error({ error }, "Failed to fetch survey results");
    res.status(500).json({ error: "Failed to fetch survey results" });
    return;
  }

  const rows: SurveyRow[] = data ?? [];
  const totalResponses = rows.length;

  const byState = aggregate(rows, "state");
  const byGender = aggregate(rows, "gender");
  const byNflTeam = aggregate(rows, "nfl_team");

  const byCollegeTeam: Record<string, number> = {};
  for (const row of rows) {
    const team =
      row.college_team === "Other" && row.college_team_other
        ? `Other: ${row.college_team_other}`
        : row.college_team;
    if (!team) continue;
    byCollegeTeam[team] = (byCollegeTeam[team] ?? 0) + 1;
  }

  const byFootballPreference = aggregate(rows, "football_preference");
  const byWatchFrequency = aggregate(rows, "watch_frequency");

  const byAttendsInPerson: Record<string, number> = {};
  for (const row of rows) {
    const val = row.attends_in_person ? "Yes" : "No";
    byAttendsInPerson[val] = (byAttendsInPerson[val] ?? 0) + 1;
  }

  const byFavoritePosition = aggregate(rows, "favorite_position");

  res.json({
    totalResponses,
    byState,
    byGender,
    byNflTeam,
    byCollegeTeam,
    byFootballPreference,
    byWatchFrequency,
    byAttendsInPerson,
    byFavoritePosition,
  });
});

export default router;
