import type { DateLogSettings, LogEntry, Schedule } from "./types";

export const settings: DateLogSettings = {
  title: "우리의 러브 다이어리",
  themeColor: "#FF69B4",
  myName: "나",
  partnerName: "연인",
  labels: [
    { name: "기념일", color: "#FF69B4" },
    { name: "데이트", color: "#8B5CF6" },
    { name: "여행", color: "#38BDF8" },
    { name: "맛집", color: "#F59E0B" },
  ],
};

export const schedules: Schedule[] = [
  {
    id: "schedule-1",
    date: "2026-05-15",
    title: "성수동 저녁 데이트",
    time: "19:30",
    label: "데이트",
    memo: "예약 확인하고 작은 꽃다발 챙기기",
  },
  {
    id: "schedule-2",
    date: "2026-05-18",
    title: "전시회 보기",
    time: "14:00",
    label: "데이트",
    memo: "티켓은 모바일 예매함에 있음",
  },
  {
    id: "schedule-3",
    date: "2026-05-23",
    title: "춘천 당일치기",
    time: "09:10",
    label: "여행",
    memo: "ITX 시간 맞춰 출발",
  },
  {
    id: "schedule-4",
    date: "2026-06-02",
    title: "300일",
    time: "20:00",
    label: "기념일",
    memo: "케이크 픽업",
  },
];

export const logs: LogEntry[] = [
  {
    id: "log-1",
    date: "2026-05-04",
    ratingMy: 5,
    ratingPartner: 5,
    reviewMy: "날씨가 좋아서 걷는 시간까지 전부 기억에 남았다.",
    reviewPartner: "사진보다 실제 노을이 더 예뻤고, 다음에도 여기 오고 싶다.",
    photos: [
      {
        id: "photo-1",
        url: "https://images.unsplash.com/photo-1495567720989-cebdbdd97913?auto=format&fit=crop&w=900&q=80",
        location: "한강공원",
        myComment: "돗자리 펴고 먹은 샌드위치가 생각보다 완벽했다.",
        partnerComment: "바람이 조금 불었지만 그래서 더 좋았다.",
      },
    ],
  },
  {
    id: "log-2",
    date: "2026-05-12",
    ratingMy: 4,
    ratingPartner: 5,
    reviewMy: "새로 찾은 카페가 조용해서 오래 이야기하기 좋았다.",
    reviewPartner: "라떼가 맛있고 창가 자리가 예뻤다.",
    photos: [
      {
        id: "photo-2",
        url: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=900&q=80",
        location: "연남동 작은 카페",
        myComment: "디저트는 다음에 다른 메뉴로 다시 도전.",
        partnerComment: "창가 조명이 사진을 예쁘게 만들어줬다.",
      },
    ],
  },
  {
    id: "log-3",
    date: "2026-05-15",
    ratingMy: 5,
    ratingPartner: 4,
    reviewMy: "오랜만에 둘 다 퇴근 후 여유가 있어서 좋았다.",
    reviewPartner: "짧았지만 편안한 하루였다.",
    photos: [],
  },
];
