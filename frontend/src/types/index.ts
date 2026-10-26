export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface VoiceInfo {
  id: string;
  name: string;
  language: string;
  gender: string;
  sample_text: string;
  description: string;
}

export interface GenerationJob {
  id: string;
  status: JobStatus;
  stage_message: string;
  script_text: string;
  voice_id: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  output_video_url?: string;
  error_code?: string;
  error_message?: string;
}
