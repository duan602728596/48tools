export interface PhotoItem {
  caption: string;
  manifest: {
    adaptationSet: Array<{
      representation: Array<{
        url: string;
      }>;
    }>;
  };
}

export interface ShortVideoDownloadResponse {
  errors?: Array<{
    message: string;
  }>;
  data: {
    visionVideoDetail: {
      photo: PhotoItem | null;
    };
    captcha?: {
      url: string;
    };
    url?: string;
  };
}