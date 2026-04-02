import { useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSubmitSurvey } from "@workspace/api-client-react";
import type { SurveySubmission } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", 
  "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", 
  "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", 
  "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", 
  "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", 
  "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", 
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
];

const NFL_TEAMS = [
  "Arizona Cardinals", "Atlanta Falcons", "Baltimore Ravens", "Buffalo Bills", "Carolina Panthers", 
  "Chicago Bears", "Cincinnati Bengals", "Cleveland Browns", "Dallas Cowboys", "Denver Broncos", 
  "Detroit Lions", "Green Bay Packers", "Houston Texans", "Indianapolis Colts", "Jacksonville Jaguars", 
  "Kansas City Chiefs", "Las Vegas Raiders", "Los Angeles Chargers", "Los Angeles Rams", "Miami Dolphins", 
  "Minnesota Vikings", "New England Patriots", "New Orleans Saints", "New York Giants", "New York Jets", 
  "Philadelphia Eagles", "Pittsburgh Steelers", "San Francisco 49ers", "Seattle Seahawks", 
  "Tampa Bay Buccaneers", "Tennessee Titans", "Washington Commanders"
];

const COLLEGE_TEAMS = [
  "Iowa", "Iowa State", "Nebraska", "Illinois", "Ohio State", "Wisconsin", 
  "Minnesota", "K-State", "Kansas", "Mizzou", "Other"
];

const formSchema = z.object({
  state: z.string({ required_error: "Please select your state." }),
  gender: z.enum(["Male", "Female"], { required_error: "Please select your gender." }),
  nflTeam: z.string({ required_error: "Please select your favorite NFL team." }),
  collegeTeam: z.string({ required_error: "Please select your favorite college team." }),
  collegeTeamOther: z.string().optional(),
  footballPreference: z.enum(["College", "NFL", "Both equally"], { required_error: "Please select your preference." }),
  watchFrequency: z.enum(["Every game", "Most games", "Occasionally", "Rarely"], { required_error: "Please select how often you watch." }),
  attendsInPerson: z.boolean({ required_error: "Please select if you attend in person." }),
  favoritePosition: z.enum(["QB", "RB", "WR", "TE", "OL", "DL", "LB", "DB", "K/P"], { required_error: "Please select a favorite position." }),
}).superRefine((data, ctx) => {
  if (data.collegeTeam === "Other" && (!data.collegeTeamOther || data.collegeTeamOther.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please specify your college team.",
      path: ["collegeTeamOther"],
    });
  }
});

export function SurveyForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const submitSurvey = useSubmitSurvey();

  useEffect(() => {
    if (localStorage.getItem("survey_submitted") === "true") {
      setLocation("/results");
    }
  }, [setLocation]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      collegeTeamOther: "",
    },
  });

  const watchCollegeTeam = form.watch("collegeTeam");

  function onSubmit(values: z.infer<typeof formSchema>) {
    submitSurvey.mutate({ data: values as SurveySubmission }, {
      onSuccess: () => {
        localStorage.setItem("survey_submitted", "true");
        toast({
          title: "Survey submitted!",
          description: "Thank you for sharing your football preferences.",
        });
        setLocation("/results");
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Submission failed",
          description: "There was an error submitting your survey. Please try again.",
        });
        console.error(error);
      }
    });
  }

  return (
    <div className="container max-w-3xl py-10 px-4 md:px-6 mx-auto">
      <div className="mb-8 space-y-3 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-foreground">
          Make Your <span className="text-primary">Pick</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          We're collecting data from fans nationwide to see where allegiances lie. Fill out the survey below to add your voice to the live scoreboard.
        </p>
      </div>

      <Card className="border-border/50 shadow-xl bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6 md:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Q1: State */}
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">1. What state are you from?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 bg-background/50">
                            <SelectValue placeholder="Select a state" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-80">
                          {STATES.map((state) => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Q2: Gender */}
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-base font-semibold">2. Gender</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Male" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">Male</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Female" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">Female</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator className="bg-border/50" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Q3: Favorite NFL Team */}
                <FormField
                  control={form.control}
                  name="nflTeam"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">3. Favorite NFL team</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 bg-background/50">
                            <SelectValue placeholder="Select a team" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-80">
                          {NFL_TEAMS.map((team) => (
                            <SelectItem key={team} value={team}>{team}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Q4: Favorite College Team */}
                <FormField
                  control={form.control}
                  name="collegeTeam"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">4. Favorite college team</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 bg-background/50">
                            <SelectValue placeholder="Select a team" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-80">
                          {COLLEGE_TEAMS.map((team) => (
                            <SelectItem key={team} value={team}>{team}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchCollegeTeam === "Other" && (
                  <FormField
                    control={form.control}
                    name="collegeTeamOther"
                    render={({ field }) => (
                      <FormItem className="md:col-start-2 animate-in fade-in slide-in-from-top-4">
                        <FormLabel className="text-sm text-muted-foreground">Specify your college team</FormLabel>
                        <FormControl>
                          <Input placeholder="Team name..." className="h-12 bg-background/50" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <Separator className="bg-border/50" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Q5: Preference */}
                <FormField
                  control={form.control}
                  name="footballPreference"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-base font-semibold">5. College or NFL?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-2"
                        >
                          {["College", "NFL", "Both equally"].map((option) => (
                            <FormItem key={option} className="flex items-center space-x-3 space-y-0 p-2 rounded-md hover:bg-muted/50 transition-colors">
                              <FormControl>
                                <RadioGroupItem value={option} />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer flex-1">{option}</FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Q6: Watch Frequency */}
                <FormField
                  control={form.control}
                  name="watchFrequency"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-base font-semibold">6. How often do you watch?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-2"
                        >
                          {["Every game", "Most games", "Occasionally", "Rarely"].map((option) => (
                            <FormItem key={option} className="flex items-center space-x-3 space-y-0 p-2 rounded-md hover:bg-muted/50 transition-colors">
                              <FormControl>
                                <RadioGroupItem value={option} />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer flex-1">{option}</FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator className="bg-border/50" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Q7: Attends in Person */}
                <FormField
                  control={form.control}
                  name="attendsInPerson"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-base font-semibold">7. Do you attend games in person?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(val) => field.onChange(val === "true")}
                          defaultValue={field.value !== undefined ? String(field.value) : undefined}
                          className="flex space-x-6"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="true" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">Yes</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="false" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">No</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Q8: Favorite Position */}
                <FormField
                  control={form.control}
                  name="favoritePosition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">8. Favorite position to watch?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 bg-background/50">
                            <SelectValue placeholder="Select a position" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {["QB", "RB", "WR", "TE", "OL", "DL", "LB", "DB", "K/P"].map((pos) => (
                            <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 text-lg font-bold uppercase tracking-wider shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                disabled={submitSurvey.isPending}
              >
                {submitSurvey.isPending ? "Submitting..." : "Submit to Live Scoreboard"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
