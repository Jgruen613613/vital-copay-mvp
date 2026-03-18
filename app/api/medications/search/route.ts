import { NextRequest, NextResponse } from "next/server";
import { supabase, usesMockData } from "@/lib/supabase";
import { medications as mockMeds } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query");

  if (!query || query.trim().length === 0) {
    return NextResponse.json([]);
  }

  const q = query.trim().toLowerCase();

  if (usesMockData) {
    const filtered = mockMeds
      .filter((med) => {
        if (med.generic_name.toLowerCase().includes(q)) return true;
        return med.brand_names.some((b) => b.toLowerCase().includes(q));
      })
      .map(({ id, generic_name, brand_names, drug_class }) => ({
        id,
        generic_name,
        brand_names,
        drug_class,
      }))
      .slice(0, 10);
    return NextResponse.json(filtered);
  }

  const { data, error } = await supabase
    .from("medications")
    .select("id, generic_name, brand_names, drug_class")
    .order("generic_name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const filtered = (data || [])
    .filter((med) => {
      if (med.generic_name.toLowerCase().includes(q)) return true;
      const brands = med.brand_names as string[];
      return brands.some((b) => b.toLowerCase().includes(q));
    })
    .slice(0, 10);

  return NextResponse.json(filtered);
}
