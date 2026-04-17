export const followTags = ["coworker", "friend", "peer", "inspiration"] as const;

export type FollowTag = (typeof followTags)[number];

export const followTagFilterValues = ["all", ...followTags] as const;
export type FollowTagFilter = (typeof followTagFilterValues)[number];

export const followTagSelectValues = ["none", ...followTags] as const;
export type FollowTagSelectValue = (typeof followTagSelectValues)[number];

export function toFollowTagSelectValue(tag: FollowTag | null | undefined): FollowTagSelectValue {
  return tag ?? "none";
}

export function fromFollowTagSelectValue(value: FollowTagSelectValue) {
  return value === "none" ? null : value;
}
