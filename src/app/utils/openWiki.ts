"use client";

import { MouseEventHandler } from "react";
import Activity from "~/data/model/Activity";
import NotedActivity from "~/data/model/NotedActivity";
const baseWikiUrl = 'https://oldschool.runescape.wiki/w/';

const wikiUrl = (name: string) => {
  const url = baseWikiUrl + name.replaceAll(' ', '_');
  return url;
}

const openWiki = (name: string) => {
  window.open(wikiUrl(name), "_wiki");
}

const wikiClick = (activity: Activity | NotedActivity | string, isWikiActive: boolean) => {
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

type LinkProps = {
  target?: string;
  href?: string
  onClick?: MouseEventHandler<HTMLAnchorElement> | undefined
}

const wikiLinkProps = (activity: Activity | NotedActivity | string, isWikiActive = true) => {
  const props: LinkProps = {
    target: "_wiki"
  };

  const onClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    wikiClick(activity, true);
  }

  if (isWikiActive) {
    if (typeof activity === "string") {
      props.href = wikiUrl(activity);
      props.onClick = onClick;
    }
    else if ('name' in activity) {
      props.href = wikiUrl(activity.name);
      props.onClick = onClick;
    }
  }
  return props;
}

const wikiPointer = (isWikiActive: boolean) => {
  return isWikiActive ? "wiki-link" : "";
}

export default openWiki;
export { wikiClick, wikiPointer, wikiLinkProps };