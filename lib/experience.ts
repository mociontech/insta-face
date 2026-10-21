import configuration from "@/config/experience.json";

export type Avatar = {
  avatar: string;
  url: string;
  sourceUrl?: string;
  label: string;
  embedded?: boolean;
  position?: { left: string; top: string; width: string; height: string };
};

export const experience = { ...configuration, avatars: configuration.avatars as Avatar[] };

export function artRect(left: number, top: number, width: number, height: number) {
  return { left: `${left / 10.8}%`, top: `${top / 19.2}%`, width: `${width / 10.8}%`, height: `${height / 19.2}%` };
}

export function screenStyle(screen: keyof typeof experience.screens) {
  const image = experience.screens[screen];
  return image ? { backgroundImage: `url("${image}")`, backgroundSize: "100% 100%" } : undefined;
}
