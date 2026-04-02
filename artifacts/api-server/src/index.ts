import app from "./app";
import { logger } from "./lib/logger";
import { supabase } from "./lib/supabase";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function checkSurveyTable(): Promise<void> {
  const { error } = await supabase
    .from("survey_responses")
    .select("id")
    .limit(1);

  if (error) {
    logger.warn(
      { code: error.code, message: error.message },
      [
        "survey_responses table not found or inaccessible.",
        "Run the following SQL in your Supabase SQL editor to create it:",
        "",
        "CREATE TABLE IF NOT EXISTS public.survey_responses (",
        "  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),",
        "  state TEXT NOT NULL,",
        "  gender TEXT NOT NULL,",
        "  nfl_team TEXT NOT NULL,",
        "  college_team TEXT NOT NULL,",
        "  college_team_other TEXT,",
        "  football_preference TEXT NOT NULL,",
        "  watch_frequency TEXT NOT NULL,",
        "  attends_in_person BOOLEAN NOT NULL,",
        "  favorite_position TEXT NOT NULL,",
        "  created_at TIMESTAMPTZ DEFAULT NOW()",
        ");",
        "ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;",
        "CREATE POLICY \"Allow anonymous inserts\" ON public.survey_responses FOR INSERT WITH CHECK (true);",
        "CREATE POLICY \"Allow anonymous reads\" ON public.survey_responses FOR SELECT USING (true);",
      ].join("\n"),
    );
  } else {
    logger.info("survey_responses table verified");
  }
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  checkSurveyTable().catch((e) =>
    logger.error({ err: e }, "Failed to verify survey_responses table"),
  );
});
