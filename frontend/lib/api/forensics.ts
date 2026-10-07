import { ForensicCase, AnalysisStageStatus } from '@/types/forensics';
import { MOCK_CASES } from '@/lib/mock/cases';
import { transformInvestigationToForensicCase } from '@/lib/api/adapters';

export interface StartInvestigationOptions {
  sampleId?: string;
  rawFile?: File;
  file?: {
    name: string;
    size: number;
    type: string;
    url: string;
    width: number;
    height: number;
  };
  investigationTarget?: string;
  claimContext?: string;
  sourceAttribution?: string;
}

export const FORENSIC_STAGES: Array<{ id: string; name: string; description: string }> = [
  { id: 'ingest', name: 'FORENSIC INGESTION', description: 'Hashing SHA-256, bit-depth verification, raster decoding' },
  { id: 'pixel', name: 'PIXEL FORENSICS', description: 'Error level analysis, noise variance, Laplacian edge discontinuity' },
  { id: 'metadata', name: 'METADATA EXTRACTION', description: 'EXIF, XMP, TIFF quantization tables, thumbnail sync check' },
  { id: 'provenance', name: 'PROVENANCE & C2PA', description: 'Cryptographic manifest validation, root CA certification' },
  { id: 'synthetic', name: 'SYNTHETIC ANALYSIS', description: 'Spectral Fourier analysis, diffusion artifacts, non-Euclidean structures' },
  { id: 'normalization', name: 'EVIDENCE NORMALIZATION', description: 'Standardizing quality, applicability, and signal relationships' },
  { id: 'sufficiency', name: 'SUFFICIENCY ENGINE', description: 'Decision eligibility thresholding & consistency evaluation' },
];

/**
 * Service API abstraction layer for PIXORA forensic investigations.
 * This can be plugged into a real FastAPI / gRPC / Next API backend seamlessly.
 */
export const ForensicsAPI = {
  /**
   * Retrieve list of pre-configured forensic investigation dockets.
   */
  async getAllCases(): Promise<ForensicCase[]> {
    return Object.values(MOCK_CASES);
  },

  /**
   * Retrieve specific case by Case ID.
   */
  async getCaseById(caseId: string): Promise<ForensicCase | null> {
    return MOCK_CASES[caseId] || null;
  },

  /**
   * Run the interactive multi-stage analysis pipeline.
   * Yields progression through the 7 investigative stages.
   */
  async runAnalysisSequence(
    onStageUpdate: (stageIndex: number, stage: AnalysisStageStatus) => void,
    signal?: AbortSignal
  ): Promise<void> {
    const stages: AnalysisStageStatus[] = FORENSIC_STAGES.map((s) => ({
      ...s,
      status: 'QUEUED',
      progress: 0,
    }));

    for (let i = 0; i < stages.length; i++) {
      if (signal?.aborted) return;

      // Mark current stage as analyzing
      stages[i].status = 'ANALYZING';
      stages[i].progress = 30;
      onStageUpdate(i, { ...stages[i] });

      await new Promise((r) => setTimeout(r, 260));
      if (signal?.aborted) return;

      stages[i].progress = 75;
      onStageUpdate(i, { ...stages[i] });

      await new Promise((r) => setTimeout(r, 240));
      if (signal?.aborted) return;

      // Complete stage
      stages[i].status = 'COMPLETE';
      stages[i].progress = 100;
      onStageUpdate(i, { ...stages[i] });
    }
  },

  /**
   * Ingest and initiate investigation for a custom uploaded image.
   * Generates realistic forensic indicators dynamically based on real file properties.
   */
  async startInvestigation(options: StartInvestigationOptions): Promise<ForensicCase> {
    // If a sample is selected, use the deep forensic dossier for that sample
    if (options.sampleId && MOCK_CASES[options.sampleId]) {
      const baseCase = MOCK_CASES[options.sampleId];
      if (options.investigationTarget || options.claimContext) {
        return {
          ...baseCase,
          investigationTarget: options.investigationTarget || baseCase.investigationTarget,
          claimContext: options.claimContext || baseCase.claimContext,
          sourceAttribution: options.sourceAttribution || baseCase.sourceAttribution,
        };
      }
      return baseCase;
    }

    // Live backend ingestion for user's uploaded file (MANDATORY RULE 1 & RULE 2)
    let uploadFile = options.rawFile;
    if (!uploadFile && options.file?.url) {
      try {
        const blob = await fetch(options.file.url).then((r) => r.blob());
        uploadFile = new File([blob], options.file.name, { type: options.file.type });
      } catch (err) {
        // file retrieval error
      }
    }

    if (!uploadFile) {
      throw new Error('NO_FILE_PROVIDED: No file provided for forensic investigation.');
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const rawApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
    const apiUrl = rawApiUrl || (!isProduction ? 'http://localhost:8000' : '');

    if (!apiUrl) {
      throw new Error('CONFIG_ERROR: NEXT_PUBLIC_API_URL environment variable is not configured for production deployment.');
    }

    const formData = new FormData();
    formData.append('file', uploadFile);

    console.log('[PIXORA_FORENSIC_UPLOAD]', {
      filename: uploadFile.name,
      mimeType: uploadFile.type,
      sizeBytes: uploadFile.size,
      timestamp: new Date().toISOString(),
      endpoint: `${apiUrl}/api/investigate`,
    });

    const startTime = performance.now();
    try {
      const response = await fetch(`${apiUrl}/api/investigate`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API_ERROR (${response.status}): ${errorText}`);
      }

      const investigationData = await response.json();
      const durationMs = Math.round(performance.now() - startTime);
      const localUrl = options.file?.url || URL.createObjectURL(uploadFile);

      console.log('[PIXORA_FORENSIC_RESPONSE]', {
        id: investigationData.id,
        imageHash: investigationData.image_hash,
        decision: investigationData.assessment?.final_decision,
        eligibility: investigationData.assessment?.eligibility,
        sufficiency: investigationData.assessment?.sufficiency,
        analyzersCount: investigationData.analyzers?.length,
        evidenceCount: investigationData.evidence?.length,
        relationshipsCount: investigationData.relationships?.length,
      });

      const forensicCase = transformInvestigationToForensicCase(investigationData, uploadFile, localUrl, {
        investigationTarget: options.investigationTarget,
        claimContext: options.claimContext,
      });
      forensicCase.analysisDurationMs = durationMs;

      return forensicCase;
    } catch (networkError: any) {
      // RULE 2: NO SILENT SIMULATION
      // Never silently fall back to simulated forensic results!
      console.error('LIVE FORENSIC BACKEND FAILED:', networkError);
      throw new Error(`FORENSIC_BACKEND_UNAVAILABLE: ${networkError.message || `Cannot reach forensic backend at ${apiUrl}`}`);
    }
  },

  /**
   * Upload an image file for forensic investigation.
   */
  async uploadImage(file: File): Promise<string> {
    return URL.createObjectURL(file);
  },

  /**
   * Retrieve raster and pixel analysis findings for a case.
   */
  async getAnalysis(caseId: string) {
    const c = MOCK_CASES[caseId] || null;
    return c ? c.pixelForensics : null;
  },

  /**
   * Retrieve multi-source evidence signals, completeness, and conflicts for a case.
   */
  async getEvidence(caseId: string) {
    const c = MOCK_CASES[caseId] || null;
    return c
      ? {
          matrix: c.matrix,
          completeness: c.completeness,
          relationships: c.relationships,
          evaluation: c.evaluation,
        }
      : null;
  },

  /**
   * Retrieve final calibrated assessment for a case.
   */
  async getAssessment(caseId: string) {
    const c = MOCK_CASES[caseId] || null;
    return c ? c.assessment : null;
  },

  /**
   * Generate formal forensic case report for a case.
   */
  async generateReport(caseId: string) {
    const c = MOCK_CASES[caseId] || null;
    if (!c) return null;
    return {
      docketId: c.caseId,
      imageHash: c.sha256Hash,
      assessment: c.assessment,
      evaluation: c.evaluation,
      pixelForensics: c.pixelForensics,
      metadata: c.metadata,
      provenance: c.provenance,
      generatedAt: new Date().toISOString(),
    };
  },
};
