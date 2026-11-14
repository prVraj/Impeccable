"use client";

import { Screen } from "@/components/site/tv-screen";
import { TugOfWorkLoader } from "./tug-of-work-loader";

/** The loader on the tube, looping: the person hauls the bar to 100%, cheers, and starts over. */
export default function TugOfWorkLoaderChannel() {
  return (
    <Screen>
      <div className="dots grid h-full place-items-center px-[8%]">
        <TugOfWorkLoader height={36} />
      </div>
    </Screen>
  );
}
