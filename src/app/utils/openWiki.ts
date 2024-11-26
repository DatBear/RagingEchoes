"use client";

import Activity from "~/data/model/Activity";
const baseWikiUrl = 'https://oldschool.runescape.wiki/w/';

const openWiki = (name: string) => {
  const url = baseWikiUrl + name.replace(' ', '_');
  window.open(url, "_wiki");
}

const wikiClick = (activity: Activity | string, isWikiActive: boolean) => {
  if (isWikiActive) {
    if (typeof activity === "string") {
      openWiki(activity);
      return true;
    }
    if ('name' in activity) {
      openWiki(activity.name);
    }
    return true;
  }
  return false;
};

const wikiPointer = (isWikiActive: boolean) => {
  return isWikiActive ? "cursor-pointer" : "";
}

export default openWiki;
export { wikiClick, wikiPointer };