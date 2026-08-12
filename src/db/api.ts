import { supabase } from "@/client/supabase";
import type { Document, DocumentType, DocumentStatus, UserPreferences } from "@/types/types";

// ---- Documents ----

export async function getDocuments(options?: {
  type?: DocumentType;
  isFavorite?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
  includeArchived?: boolean;
}) {
  let query = supabase
    .from("documents")
    .select("*")
    .order("updated_at", { ascending: false });

  // Exclude archived by default
  if (!options?.includeArchived) {
    query = query.neq("status", "archived");
  }

  if (options?.type) query = query.eq("type", options.type);
  if (options?.isFavorite) query = query.eq("is_favorite", true);
  if (options?.search) {
    query = query.or(
      `title.ilike.%${options.search}%,subject.ilike.%${options.search}%,topic.ilike.%${options.search}%`
    );
  }
  if (options?.limit) query = query.limit(options.limit);
  if (options?.offset) query = query.range(options.offset, (options.offset + (options?.limit ?? 20)) - 1);

  const { data, error } = await query;
  if (error) throw error;
  return Array.isArray(data) ? (data as Document[]) : [];
}

export async function getArchivedDocuments() {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("status", "archived")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return Array.isArray(data) ? (data as Document[]) : [];
}

export async function unarchiveDocument(id: string) {
  await updateDocument(id, { status: "complete" });
}

export async function getFavoriteDocuments(limit = 10) {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("is_favorite", true)
    .neq("status", "archived")
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return Array.isArray(data) ? (data as Document[]) : [];
}

export async function getRecentDocuments(limit = 5) {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .neq("status", "archived")
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return Array.isArray(data) ? (data as Document[]) : [];
}

export async function getDocumentById(id: string) {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as Document | null;
}

export async function createDocument(doc: Omit<Document, "id" | "user_id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase
    .from("documents")
    .insert(doc)
    .select()
    .single();
  if (error) throw error;
  return data as Document;
}

export async function updateDocument(id: string, updates: Partial<Omit<Document, "id" | "user_id" | "created_at">>) {
  const { error } = await supabase
    .from("documents")
    .update(updates)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteDocument(id: string) {
  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function toggleFavorite(id: string, isFavorite: boolean) {
  const { error } = await supabase
    .from("documents")
    .update({ is_favorite: isFavorite })
    .eq("id", id);
  if (error) throw error;
}

export async function duplicateDocument(id: string) {
  const doc = await getDocumentById(id);
  if (!doc) throw new Error("Document not found");
  const { id: _, user_id, created_at, updated_at, ...rest } = doc;
  return createDocument({ ...rest, title: `${rest.title} (Copy)`, status: "draft" });
}

export async function archiveDocument(id: string) {
  await updateDocument(id, { status: "archived" });
}

// ---- Document Counts ----

export async function getDocumentCounts() {
  // Use count to avoid fetching all rows
  const { count, error } = await supabase
    .from("documents")
    .select("*", { count: "exact", head: true })
    .neq("status", "archived");
  if (error) throw error;
  return { total: count ?? 0, byType: {} as Record<string, number> };
}

// ---- AI Usage ----

export async function getMonthlyUsage() {
  const firstOfMonth = new Date();
  firstOfMonth.setDate(1);
  firstOfMonth.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("ai_usage")
    .select("document_type, tokens_used, created_at")
    .gte("created_at", firstOfMonth.toISOString())
    .order("created_at", { ascending: false });
  if (error) throw error;
  const records = Array.isArray(data) ? data : [];
  return {
    total_generations: records.length,
    total_tokens: records.reduce((sum, r) => sum + (r.tokens_used || 0), 0),
    by_type: records.reduce((acc: Record<string, number>, r) => {
      acc[r.document_type] = (acc[r.document_type] || 0) + 1;
      return acc;
    }, {}),
  };
}

// ---- User Preferences ----

export async function getUserPreferences(userId: string) {
  const { data, error } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as UserPreferences | null;
}

export async function upsertUserPreferences(userId: string, prefs: Partial<UserPreferences>) {
  const { error } = await supabase
    .from("user_preferences")
    .upsert({ ...prefs, user_id: userId }, { onConflict: "user_id" });
  if (error) throw error;
}

// ---- AI Generation ----

export async function generateContent(type: DocumentType, inputs: Record<string, string>) {
  const { data, error } = await supabase.functions.invoke("generate-content", {
    body: { type, inputs },
    method: "POST",
  });

  if (error) {
    const msg = await error?.context?.text?.();
    throw new Error(msg || error.message || "AI generation failed");
  }

  return data as { content: Record<string, unknown>; tokens_used: number };
}
