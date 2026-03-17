import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Clock, Save, Volume2, ChevronLeft, ChevronRight, Check, Circle, Upload, Loader2 } from "lucide-react";

async function fetchWithAuth(url: string) {
  const token = localStorage.getItem("auth_token");
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Failed to load data");
  return res.json();
}

async function postWithAuth(url: string, body?: any) {
  const token = localStorage.getItem("auth_token");
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Action failed");
  }
  return res.json();
}

async function patchWithAuth(url: string, body: any) {
  const token = localStorage.getItem("auth_token");
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Action failed");
  }
  return res.json();
}

export default function AssessmentTaking() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [started, setStarted] = useState(false);

  const { data: assessment, isLoading, error } = useQuery({
    queryKey: ["assessment", id],
    queryFn: () => fetchWithAuth(`/api/assessments/${id}`),
    enabled: !!user && !!id,
  });

  // Start the assessment
  const startMutation = useMutation({
    mutationFn: () => postWithAuth(`/api/assessments/${id}/start`),
    onSuccess: (submission) => {
      setStarted(true);
      // Restore previous answers if any
      const responses = (submission.responses as any[]) || [];
      const restored: Record<string, string> = {};
      responses.forEach((r: any) => {
        if (r.textAnswer) restored[r.questionId] = r.textAnswer;
      });
      setAnswers(restored);
      // Set timer
      if (submission.remainingSeconds) {
        setTimeLeft(submission.remainingSeconds);
      } else if (assessment) {
        const multiplier = submission.appliedTimeMultiplier || 1;
        setTimeLeft(assessment.durationMinutes * multiplier * 60);
      }
    },
  });

  // Save answer to server
  const answerMutation = useMutation({
    mutationFn: ({ questionId, textAnswer }: { questionId: string; textAnswer: string }) =>
      patchWithAuth(`/api/assessments/${id}/answer`, {
        questionId,
        responseType: "text",
        textAnswer,
      }),
  });

  // Submit assessment
  const submitMutation = useMutation({
    mutationFn: () => postWithAuth(`/api/assessments/${id}/submit`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["assessment", id] });
      setShowSubmitDialog(false);
      toast({ title: "Assessment submitted", description: "Your answers have been recorded and graded." });
      navigate("/student/courses", { replace: true });
    },
    onError: (err: Error) => {
      toast({ title: "Submission failed", description: err.message, variant: "destructive" });
    },
  });

  // Save & exit
  const saveExitMutation = useMutation({
    mutationFn: () => postWithAuth(`/api/assessments/${id}/save-exit`, { remainingSeconds: timeLeft }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-dashboard"] });
      setShowSaveDialog(false);
      toast({ title: "Progress saved", description: "You can resume this assessment anytime before the deadline." });
      navigate("/student/courses", { replace: true });
    },
    onError: (err: Error) => {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    },
  });

  // Timer
  useEffect(() => {
    if (!started) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [started]);

  // Initialize timer on assessment load
  useEffect(() => {
    if (assessment && !started && assessment.submission?.status === "in_progress") {
      setStarted(true);
      const responses = (assessment.submission.responses as any[]) || [];
      const restored: Record<string, string> = {};
      responses.forEach((r: any) => {
        if (r.textAnswer) restored[r.questionId] = r.textAnswer;
      });
      setAnswers(restored);
      if (assessment.submission.remainingSeconds) {
        setTimeLeft(assessment.submission.remainingSeconds);
      } else {
        const multiplier = assessment.submission.appliedTimeMultiplier || 1;
        setTimeLeft(assessment.durationMinutes * multiplier * 60);
      }
    }
  }, [assessment, started]);

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 border-b bg-card px-4 py-3">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="text-sm">Loading assessment…</span>
        </div>
      </div>
    );
  }

  if (error || !assessment) {
    return <div className="p-8 text-center text-muted-foreground">{error ? (error as Error).message : "Assessment not found"}</div>;
  }

  const questions = (assessment.questions as any[]) || [];

  if (questions.length === 0 || !started) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 border-b bg-card px-4 py-3">
          <Link href="/student/courses">
            <Button variant="ghost" size="sm" className="gap-1"><ArrowLeft className="h-3.5 w-3.5" /> Back</Button>
          </Link>
          <h1 className="text-sm font-semibold">{assessment.title}</h1>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <Card className="max-w-md w-full">
            <CardContent className="p-6 text-center space-y-3">
              <h2 className="font-serif text-lg font-semibold">{assessment.title}</h2>
              <p className="text-sm text-muted-foreground">{assessment.questionCount} questions · {assessment.durationMinutes} minutes</p>
              {assessment.status === "graded" && assessment.score !== undefined && (
                <div className="text-2xl font-bold text-[#2E8B6E]">{assessment.score}/{assessment.maxScore}</div>
              )}
              <Badge variant="outline" className="no-default-active-elevate">{assessment.status}</Badge>
              {questions.length > 0 && assessment.status !== "completed" && assessment.status !== "graded" && (
                <Button
                  className="w-full mt-4"
                  disabled={startMutation.isPending}
                  onClick={() => startMutation.mutate()}
                  data-testid="button-start-assessment"
                >
                  {startMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Starting...</> : "Start Assessment"}
                </Button>
              )}
              {questions.length === 0 && (
                <p className="text-xs text-muted-foreground mt-2">Assessment questions will appear here when the exam starts.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const question = questions[currentQ];
  const answeredCount = Object.keys(answers).length;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
    // Save to server in background
    answerMutation.mutate({ questionId, textAnswer: answer });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-2 border-b bg-card px-4 py-2 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{assessment.title}</span>
          <Badge variant="outline" className="no-default-active-elevate text-xs">
            Q {currentQ + 1} of {questions.length}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <div
            role="timer"
            aria-live="polite"
            className={`flex items-center gap-1 text-sm font-mono ${timeLeft < 300 ? "text-destructive font-bold" : ""}`}
            data-testid="text-timer"
          >
            <Clock className="h-3.5 w-3.5" />
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowSaveDialog(true)}
            className="gap-1 text-xs"
            data-testid="button-save-exit"
          >
            <Save className="h-3.5 w-3.5" /> Save & Exit
          </Button>
        </div>
      </div>

      <main id="main-content" className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card data-testid={`card-question-${question.id}`}>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h2 className="font-serif text-lg font-semibold">Question {currentQ + 1}</h2>
                    <p className="text-sm mt-2 leading-relaxed">{question.text}</p>
                  </div>

                  {question.type === "multiple_choice" && question.options && (
                    <div role="radiogroup" aria-label={`Question ${currentQ + 1} options`} className="space-y-2">
                      {question.options.map((opt: any) => (
                        <button
                          key={opt.id}
                          role="radio"
                          aria-checked={answers[question.id] === opt.id}
                          onClick={() => handleAnswer(question.id, opt.id)}
                          className={`flex items-center gap-3 w-full rounded-md border p-3 text-left text-sm transition-colors ${answers[question.id] === opt.id
                            ? "border-primary bg-accent"
                            : "border-border"
                            }`}
                          data-testid={`option-${opt.id}`}
                        >
                          <div className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${answers[question.id] === opt.id ? "border-primary bg-primary" : "border-muted-foreground"
                            }`}>
                            {answers[question.id] === opt.id && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </div>
                          {opt.text}
                        </button>
                      ))}
                    </div>
                  )}

                  {(question.type === "short_answer" || question.type === "essay") && (
                    <div className="space-y-2">
                      <Label htmlFor={`answer-${question.id}`}>Your Answer</Label>
                      <Textarea
                        id={`answer-${question.id}`}
                        value={answers[question.id] || ""}
                        onChange={(e) => handleAnswer(question.id, e.target.value)}
                        placeholder={question.type === "essay" ? "Write your detailed answer here..." : "Type your answer..."}
                        className={question.type === "essay" ? "min-h-[200px]" : "min-h-[80px]"}
                        data-testid={`textarea-answer-${question.id}`}
                      />
                    </div>
                  )}

                  {question.type === "file_upload" && (
                    <div className="space-y-2">
                      <Label>Upload your file</Label>
                      <div className="flex items-center justify-center rounded-md border-2 border-dashed p-8">
                        <div className="text-center space-y-2">
                          <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                          <p className="text-sm text-muted-foreground">Drop file here or click to browse</p>
                          <Button variant="secondary" size="sm" data-testid="button-upload-file">Choose File</Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-xs"
                      aria-label="Listen to question"
                      data-testid="button-tts-question"
                    >
                      <Volume2 className="h-3.5 w-3.5" /> Listen
                    </Button>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <Button
                      variant="secondary"
                      onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
                      disabled={currentQ === 0}
                      data-testid="button-prev-question"
                    >
                      <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
                    </Button>
                    {currentQ < questions.length - 1 ? (
                      <Button
                        onClick={() => setCurrentQ(currentQ + 1)}
                        data-testid="button-next-question"
                      >
                        Save & Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setShowSubmitDialog(true)}
                        data-testid="button-submit-assessment"
                      >
                        Submit Assessment
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardContent className="p-4 space-y-3">
                  <h3 className="text-sm font-semibold">Question Navigator</h3>
                  <nav aria-label="Question navigator" className="grid grid-cols-5 gap-2">
                    {questions.map((q: any, i: number) => {
                      const isAnswered = !!answers[q.id];
                      const isCurrent = i === currentQ;
                      return (
                        <button
                          key={q.id}
                          onClick={() => setCurrentQ(i)}
                          aria-label={`Question ${i + 1}, ${isAnswered ? "answered" : "unanswered"}${isCurrent ? ", current" : ""}`}
                          className={`flex h-9 w-full items-center justify-center rounded-md text-xs font-medium border transition-colors ${isCurrent
                            ? "bg-primary text-primary-foreground border-primary"
                            : isAnswered
                              ? "bg-[#2E8B6E]/10 text-[#2E8B6E] border-[#2E8B6E]/30"
                              : "bg-card border-border"
                            }`}
                          data-testid={`button-nav-q${i + 1}`}
                        >
                          {isAnswered ? <Check className="h-3 w-3" /> : i + 1}
                        </button>
                      );
                    })}
                  </nav>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1"><Check className="h-3 w-3 text-[#2E8B6E]" /> Answered: {answeredCount}</p>
                    <p className="flex items-center gap-1"><Circle className="h-3 w-3" /> Unanswered: {questions.length - answeredCount}</p>
                  </div>
                </CardContent>
              </Card>

              <div className="rounded-md bg-[#9CD5FF]/20 p-3 text-xs text-center">
                <p className="font-medium">Extended time applied: 2.0x</p>
                <p className="text-muted-foreground">Original: {assessment.durationMinutes} min &rarr; Your time: {assessment.durationMinutes * 2} min</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Submit Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Submit Assessment?</DialogTitle>
            <DialogDescription>
              You have answered {answeredCount} of {questions.length} questions.
              {answeredCount < questions.length && " Some questions are unanswered."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowSubmitDialog(false)} data-testid="button-cancel-submit">Cancel</Button>
            <Button
              disabled={submitMutation.isPending}
              onClick={() => submitMutation.mutate()}
              data-testid="button-confirm-submit"
            >
              {submitMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Submitting...</> : "Submit"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save & Exit Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Save & Exit?</DialogTitle>
            <DialogDescription>
              Your progress is saved. Return anytime before the deadline to continue. Your timer will be paused.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowSaveDialog(false)} data-testid="button-cancel-save">Continue Assessment</Button>
            <Button
              disabled={saveExitMutation.isPending}
              onClick={() => saveExitMutation.mutate()}
              data-testid="button-confirm-save"
            >
              {saveExitMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Saving...</> : "Save & Exit"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
