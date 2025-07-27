export interface MultilingualContent {
  ar?: string;
  fr?: string;
  en?: string;
  [key: string]: string | undefined;
}

export interface Feature {
  title: MultilingualContent;
  description?: MultilingualContent;
  icon?: string;
  category?: string;
  isHighlighted?: boolean;
  order?: number;
} 