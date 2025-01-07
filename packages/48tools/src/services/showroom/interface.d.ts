export interface StreamingUrlItem {
  id: number;
  label: 'Automatic' | '普通規格' | 'Medium quality' | '低規格';
  quality?: number;
  type: 'hls_all' | 'hls' | 'lhls';
  url: string;
}

export interface StreamingUrl {
  streaming_url_list: Array<StreamingUrlItem>;
}