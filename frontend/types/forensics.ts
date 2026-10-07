export type EvidenceStatus = 
  | 'VERIFIED'
  | 'SUPPORTED'
  | 'WEAK'
  | 'UNKNOWN'
  | 'CONFLICT'
  | 'MISSING'
  | 'WARNING'
  | 'SUSPICIOUS'
  | 'PARTIAL';

export type RelationshipType = 
  | 'supports'
  | 'conflicts'
  | 'consistent_with'
  | 'not_established'
  | 'missing'
  | 'unknown';
export type AssessmentOutcome = 
  | 'INCONCLUSIVE'
  | 'SUPPORTED MANIPULATION'
  | 'LIKELY MANIPULATED'
  | 'NO SIGNIFICANT MANIPULATION EVIDENCE'
  | 'CONFLICTING EVIDENCE'
  | 'INSUFFICIENT EVIDENCE'
  | 'MANUAL REVIEW REQUIRED'
  | 'SUPPORTED_MANIPULATION'
  | 'LIKELY_MANIPULATED'
  | 'NO_SIGNIFICANT_MANIPULATION_EVIDENCE'
  | 'CONFLICTING_EVIDENCE'
  | 'INSUFFICIENT_EVIDENCE'
  | 'MANUAL_REVIEW_REQUIRED'
  | 'UNKNOWN'
  | string;

export type SufficiencyLevel = 'SUFFICIENT' | 'PARTIAL' | 'INSUFFICIENT' | 'CRITICAL_MISSING';
export type EligibilityStatus = 'PASSED' | 'FAILED' | 'BLOCKED';

export interface SuspiciousRegion {
  id: string;
  label: string;
  type: string;
  confidence: number;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  technique: string;
  observation: string;
  limitations: string;
}

export interface PixelForensicsData {
  status: 'localized_anomaly' | 'uniform_compression' | 'adversarial_noise' | 'clean';
  statusLabel: string;
  confidence: number;
  technique: string;
  regions: SuspiciousRegion[];
  elaVariance: number;
  noiseConsistency: number;
  edgeGradientScore: number;
  modelConfidence: number;
  limitations: string;
}

export interface MetadataRecord {
  key: string;
  label: string;
  value: string;
  status: 'VERIFIED' | 'WARNING' | 'SUSPICIOUS' | 'UNKNOWN';
  note?: string;
}

export interface MetadataForensicsData {
  software: string;
  softwareWarning?: string;
  format: string;
  dimensions: string;
  width: number;
  height: number;
  colorProfile: string;
  cameraMakeModel: string;
  timestamp: string;
  jpegCharacteristics: string;
  exifIntact: boolean;
  thumbnailMatch: boolean;
  fileHashSha256: string;
  records: MetadataRecord[];
  advisory: string;
}

export interface ProvenanceData {
  status: 'VERIFIED' | 'INVALID' | 'MISSING' | 'PARTIAL';
  credentialStatus: string;
  manifestPresent: boolean;
  signatureValid: boolean;
  issuer?: string;
  creationAssertion?: string;
  editingAssertion?: string;
  aiRelatedAssertion?: string;
  historyChainCount: number;
  cryptographicDigest: string;
  advisory: string;
}

export interface SyntheticAnalysisData {
  status: 'NO_SYNTHETIC_MARKERS' | 'DIFFUSION_ARTIFACTS' | 'GAN_SIGNATURE' | 'FACE_WARPING_DETECTED';
  label: string;
  generatorProbability: number;
  frequencyDomainAnomaly: number;
  textureDiscontinuity: number;
  detail: string;
}

export interface EvidenceMatrixItem {
  id: string;
  source: 'PIXEL FORENSICS' | 'METADATA' | 'PROVENANCE' | 'SYNTHETIC ANALYSIS' | 'CONTEXT/CLAIM';
  observation: string;
  quality: 'HIGH' | 'MEDIUM' | 'LOW';
  applicability: 'HIGH' | 'MEDIUM' | 'LOW';
  relationship: 'SUPPORTS' | 'CONFLICT' | 'CONSISTENT' | 'NOT_ESTABLISHED' | 'MISSING';
  status: 'VERIFIED' | 'SUPPORTED' | 'WARNING' | 'CONFLICT' | 'MISSING';
  detail: string;
}

export interface EvidenceRelationship {
  from: string;
  to: string;
  type: RelationshipType;
  label: string;
  conflictReason?: string;
}

export interface CompletenessItem {
  name: string;
  status: 'AVAILABLE' | 'PARTIAL' | 'MISSING';
  weight: number;
  score: number;
  note: string;
}

export interface DecisionEvaluation {
  evidenceAvailabilityScore: number; // 0 - 100
  evidenceQualityScore: number;      // 0 - 100
  applicabilityScore: number;        // 0 - 100
  consistencyScore: number;          // 0 - 100
  completenessScore: number;         // 0 - 100
  uncertaintyScore: number;          // 0 - 100
  sufficiency: SufficiencyLevel;
  eligibility: EligibilityStatus;
  thresholdMet: boolean;
  blockReason?: string;
  summary: string;
}

export interface EstablishedFinding {
  type: 'established' | 'unestablished';
  text: string;
  confidenceOrReason: string;
}

export interface ForensicCase {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  thumbnailUrl?: string;
  originalFileName: string;
  fileSizeBytes: number;
  fileFormat: string;
  uploadedAt: string;
  investigationTarget: string;
  claimContext?: string;
  sourceAttribution?: string;

  // Analysis telemetry
  analysisDurationMs: number;
  caseId: string;
  sha256Hash: string;
  sha1Hash: string;
  md5Hash: string;

  // Analysis modules
  pixelForensics: PixelForensicsData;
  metadata: MetadataForensicsData;
  provenance: ProvenanceData;
  synthetic: SyntheticAnalysisData;

  // Intelligence
  matrix: EvidenceMatrixItem[];
  relationships: EvidenceRelationship[];
  completeness: {
    overallPercentage: number;
    items: CompletenessItem[];
  };

  // Evaluation & Assessment
  evaluation: DecisionEvaluation;
  assessment: {
    outcome: AssessmentOutcome;
    subtitle: string;
    whatEstablished: string[];
    whatCannotBeEstablished: string[];
    missingEvidence?: string[];
    limitations?: string[];
    eligibility?: string;
    sufficiency?: string;
    recommendedAction: string;
    chainOfCustodyVerified: boolean;
    investigatorNotes: string;
  };

  backendUnavailable?: boolean;
  backendError?: string;
  rawInvestigation?: any;
}

export interface AnalysisStageStatus {
  id: string;
  name: string;
  description: string;
  status: 'QUEUED' | 'ANALYZING' | 'COMPLETE' | 'UNAVAILABLE';
  progress: number;
  detail?: string;
}
