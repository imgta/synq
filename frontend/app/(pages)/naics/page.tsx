import { apiFetch } from "@/api";

export default async function NaicsData() {
  const res = await apiFetch('/data');
  const { data } = res;

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">NAICS Data</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-[80vh]">
        {JSON.stringify(data, null, 2)}
      </pre>
    </main>
  );
}