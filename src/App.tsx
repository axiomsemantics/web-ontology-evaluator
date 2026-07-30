import {
  ArrowLeft, ArrowRight, BookOpenCheck, Check, CircleAlert, ExternalLink,
  FileText, GitBranch, Linkedin, LoaderCircle, Mail, RefreshCw, ShieldCheck, Sparkles, Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { FileDropzone } from "./components/common/FileDropzone";
import { Stepper } from "./components/common/Stepper";
import { Gauge } from "./components/visualizations/Gauge";
import { WordCloud } from "./components/visualizations/WordCloud";
import { AXIOM_WEBSITE, createContactMailto, LINKEDIN_PROFILE } from "./config/contact";
import { extractPdfText } from "./features/documents/pdfExtractor";
import { runAssessment } from "./features/assessment/assessmentService";
import type { AssessmentResult, GoalId, TermResult } from "./features/assessment/assessmentTypes";
import { fileKey, formatBytes, MAX_DOCUMENT_BYTES, MAX_DOCUMENTS } from "./utils/files";

const SAMPLE_ONTOLOGY = `@prefix ex: <https://example.org/logistics#> .
@prefix gufo: <http://purl.org/nemo/gufo#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix skos: <http://www.w3.org/2004/02/skos/core#> .
ex:Asset a owl:Class ; rdfs:label "Business asset"@en ; skos:definition "A resource of value."@en ; rdfs:subClassOf gufo:FunctionalComplex .
ex:Vehicle a owl:Class ; rdfs:label "Fleet vehicle"@en ; rdfs:comment "A vehicle managed by the organization."@en .
ex:Route a owl:Class .
ex:assignedTo a owl:ObjectProperty ; rdfs:label "assigned to"@en .
ex:truck42 a ex:Vehicle ; rdfs:label "Delivery truck"@en .
`;
const SAMPLE_DOCUMENT = "Our fleet vehicle and delivery truck are business assets. Every asset follows an assigned route. Vehicle maintenance supports reliable logistics.";

const GOALS: { id: GoalId; title: string; description: string; icon: typeof Sparkles }[] = [
  { id: "rag", title: "Better LLM responses with Ontology/Graph RAG", description: "Assess whether core graph resources have human-readable context for retrieval.", icon: Sparkles },
  { id: "maintenance", title: "Facilitated long-term maintenance and extension", description: "Identify references to established foundational ontology families.", icon: GitBranch },
  { id: "alignment", title: "Alignment with internal documents and terminology", description: "Compare ontology labels with recurring terms in PDF and text files.", icon: BookOpenCheck },
];

function App() {
  const [step, setStep] = useState(1);
  const [goals, setGoals] = useState<Set<GoalId>>(new Set());
  const [ontology, setOntology] = useState<File | null>(null);
  const [documents, setDocuments] = useState<File[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const toggleGoal = (id: GoalId) => setGoals((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });

  const addOntology = (files: File[]) => {
    setError("");
    const file = files[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) return setError("The ontology exceeds the 25 MB upload limit.");
    if (!/\.(ttl|rdf|owl|nt|nq|trig)$/i.test(file.name)) return setError("Choose a TTL, RDF, OWL, NT, NQ, or TriG ontology file.");
    setOntology(file);
    setStatus(`${file.name} is ready for local parsing.`);
  };

  const addDocuments = (files: File[]) => {
    setError("");
    const invalid = files.find((file) => !/\.(pdf|txt)$/i.test(file.name) || file.size > MAX_DOCUMENT_BYTES);
    if (invalid) return setError(`${invalid.name} is unsupported or exceeds the 15 MB document limit.`);
    setDocuments((current) => {
      const keys = new Set(current.map(fileKey));
      const unique = files.filter((file) => !keys.has(fileKey(file)));
      if (current.length + unique.length > MAX_DOCUMENTS) {
        setError(`You can add up to ${MAX_DOCUMENTS} documents.`);
        return current;
      }
      return [...current, ...unique];
    });
  };

  const loadSample = () => {
    setOntology(new File([SAMPLE_ONTOLOGY], "axiom-logistics-sample.ttl", { type: "text/turtle" }));
    if (goals.has("alignment")) setDocuments([new File([SAMPLE_DOCUMENT], "sample-terminology.txt", { type: "text/plain" })]);
    setError("");
    setStatus("Sample ontology and relevant demo document are ready.");
  };

  const execute = async () => {
    if (!ontology || running) return;
    setRunning(true); setError(""); setStatus("Reading ontology locally…");
    try {
      const texts: string[] = [];
      if (goals.has("alignment")) {
        for (const [index, file] of documents.entries()) {
          setStatus(`Extracting document ${index + 1} of ${documents.length}: ${file.name}`);
          texts.push(file.name.toLowerCase().endsWith(".pdf") ? await extractPdfText(file) : await file.text());
        }
      }
      setStatus("Running SPARQL queries and calculating metrics…");
      const assessment = await runAssessment(ontology, texts);
      setResult(assessment);
      setStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The assessment could not be completed.");
    } finally {
      setRunning(false);
      setStatus("");
    }
  };

  const reset = () => {
    setStep(1); setGoals(new Set()); setOntology(null); setDocuments([]); setResult(null); setError(""); setStatus("");
  };

  return (
    <div className="appShell">
      <Header />
      <main>
        <div className="pageTop">
          <Stepper current={step} />
          {step === 1 && (
            <>
              <Objectives goals={goals} toggle={toggleGoal} onContinue={() => setStep(2)} />
              <Upsell />
            </>
          )}
          {step === 2 && (
            <FilesStep
              goals={goals} ontology={ontology} documents={documents} error={error} status={status} running={running}
              addOntology={addOntology} addDocuments={addDocuments} setOntology={setOntology} setDocuments={setDocuments}
              loadSample={loadSample} execute={execute} back={() => setStep(1)}
            />
          )}
          {step === 3 && result && <Results goals={goals} result={result} reset={reset} />}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="siteHeader">
      <a className="brand" href="#" aria-label="Axiom Ontology Assessment home">
        <span><b>Axiom Semantics</b><small>Ontology Assessment</small></span>
      </a>
      <div className="privacyPill"><ShieldCheck size={16} /> 100% browser-based</div>
    </header>
  );
}

function Objectives({ goals, toggle, onContinue }: { goals: Set<GoalId>; toggle: (id: GoalId) => void; onContinue: () => void }) {
  return (
    <section className="stepSection">
      <h1>What do you need in your ontology project?</h1>
      <p className="lead">Select one or more priorities. We will tailor the assessment to your project goals.</p>
      <div className="goalGrid">
        {GOALS.map(({ id, title, description, icon: Icon }, index) => {
          const selected = goals.has(id);
          return (
            <button key={id} type="button" aria-pressed={selected} className={`goalCard ${selected ? "selected" : ""}`} onClick={() => toggle(id)}>
              <span className="cardNumber">0{index + 1}</span>
              <span className="iconBox"><Icon /></span>
              <strong>{title}</strong><small>{description}</small>
              <span className="checkBox" aria-hidden="true">{selected && <Check size={16} />}</span>
            </button>
          );
        })}
      </div>
      <div className="actions end"><button className="primaryButton" disabled={!goals.size} onClick={onContinue}>Continue <ArrowRight size={17} /></button></div>
    </section>
  );
}

interface FilesProps {
  goals: Set<GoalId>; ontology: File | null; documents: File[]; error: string; status: string; running: boolean;
  addOntology: (files: File[]) => void; addDocuments: (files: File[]) => void;
  setOntology: (file: File | null) => void; setDocuments: (files: File[]) => void;
  loadSample: () => void; execute: () => void; back: () => void;
}

function FilesStep(props: FilesProps) {
  const canRun = props.ontology && (!props.goals.has("alignment") || props.documents.length > 0);
  return (
    <section className="stepSection filesStep">
      <h1>Add your project files</h1>
      <p className="lead">We parse and assess everything in your browser. Remote ontology imports are never downloaded.</p>
      <div className="uploadLayout">
        <section className="uploadPanel">
          <div className="panelHeading"><span>01</span><div><h2>Ontology</h2><p>One RDF ontology or graph is required.</p></div></div>
          {!props.ontology ? (
            <FileDropzone label="Drop your ontology file" hint="TTL, RDF/XML, OWL, NT, NQ or TriG · max 25 MB" accept=".ttl,.rdf,.owl,.nt,.nq,.trig" onFiles={props.addOntology} disabled={props.running} />
          ) : (
            <FileRow file={props.ontology} type="Ontology · format detected during parsing" onRemove={() => props.setOntology(null)} />
          )}
          <button type="button" className="textButton" onClick={props.loadSample}>Try sample ontology <ArrowRight size={15} /></button>
        </section>
        {props.goals.has("alignment") && (
          <section className="uploadPanel">
            <div className="panelHeading"><span>02</span><div><h2>Internal documents</h2><p>Up to 8 PDF or plain-text files.</p></div></div>
            <FileDropzone label="Drop a PDF or text file" hint="PDF or TXT · max 15 MB each" accept=".pdf,.txt" multiple onFiles={props.addDocuments} disabled={props.running} />
            <div className="fileList">
              {props.documents.map((file) => <FileRow key={fileKey(file)} file={file} type={file.type || "Document"} onRemove={() => props.setDocuments(props.documents.filter((item) => fileKey(item) !== fileKey(file)))} />)}
            </div>
          </section>
        )}
      </div>
      <div className="privacyNotice"><ShieldCheck /><div><strong>Your files are processed locally in your browser and are not uploaded to our servers.</strong><small>Files remain in memory only for this session.</small></div></div>
      <div aria-live="polite" className={`liveMessage ${props.error ? "error" : ""}`}>
        {props.error && <CircleAlert size={18} />}{props.running && <LoaderCircle className="spin" size={18} />}{props.error || props.status}
      </div>
      <div className="actions spread">
        <button className="secondaryButton" onClick={props.back} disabled={props.running}><ArrowLeft size={17} /> Back</button>
        <button className="primaryButton" onClick={props.execute} disabled={!canRun || props.running}>
          {props.running ? "Running assessment…" : "Run assessment"} {!props.running && <ArrowRight size={17} />}
        </button>
      </div>
    </section>
  );
}

function FileRow({ file, type, onRemove }: { file: File; type: string; onRemove: () => void }) {
  return (
    <div className="fileRow"><span className="fileIcon"><FileText /></span><div><strong>{file.name}</strong><small>{formatBytes(file.size)} · {type}</small></div><button aria-label={`Remove ${file.name}`} onClick={onRemove}><Trash2 /></button></div>
  );
}

function Results({ goals, result, reset }: { goals: Set<GoalId>; result: AssessmentResult; reset: () => void }) {
  return (
    <section className="stepSection results">
      <div className="resultsHero"><div><h1>Basic ontology assessments</h1><p className="lead">{result.ontologyName} · completed locally in {(result.durationMs / 1000).toFixed(2)} seconds</p></div><button className="secondaryButton" onClick={reset}><RefreshCw size={16} /> New assessment</button></div>
      <div className="statGrid">
        {[["Triples", result.tripleCount], ["Classes", result.classCount], ["Properties", result.propertyCount], ["Named entities", result.namedEntityCount]].map(([label, value]) => <div className="stat" key={label}><strong>{value}</strong><span>{label}</span></div>)}
      </div>
      {goals.has("rag") && <RagResults result={result} />}
      {goals.has("maintenance") && <MaintenanceResults result={result} />}
      {goals.has("alignment") && <AlignmentResults result={result} />}
      <Upsell />
    </section>
  );
}

function RagResults({ result }: { result: AssessmentResult }) {
  return (
    <ResultCard number="01" eyebrow="Graph RAG readiness" title="Labels and definitions">
      <div className="gaugeGrid">
        <Gauge label="Class label coverage" coverage={result.classLabelCoverage} explanation="Classes with a configured label divided by all detected classes." />
        <Gauge label="Class description coverage" coverage={result.classDescriptionCoverage} explanation="Classes with a comment or definition divided by all detected classes." />
        <Gauge label="Named entity label coverage" coverage={result.namedEntityLabelCoverage} explanation="Named graph resources with a configured label divided by all named entities." />
      </div>
      <div className="twoColumns">
        <MissingList title="Classes without labels" values={result.classesWithoutLabel} />
        <MissingList title="Classes without descriptions" values={result.classesWithoutDescription} />
      </div>
    </ResultCard>
  );
}

function MaintenanceResults({ result }: { result: AssessmentResult }) {
  return (
    <ResultCard number="02" eyebrow="Maintainability" title="Foundational ontology references">
      <div className="detectionGrid">
        {result.foundational.map((item) => (
          <article className={`detection ${item.detected ? "detected" : ""}`} key={item.id}>
            <div><span>{item.detected ? <Check /> : "—"}</span><strong>{item.name}</strong></div>
            <b>{item.detected ? "Detected" : "Not detected"}</b>
            {item.detected && <><small>Approx. {item.count} IRI occurrences</small><code title={item.examples.join("\n")}>{item.namespaces[0]}</code></>}
          </article>
        ))}
      </div>
      <p className="infoText">The use of a foundational ontology can support conceptual consistency, interoperability, maintenance, and long-term extension. Its presence alone, however, does not guarantee ontology quality.</p>
    </ResultCard>
  );
}

function AlignmentResults({ result }: { result: AssessmentResult }) {
  const [filter, setFilter] = useState<"all" | "matched" | "missing">("all");
  const visible = useMemo(() => result.terms.filter((term) => filter === "all" || (filter === "matched" ? term.matched : !term.matched)), [filter, result.terms]);
  return (
    <ResultCard number="03" eyebrow="Terminology alignment" title="Documents and ontology labels">
      <div className="alignmentTop">
        <Gauge label="Distinct term alignment" coverage={result.terminologyCoverage} explanation="Distinct relevant document terms found in ontology labels." />
        <div><span className="miniLabel">Frequency-weighted match</span><strong className="bigPercent">{result.weightedTerminologyPercent}%</strong><p>Share of relevant term occurrences represented in ontology labels.</p></div>
      </div>
      {result.terms.length ? <WordCloud terms={result.terms} /> : <div className="emptyState">No relevant document terms were found after normalization.</div>}
      <div className="termHeader"><h3>Accessible term list</h3><div className="filters">{(["all", "matched", "missing"] as const).map((value) => <button className={filter === value ? "active" : ""} onClick={() => setFilter(value)} key={value}>{value}</button>)}</div></div>
      <div className="termTable" role="table" aria-label="Document terminology matches">
        {visible.map((term) => <TermRow key={term.term} term={term} />)}
      </div>
      <p className="infoText">This is an initial lexical assessment. Tailored terminology mappings and domain-specific methods are often necessary for more reliable results.</p>
    </ResultCard>
  );
}

function TermRow({ term }: { term: TermResult }) {
  return <div className="termRow" role="row"><strong>{term.term}</strong><span>{term.frequency}×</span><b className={term.matched ? "positive" : ""}>{term.matched ? "Found" : "Not found"}</b><small>{term.labels.join(", ") || "No matching ontology label"}</small></div>;
}

function ResultCard({ number, eyebrow, title, children }: React.PropsWithChildren<{ number: string; eyebrow: string; title: string }>) {
  return <article className="resultCard"><header><span>{number}</span><div><small>{eyebrow}</small><h2>{title}</h2></div></header>{children}</article>;
}

function MissingList({ title, values }: { title: string; values: string[] }) {
  return <details><summary>{title} <span>{values.length}</span></summary>{values.length ? <ul>{values.map((value) => <li title={value} key={value}>{shortIri(value)}</li>)}</ul> : <p>No examples found.</p>}</details>;
}

function shortIri(iri: string) {
  return decodeURIComponent(iri.split(/[#/]/).filter(Boolean).at(-1) ?? iri);
}

function Upsell() {
  const [replyEmail, setReplyEmail] = useState("");
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyEmail);
  return (
    <section className="upsell">
      <div className="upsellIntro">
        <div className="eyebrow">Go beyond the baseline</div><h2>Specialized Metrics and Assessment</h2>
        <p>For a more detailed evaluation of your ontology-based knowledge graph project, contact Axiom Semantics.</p>
        <div className="contactLinks">
          <a href={AXIOM_WEBSITE} target="_blank" rel="noreferrer">Visit Axiom Semantics <ExternalLink size={15} /></a>
        </div>
      </div>
      <ul><li>In-company training for data specialists and project managers</li><li>Knowledge Graph strategy for AI projects</li><li>KPIs and quality metrics tailored to each project</li><li>Research-backed methodologies for ontology evaluation</li></ul>
      <form className="contactBox" onSubmit={(event) => {
        event.preventDefault();
        if (validEmail) {
          window.location.href = createContactMailto(
            "Axiom Ontology Assessment follow-up",
            `Hi, I'm [your name], from [company].\n\nI saw your ontology evaluator and would like to discuss how Axiom Semantics could support our project.\n\nProject context\n• Primary goal: [Graph RAG / ontology maintenance / terminology alignment / other]\n• Current stage: [planning / modeling / implementation / production]\n• Ontology or knowledge graph size: [approximate classes, triples, or data sources]\n• Main challenge: [briefly describe the issue you are trying to solve]\n• Assessment result or concern: [share any relevant metric or observation]\n• Preferred next step: [introductory call / tailored assessment / training / strategy support]\n\nYou can reply to me at ${replyEmail}.\n\nBest regards,\n[your name]`,
          );
        }
      }}>
        <h3>Ready to take your ontology project further?</h3>
        <a className="linkedinContact" href={LINKEDIN_PROFILE} target="_blank" rel="noreferrer">
          <span className="linkedinIcon"><Linkedin size={18} /></span>
          <span><strong>Reach out on LinkedIn</strong><small>Connect with Rafael Humann Petry</small></span>
          <ExternalLink size={15} />
        </a>
        <div className="contactDivider"><span>or continue by email</span></div>
        <label htmlFor="reply-email">Your email address</label>
        <input id="reply-email" type="email" autoComplete="email" placeholder="you@company.com" value={replyEmail} onChange={(event) => setReplyEmail(event.target.value)} aria-describedby="email-hint" />
        <small id="email-hint">Your address stays in your browser and is only added to the draft email.</small>
        <button className="lightButton" disabled={!validEmail}><Mail size={16} /> Open email draft</button>
      </form>
    </section>
  );
}

function Footer() {
  return <footer><div><span>Axiom Ontology Assessment</span><span>Initial insight. Local processing. Better questions.</span></div><a href={AXIOM_WEBSITE} target="_blank" rel="noreferrer">axiomsemantics.com.br</a></footer>;
}

export default App;
