// keep in sync with xcode/Sources/ParlanceKit/Models/Origin.swift
// Swift port: jpace-cloud/parlance (xcode/Sources/ParlanceKit/Models/Origin.swift)

export type SnapshotRef = {
  url: string;
  capturedAt: string;
  sha256?: string;
};

export type TokenRef = {
  name: string;
  value?: string;
};

export type ComponentRef = {
  key: string;
  name: string;
};

export type Origin =
  | {
      type: 'figma_frame';
      fileKey: string;
      nodeId: string;
      version?: string;
      snapshot: SnapshotRef;
      resolvedTokens?: TokenRef[];
      resolvedComponents?: ComponentRef[];
    }
  | {
      type: 'live_url';
      url: string;
      viewport: { w: number; h: number };
      capturedAt: string;
      snapshot: SnapshotRef;
      domDump?: string;
    }
  | {
      type: 'image_upload';
      snapshot: SnapshotRef;
      originalFilename: string;
      uploadedBy: string;
    }
  | {
      type: 'code_component';
      repoUrl: string;
      path: string;
      ref: string;
      storyName?: string;
      snapshot: SnapshotRef;
    }
  | {
      type: 'generated';
      prompt: string;
      model: string;
      snapshot: SnapshotRef;
    }
  | {
      type: 'legacy';
      migratedAt: string;
    }
  | {
      type: 'unspecified';
      stampedAt: string;
    };

// Origin types that clients are allowed to submit on writes.
// `legacy` and `unspecified` are server-managed.
export type ClientOrigin = Exclude<
  Origin,
  { type: 'legacy' } | { type: 'unspecified' }
>;
