import { NextResponse } from "next/server";
import { getAllVehicles } from "@/lib/crsp";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const make = searchParams.get("make");
  const model = searchParams.get("model");

  if (!make) {
    return NextResponse.json({ error: "Make is required" }, { status: 400 });
  }

  const searchMake = make.toLowerCase();
  const searchModel = model?.toLowerCase();

  const results = getAllVehicles().filter((item) => {
    const itemMake = item.Make?.toLowerCase();
    if (!itemMake?.includes(searchMake)) return false;

    if (searchModel) {
      const itemModel = item.Model?.toLowerCase();
      return itemModel?.includes(searchModel);
    }
    return true;
  });

  return NextResponse.json(results.slice(0, 20));
}
