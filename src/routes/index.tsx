import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Check, ClipboardCopy, Loader2, Mail, Sparkles } from "lucide-react";

import { generateHrComm, type HrCommResult } from "@/lib/hr-comm.functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HR Communications Studio" },
      {
        name: "description",
        content:
          "Generate clear, empathetic HR communications from a short brief.",
      },
      { property: "og:title", content: "HR Communications Studio" },
      {
        property: "og:description",
        content:
          "Generate clear, empathetic HR communications from a short brief.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const generate = useServerFn(generateHrComm);

  const [intent, setIntent] = useState("");
  const [recipientRole, setRecipientRole] = useState("");
  const [keyDates, setKeyDates] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HrCommResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setResult(null);
    try {
      const out = await generate({ data: { intent, recipientRole, keyDates } });
      setResult(out);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong generating the message.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          {/* Form */}
          <section>
            <Card className="border-border/60 shadow-sm">
              <CardContent className="space-y-6 p-6 sm:p-8">
                <div>
                  <h2 className="font-heading text-lg font-semibold text-foreground">
                    Message brief
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Tell us what you need to say. We'll draft an empathetic, ready-to-send HR message.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="intent">
                      What's the message about?
                    </Label>
                    <Textarea
                      id="intent"
                      value={intent}
                      onChange={(e) => setIntent(e.target.value)}
                      placeholder="e.g. Announce a company-wide remote-work policy update"
                      className="min-h-24 resize-y"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recipientRole">Who is it for?</Label>
                    <Input
                      id="recipientRole"
                      value={recipientRole}
                      onChange={(e) => setRecipientRole(e.target.value)}
                      placeholder="e.g. All employees, Engineering team, New hires"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="keyDates">Key dates & details</Label>
                    <Textarea
                      id="keyDates"
                      value={keyDates}
                      onChange={(e) => setKeyDates(e.target.value)}
                      placeholder="e.g. Policy takes effect Monday, Sept 1. Town hall on Aug 28 at 2pm."
                      className="min-h-20 resize-y"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Drafting your message…
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-4" />
                        Generate message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </section>

          {/* Output */}
          <section>
            {result ? (
              <Card className="border-border/60 shadow-sm">
                <CardContent className="space-y-6 p-6 sm:p-8">
                  <div className="flex items-center gap-2 text-primary">
                    <Mail className="size-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      Generated message
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <Label htmlFor="subject" className="text-muted-foreground">
                        Subject
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1.5 text-xs text-muted-foreground"
                        onClick={() => copy(result.subject, "Subject")}
                      >
                        <ClipboardCopy className="size-3.5" />
                        Copy
                      </Button>
                    </div>
                    <p
                      id="subject"
                      className="rounded-md border border-border/70 bg-muted/40 px-4 py-3 font-medium text-foreground"
                    >
                      {result.subject}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <Label htmlFor="body" className="text-muted-foreground">
                        Body
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1.5 text-xs text-muted-foreground"
                        onClick={() => {
                          const full = `Subject: ${result.subject}\n\n${result.body}`;
                          copy(full, "Message");
                        }}
                      >
                        <Check className="size-3.5" />
                        Copy all
                      </Button>
                    </div>
                    <pre
                      id="body"
                      className="whitespace-pre-wrap rounded-md border border-border/70 bg-muted/30 px-4 py-4 font-sans text-sm leading-relaxed text-foreground"
                    >
                      {result.body}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <EmptyState loading={loading} />
            )}
          </section>
        </div>
      </main>

      <footer className="border-t border-border/60 py-6">
        <p className="mx-auto max-w-6xl px-4 text-center text-xs text-muted-foreground sm:px-6 lg:px-8">
          HR Communications Studio · AI-assisted drafts · Review before sending.
        </p>
      </footer>
    </div>
  );
}

function Header() {
  return (
    <header className="border-b border-border/60 bg-card/50 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <Mail className="size-5" />
        </div>
        <div>
          <h1 className="font-heading text-lg font-semibold leading-tight text-foreground">
            HR Communications Studio
          </h1>
          <p className="text-xs text-muted-foreground">
            Clear, empathetic HR messages in seconds
          </p>
        </div>
      </div>
    </header>
  );
}

function EmptyState({ loading }: { loading: boolean }) {
  return (
    <Card className="flex h-full min-h-72 items-center justify-center border-border/60 border-dashed bg-muted/20">
      <CardContent className="p-10 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="size-6" />
        </div>
        <h3 className="font-heading text-base font-semibold text-foreground">
          {loading ? "Drafting your message…" : "Your message will appear here"}
        </h3>
        <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
          Fill in the brief and generate a polished HR communication, ready to copy and send.
        </p>
      </CardContent>
    </Card>
  );
}
