
type CellData<T> = {
  value: T;
  note?: string;
}

type NotedActivity = {
  name: string;
  cleanName?: string;
  regions: Record<string, CellData<number>>;
  relics: Record<string, CellData<number>>;
}

import rawActivities from "~/data/generated/skills_v2.json";
import { cleanName } from "./Activity";
import UserSelections from "./UserSelections";
const activitiesV2 = (rawActivities as unknown as NotedActivity[]).map(processRawNotedActivity);

function processRawNotedActivity(activity: NotedActivity) {
  activity.cleanName = cleanName(activity?.name ?? "");
  console.log(activity.cleanName);
  return activity;
}

const notedActivityPoints = (activity: NotedActivity, selections: UserSelections) => {
  const regions = selections.regions.map(x => x.cleanName);
  const relics = selections.relics.map(x => x.cleanName);
  let pts = 0;
  pts = Object.entries(activity.regions).map(x => regions.includes(cleanName(x[0])) ? x[1].value : 0).reduce((a, b) => Math.max(a, b), pts);
  pts = Object.entries(activity.relics).map(x => relics.includes(cleanName(x[0])) ? x[1].value : 0).reduce((a, b) => Math.max(a, b), pts);
  return pts;
};

export default NotedActivity;
export { activitiesV2, notedActivityPoints };