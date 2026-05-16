export type Label = {
  name: string;
  color: string;
};

export type Schedule = {
  id: string;
  date: string;
  title: string;
  time: string;
  label: string;
  memo: string;
};

export type PhotoMemory = {
  id: string;
  url: string;
  location: string;
  myComment: string;
  partnerComment: string;
};

export type LogEntry = {
  id: string;
  date: string;
  ratingMy: number;
  ratingPartner: number;
  reviewMy: string;
  reviewPartner: string;
  photos: PhotoMemory[];
  title?: string;
};

export type DateLogSettings = {
  title: string;
  themeColor: string;
  myName: string;
  partnerName: string;
  labels: Label[];
};
