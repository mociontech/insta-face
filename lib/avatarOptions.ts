export interface AvatarOption {
  id: string;
  label: string;
  gender: "Hombre" | "Mujer";
  previewImageUrl: string;
  sourceFileName: string;
  storageFileName: string;
}

export const avatarOptions: AvatarOption[] = [
  {
    id: "group-218",
    label: "Avatar 1",
    gender: "Mujer",
    previewImageUrl: "/Group%20218.png",
    sourceFileName: "Group 218.png",
    storageFileName: "group-218.png",
  },
  {
    id: "group-219",
    label: "Avatar 2",
    gender: "Hombre",
    previewImageUrl: "/Group%20219.png",
    sourceFileName: "Group 219.png",
    storageFileName: "group-219.png",
  },
  {
    id: "group-220",
    label: "Avatar 3",
    gender: "Mujer",
    previewImageUrl: "/Group%20220.png",
    sourceFileName: "Group 220.png",
    storageFileName: "group-220.png",
  },
  {
    id: "group-221",
    label: "Avatar 4",
    gender: "Hombre",
    previewImageUrl: "/Group%20221.png",
    sourceFileName: "Group 221.png",
    storageFileName: "group-221.png",
  },
  {
    id: "group-222",
    label: "Avatar 5",
    gender: "Hombre",
    previewImageUrl: "/Group%20222.png",
    sourceFileName: "Group 222.png",
    storageFileName: "group-222.png",
  },
  {
    id: "group-223",
    label: "Avatar 6",
    gender: "Mujer",
    previewImageUrl: "/Group%20223.png",
    sourceFileName: "Group 223.png",
    storageFileName: "group-223.png",
  },
  {
    id: "group-224",
    label: "Avatar 7",
    gender: "Mujer",
    previewImageUrl: "/Group%20224.png",
    sourceFileName: "Group 224.png",
    storageFileName: "group-224.png",
  },
  {
    id: "group-225",
    label: "Avatar 8",
    gender: "Hombre",
    previewImageUrl: "/Group%20225.png",
    sourceFileName: "Group 225.png",
    storageFileName: "group-225.png",
  },
];

export interface AvatarPairOption {
  id: string;
  label: string;
  femaleAvatarId: string;
  maleAvatarId: string;
}

export const avatarPairOptions: AvatarPairOption[] = [
  {
    id: "option-1",
    label: "Opción 1",
    femaleAvatarId: "group-218",
    maleAvatarId: "group-219",
  },
  {
    id: "option-2",
    label: "Opción 2",
    femaleAvatarId: "group-220",
    maleAvatarId: "group-221",
  },
  {
    id: "option-3",
    label: "Opción 3",
    femaleAvatarId: "group-223",
    maleAvatarId: "group-222",
  },
  {
    id: "option-4",
    label: "Opción 4",
    femaleAvatarId: "group-224",
    maleAvatarId: "group-225",
  },
];

export function getAvatarOption(selectedImage: string) {
  return avatarOptions.find((avatar) => avatar.id === selectedImage);
}

export function getAvatarIdForPair(
  pairId: string,
  gender: string
) {
  const pair = avatarPairOptions.find((avatar) => avatar.id === pairId);

  if (!pair) {
    return null;
  }

  return gender === "Mujer" ? pair.femaleAvatarId : pair.maleAvatarId;
}
