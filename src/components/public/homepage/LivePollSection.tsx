import { getActivePoll } from "@/actions/polls";
import { LivePollWidget } from "./LivePollWidget";

export async function LivePollSection() {
  try {
    const poll = await getActivePoll();
    if (!poll) return null;
    return <LivePollWidget initialPoll={poll} />;
  } catch (error) {
    console.error("LivePollSection error:", error);
    return null;
  }
}
