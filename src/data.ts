import { supabase } from "./supabaseClient";

export type Stage = "research" | "coldCall" | "meetingSet" | "meetingHad" | "saleCall" | "sold";
export type StageState = "not-done" | "pending" | "rejected" | "done";

export type RunningComment = { date: Date; comment: string };

export type Client = {
    id: string;
    priority: string;
    business: string;
    address: string;
    phone: string;
    rating: number | null;
    reviews: number | null;
    reason: string;
    called: string;
    outcome: string;
    notes: string;
    paid: number | null;
    pipeline: Record<Stage, StageState>;
    runningComments: RunningComment[];
};

export type ReadmeItem = { id: number; title: string; body: string };

// Maps each app stage to its column in public.clients.
const stageColumns: Record<Stage, string> = {
    research: "research",
    coldCall: "cold_call",
    meetingSet: "meeting_set",
    meetingHad: "meeting_had",
    saleCall: "sale_call",
    sold: "sold",
};

type ClientRow = {
    id: string;
    priority: string | null;
    business: string | null;
    address: string | null;
    phone: string | null;
    rating: number | null;
    reviews: number | null;
    reason: string | null;
    called: string | null;
    outcome: string | null;
    notes: string | null;
    paid: number | null;
    running_comments: { date: string; comment: string }[] | null;
} & Record<string, unknown>;

export const emptyPipeline = (): Record<Stage, StageState> => ({
    research: "not-done",
    coldCall: "not-done",
    meetingSet: "not-done",
    meetingHad: "not-done",
    saleCall: "not-done",
    sold: "not-done",
});

export const errorMessage = (err: unknown) =>
    typeof err === "object" && err !== null && "message" in err
        ? String(err.message)
        : "Something went wrong while talking to the database.";

// Converts a database row into the app's Client shape. Nullable text columns become "".
function fromRow(row: ClientRow): Client {
    const pipeline = emptyPipeline();
    (Object.keys(stageColumns) as Stage[]).forEach((stage) => {
        const value = row[stageColumns[stage]];
        if (typeof value === "string") pipeline[stage] = value as StageState;
    });
    return {
        id: row.id,
        priority: row.priority ?? "B",
        business: row.business ?? "",
        address: row.address ?? "",
        phone: row.phone ?? "",
        rating: row.rating,
        reviews: row.reviews,
        reason: row.reason ?? "",
        called: row.called ?? "",
        outcome: row.outcome ?? "",
        notes: row.notes ?? "",
        paid: row.paid,
        pipeline,
        runningComments: (row.running_comments ?? []).map((item) => ({
            date: new Date(item.date),
            comment: item.comment,
        })),
    };
}

// Turns a pipeline into the six stage columns of public.clients.
function stageRow(pipeline: Record<Stage, StageState>) {
    return Object.fromEntries(
        (Object.keys(stageColumns) as Stage[]).map((stage) => [
            stageColumns[stage],
            pipeline[stage],
        ]),
    );
}

// Dates are stored as ISO strings inside the running_comments jsonb column.
function commentRows(comments: RunningComment[]) {
    return comments.map((item) => ({
        date: item.date.toISOString(),
        comment: item.comment,
    }));
}

// Converts the app's Client into the columns of public.clients (without id and created_at).
function toRow(client: Client) {
    return {
        priority: client.priority,
        business: client.business,
        address: client.address,
        phone: client.phone,
        rating: client.rating,
        reviews: client.reviews,
        reason: client.reason,
        called: client.called,
        outcome: client.outcome,
        notes: client.notes,
        paid: client.paid,
        running_comments: commentRows(client.runningComments),
        ...stageRow(client.pipeline),
    };
}

export async function fetchClients(): Promise<Client[]> {
    const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });
    if (error) throw error;
    return ((data ?? []) as ClientRow[]).map(fromRow);
}

export async function fetchReadme(): Promise<ReadmeItem[]> {
    const { data, error } = await supabase
        .from("readme_items")
        .select("id, title, body")
        .order("position", { ascending: true });
    if (error) throw error;
    return data ?? [];
}

// New clients have an empty id; the database generates it on insert.
export async function saveClient(client: Client): Promise<void> {
    const row = toRow(client);
    const result = client.id
        ? await supabase.from("clients").update(row).eq("id", client.id)
        : await supabase.from("clients").insert(row);
    if (result.error) throw result.error;
}

export async function updateClientPipeline(
    id: string,
    pipeline: Record<Stage, StageState>,
): Promise<void> {
    // Only the six stage columns are written, so the rest of the client row is left alone.
    const { error } = await supabase.from("clients").update(stageRow(pipeline)).eq("id", id);
    if (error) throw error;
}

export async function updateClientCommentary(
    id: string,
    runningComments: RunningComment[],
): Promise<void> {
    // Only the commentary column is written, so the rest of the client row is left alone.
    const { error } = await supabase
        .from("clients")
        .update({ running_comments: commentRows(runningComments) })
        .eq("id", id);
    if (error) throw error;
}

export async function deleteClient(id: string): Promise<void> {
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) throw error;
}

export async function saveReadmeItem(item: ReadmeItem): Promise<void> {
    const { error } = await supabase
        .from("readme_items")
        .update({ title: item.title, body: item.body })
        .eq("id", item.id);
    if (error) throw error;
}
