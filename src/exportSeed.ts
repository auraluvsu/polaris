import { supabase } from "./supabaseClient";
import { seedClients, seedReadme } from "./seedData";

// Drops the title row and the section headings (rows with no body) from the guide.
const seedReadmeItems = () =>
    seedReadme
        .slice(1)
        .filter((row) => row.length > 1)
        .map((row) => ({ title: row[0], body: row[1] ?? "" }));

// Copies the seed clients and guide rows into Supabase. Refuses to run if either
// table already has rows, so it cannot duplicate data. Call it once, while signed in.
export async function exportSeedData() {
    const [existingClients, existingReadme] = await Promise.all([
        supabase.from("clients").select("id", { count: "exact", head: true }),
        supabase.from("readme_items").select("id", { count: "exact", head: true }),
    ]);
    if (existingClients.error) throw existingClients.error;
    if (existingReadme.error) throw existingReadme.error;
    if ((existingClients.count ?? 0) > 0 || (existingReadme.count ?? 0) > 0) {
        throw new Error("Seed export stopped: the tables already contain data.");
    }

    // created_at is set so the seed order is kept, with the first seed client newest.
    const base = Date.now();
    // Only the columns in schema.sql are sent, so extra seed fields cannot break the insert.
    const clientRows = seedClients.map((client, index) => ({
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
        research: client.pipeline.research,
        cold_call: client.pipeline.coldCall,
        meeting_set: client.pipeline.meetingSet,
        meeting_had: client.pipeline.meetingHad,
        sale_call: client.pipeline.saleCall,
        sold: client.pipeline.sold,
        created_at: new Date(base - index * 1000).toISOString(),
    }));
    const readmeRows = seedReadmeItems().map((item, index) => ({ ...item, position: index }));

    const clientsResult = await supabase.from("clients").insert(clientRows);
    if (clientsResult.error) throw clientsResult.error;
    const readmeResult = await supabase.from("readme_items").insert(readmeRows);
    if (readmeResult.error) throw readmeResult.error;

    return { clients: clientRows.length, readmeItems: readmeRows.length };
}
