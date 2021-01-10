import { EventEmitter } from "events";
import { parse as parseUrl, UrlWithParsedQuery } from "url";
import { stringify as stringifyQueryString, ParsedUrlQuery } from "querystring";

import type { NextRouter } from "next/router";

/**
 * Creates a URL from a pathname + query.
 * Injects query params into the URL slugs, the same way that next/router does.
 */
function getRouteAsPath(pathname: string, query: ParsedUrlQuery) {
  const remainingQuery = { ...query };

  // Replace slugs, and remove them from the `query`
  let asPath = pathname.replace(
    /\[(.+?)]/g,
    ($0, slug: keyof ParsedUrlQuery) => {
      const value = remainingQuery[slug]!;
      delete remainingQuery[slug];

      return encodeURIComponent(String(value));
    }
  );

  // Append remaining query as a querystring, if needed:
  const qs = stringifyQueryString(remainingQuery);

  if (qs) asPath = `${asPath}?${qs}`;

  return asPath;
}

type UrlObject = {
  pathname: UrlWithParsedQuery["pathname"];
  query?: UrlWithParsedQuery["query"];
};
type Url = string | UrlObject;

/**
 * A base implementation of NextRouter that does nothing; all methods throw.
 */
export abstract class BaseRouter implements NextRouter {
  isReady = false;
  route = "";
  pathname = "";
  query = {} as ParsedUrlQuery;
  asPath = "";
  basePath = "";
  isFallback = false;
  events = new EventEmitter();

  push = async (url: Url): Promise<boolean> => {
    throw new Error("NotImplemented");
  };
  replace = async (url: Url): Promise<boolean> => {
    throw new Error("NotImplemented");
  };
  back = () => {
    throw new Error("NotImplemented");
  };
  beforePopState = () => {
    throw new Error("NotImplemented");
  };
  prefetch = () => {
    throw new Error("NotImplemented");
  };
  reload = () => {
    throw new Error("NotImplemented");
  };
}

/**
 * An implementation of NextRouter that does not change the URL, but just stores the current route in memory.
 *
 * Currently only supports the `push` and `replace` methods.
 * TODO: Implement more methods!
 */
export class MemoryRouter extends BaseRouter {
  push = async (url: Url) => {
    this.setMemoryRoute(url);

    return true;
  };

  replace = async (url: Url) => {
    this.setMemoryRoute(url);

    return true;
  };

  /**
   * Sets the current route to the specified url.
   * @param url - String or Url-like object
   */
  setMemoryRoute = (url: Url) => {
    // Parse the URL if needed:
    const urlObject = typeof url === "string" ? parseUrl(url, true) : url;

    this.pathname = urlObject.pathname || "";
    this.query = urlObject.query || {};
    this.asPath = getRouteAsPath(this.pathname, this.query);

    this.events.emit("routeChangeComplete");
  };
}
